import { GridWiseError, type HourlyPlan, type OptimizeRequest } from "./types";
import {
  activeMinimum,
  effectiveSolar,
  type AppliedDirectives,
} from "./directives";

export const TOLERANCE = 0.01;

function assertClose(actual: number, expected: number, message: string): void {
  if (!Number.isFinite(actual) || Math.abs(actual - expected) > TOLERANCE) {
    throw new GridWiseError("INVALID_SCHEDULE", message, 500);
  }
}

export function replayAndValidate(
  request: OptimizeRequest,
  directives: AppliedDirectives,
  plan: HourlyPlan[],
): { total_grid_kwh: number; total_cost_bdt: number; peak_grid_kwh: number } {
  if (plan.length !== 24) {
    throw new GridWiseError("INVALID_SCHEDULE", "The optimizer did not return 24 hourly entries.", 500);
  }
  let previousEnergy = request.battery.initial_energy_kwh;
  let totalGrid = 0;
  let totalCost = 0;
  let peakGrid = 0;

  for (let hour = 0; hour < 24; hour += 1) {
    const entry = plan[hour];
    if (entry.hour !== hour) {
      throw new GridWiseError("INVALID_SCHEDULE", "Hourly plan must be ordered from 0 through 23.", 500);
    }
    for (const [key, value] of Object.entries(entry)) {
      if (key !== "battery_action" && !Number.isFinite(value)) {
        throw new GridWiseError("INVALID_SCHEDULE", `Non-finite value in hourly plan: ${key}.`, 500);
      }
    }
    if (entry.grid_kwh < -TOLERANCE || entry.solar_used_kwh < -TOLERANCE || entry.battery_kwh < -TOLERANCE) {
      throw new GridWiseError("INVALID_SCHEDULE", `Negative energy value at hour ${hour}.`, 500);
    }
    if (!["charge", "discharge", "idle"].includes(entry.battery_action)) {
      throw new GridWiseError("INVALID_SCHEDULE", `Invalid battery action at hour ${hour}.`, 500);
    }
    if (entry.battery_action === "idle" && Math.abs(entry.battery_kwh) > TOLERANCE) {
      throw new GridWiseError("INVALID_SCHEDULE", `Idle battery action has non-zero movement at hour ${hour}.`, 500);
    }
    if (entry.battery_action === "charge" && entry.battery_kwh > request.battery.max_charge_kwh_per_hour + TOLERANCE) {
      throw new GridWiseError("INVALID_SCHEDULE", `Charge rate exceeded at hour ${hour}.`, 500);
    }
    if (entry.battery_action === "discharge" && entry.battery_kwh > request.battery.max_discharge_kwh_per_hour + TOLERANCE) {
      throw new GridWiseError("INVALID_SCHEDULE", `Discharge rate exceeded at hour ${hour}.`, 500);
    }
    if (directives.noCharge[hour] && entry.battery_action === "charge" && entry.battery_kwh > TOLERANCE) {
      throw new GridWiseError("INVALID_SCHEDULE", `No-charge directive violated at hour ${hour}.`, 500);
    }
    if (directives.noDischarge[hour] && entry.battery_action === "discharge" && entry.battery_kwh > TOLERANCE) {
      throw new GridWiseError("INVALID_SCHEDULE", `No-discharge directive violated at hour ${hour}.`, 500);
    }
    if (directives.gridCaps[hour] !== null && entry.grid_kwh > (directives.gridCaps[hour] ?? 0) + TOLERANCE) {
      throw new GridWiseError("INVALID_SCHEDULE", `Grid cap violated at hour ${hour}.`, 500);
    }
    if (entry.solar_used_kwh > effectiveSolar(request, directives, hour) + TOLERANCE) {
      throw new GridWiseError("INVALID_SCHEDULE", `Solar availability exceeded at hour ${hour}.`, 500);
    }

    const movement =
      entry.battery_action === "charge"
        ? entry.battery_kwh
        : entry.battery_action === "discharge"
          ? -entry.battery_kwh
          : 0;
    assertClose(
      entry.battery_energy_after_kwh,
      previousEnergy + movement,
      `Battery transition failed at hour ${hour}.`,
    );
    if (
      entry.battery_energy_after_kwh < activeMinimum(request.battery, directives, hour) - TOLERANCE ||
      entry.battery_energy_after_kwh > request.battery.capacity_kwh + TOLERANCE
    ) {
      throw new GridWiseError("INVALID_SCHEDULE", `Battery bounds violated at hour ${hour}.`, 500);
    }
    const discharge = entry.battery_action === "discharge" ? entry.battery_kwh : 0;
    const charge = entry.battery_action === "charge" ? entry.battery_kwh : 0;
    assertClose(
      entry.grid_kwh + entry.solar_used_kwh + discharge,
      request.hours[hour].demand_kwh + charge,
      `Energy balance failed at hour ${hour}.`,
    );
    previousEnergy = entry.battery_energy_after_kwh;
    totalGrid += entry.grid_kwh;
    totalCost += entry.grid_kwh * request.hours[hour].tariff_bdt_per_kwh;
    peakGrid = Math.max(peakGrid, entry.grid_kwh);
  }

  assertClose(
    previousEnergy,
    request.battery.initial_energy_kwh,
    "End-of-day battery neutrality failed.",
  );
  return {
    total_grid_kwh: totalGrid,
    total_cost_bdt: totalCost,
    peak_grid_kwh: peakGrid,
  };
}