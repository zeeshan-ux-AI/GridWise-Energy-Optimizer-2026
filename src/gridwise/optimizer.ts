import solver from "javascript-lp-solver";
import {
  GridWiseError,
  type BatteryInput,
  type HourlyPlan,
  type OptimizeRequest,
} from "./types";
import {
  activeMinimum,
  effectiveSolar,
  type AppliedDirectives,
} from "./directives";

type LinearModel = {
  optimize: string;
  opType: "min";
  constraints: Record<string, { min?: number; max?: number; equal?: number }>;
  variables: Record<string, Record<string, number>>;
  binaries: Record<string, 1>;
};

function addCoefficient(
  variables: LinearModel["variables"],
  variable: string,
  constraint: string,
  coefficient: number,
): void {
  variables[variable] ??= {};
  variables[variable][constraint] = coefficient;
}

function addBound(
  model: LinearModel,
  variable: string,
  constraint: string,
  bound: { min?: number; max?: number; equal?: number },
): void {
  model.constraints[constraint] = bound;
  addCoefficient(model.variables, variable, constraint, 1);
}

export function optimizeSchedule(
  request: OptimizeRequest,
  directives: AppliedDirectives,
): HourlyPlan[] {
  const battery = request.battery;
  const model: LinearModel = {
    optimize: "cost",
    opType: "min",
    constraints: {},
    variables: {},
    binaries: {},
  };

  for (let hour = 0; hour < 24; hour += 1) {
    const input = request.hours[hour];
    const grid = `grid_${hour}`;
    const solar = `solar_${hour}`;
    const charge = `charge_${hour}`;
    const discharge = `discharge_${hour}`;
    const energy = `energy_${hour}`;
    const mode = `charge_mode_${hour}`;

    model.constraints[`balance_${hour}`] = { equal: input.demand_kwh };
    addCoefficient(model.variables, grid, "balance_" + hour, 1);
    addCoefficient(model.variables, solar, "balance_" + hour, 1);
    addCoefficient(model.variables, discharge, "balance_" + hour, 1);
    addCoefficient(model.variables, charge, "balance_" + hour, -1);

    model.variables[grid].cost = input.tariff_bdt_per_kwh;

    addBound(model, solar, `solar_limit_${hour}`, {
      max: effectiveSolar(request, directives, hour),
    });
    addBound(model, charge, `charge_limit_${hour}`, {
      max: directives.noCharge[hour] ? 0 : battery.max_charge_kwh_per_hour,
    });
    addBound(model, discharge, `discharge_limit_${hour}`, {
      max: directives.noDischarge[hour]
        ? 0
        : battery.max_discharge_kwh_per_hour,
    });
    addBound(model, energy, `energy_min_${hour}`, {
      min: activeMinimum(battery, directives, hour),
    });
    addBound(model, energy, `energy_max_${hour}`, {
      max: battery.capacity_kwh,
    });

    const transition = `transition_${hour}`;
    model.constraints[transition] = {
      equal: hour === 0 ? battery.initial_energy_kwh : 0,
    };
    addCoefficient(model.variables, energy, transition, 1);
    if (hour > 0) {
      addCoefficient(model.variables, `energy_${hour - 1}`, transition, -1);
    }
    addCoefficient(model.variables, charge, transition, -1);
    addCoefficient(model.variables, discharge, transition, 1);

    model.constraints[`charge_mode_limit_${hour}`] = { max: 0 };
    addCoefficient(model.variables, charge, `charge_mode_limit_${hour}`, 1);
    addCoefficient(
      model.variables,
      mode,
      `charge_mode_limit_${hour}`,
      -battery.max_charge_kwh_per_hour,
    );
    model.constraints[`discharge_mode_limit_${hour}`] = {
      max: battery.max_discharge_kwh_per_hour,
    };
    addCoefficient(model.variables, discharge, `discharge_mode_limit_${hour}`, 1);
    addCoefficient(
      model.variables,
      mode,
      `discharge_mode_limit_${hour}`,
      battery.max_discharge_kwh_per_hour,
    );
    model.binaries[mode] = 1;

    if (directives.gridCaps[hour] !== null) {
      addBound(model, grid, `grid_cap_${hour}`, {
        max: directives.gridCaps[hour] ?? 0,
      });
    }
  }

  model.constraints.final_energy = { equal: battery.initial_energy_kwh };
  addCoefficient(model.variables, "energy_23", "final_energy", 1);

  let result: Record<string, number> & { feasible?: boolean; bounded?: boolean };
  try {
    result = (solver as unknown as { Solve: (input: LinearModel) => typeof result }).Solve(
      model,
    );
  } catch {
    throw new GridWiseError(
      "OPTIMIZATION_FAILURE",
      "The energy optimization model could not be solved.",
      422,
    );
  }

  if (result.feasible === false || result.result === undefined) {
    throw new GridWiseError(
      "INFEASIBLE_SCENARIO",
      "The scenario cannot satisfy all energy and operator constraints.",
      422,
    );
  }

  return request.hours.map((input, hour) => {
    const grid = Math.max(0, result[`grid_${hour}`] ?? 0);
    const solar = Math.max(0, result[`solar_${hour}`] ?? 0);
    const charge = Math.max(0, result[`charge_${hour}`] ?? 0);
    const discharge = Math.max(0, result[`discharge_${hour}`] ?? 0);
    const energy = Math.max(0, result[`energy_${hour}`] ?? 0);
    if (charge > 0.01 && discharge > 0.01) {
      throw new GridWiseError(
        "OPTIMIZATION_FAILURE",
        "The optimizer returned simultaneous battery charging and discharging.",
        500,
      );
    }
    const battery_action =
      charge > 0.000001
        ? "charge"
        : discharge > 0.000001
          ? "discharge"
          : "idle";
    return {
      hour: input.hour,
      grid_kwh: grid,
      solar_used_kwh: solar,
      battery_action,
      battery_kwh: battery_action === "charge" ? charge : discharge,
      battery_energy_after_kwh: energy,
    };
  });
}