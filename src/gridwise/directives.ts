import type {
  BatteryInput,
  DirectiveInterpretation,
  OptimizeRequest,
} from "./types";

export interface AppliedDirectives {
  solarFactors: number[];
  minimumReserves: number[];
  noCharge: boolean[];
  noDischarge: boolean[];
  gridCaps: Array<number | null>;
}

export function applyDirectives(
  request: OptimizeRequest,
  interpretations: DirectiveInterpretation[],
): AppliedDirectives {
  const applied: AppliedDirectives = {
    solarFactors: Array.from({ length: 24 }, () => 1),
    minimumReserves: Array.from(
      { length: 24 },
      () => request.battery.minimum_energy_kwh,
    ),
    noCharge: Array.from({ length: 24 }, () => false),
    noDischarge: Array.from({ length: 24 }, () => false),
    gridCaps: Array.from({ length: 24 }, () => null),
  };

  for (const interpretation of interpretations) {
    if (!interpretation.applies || interpretation.structured_adjustment === null) {
      continue;
    }
    const adjustment = interpretation.structured_adjustment;
    for (const hour of adjustment.hours) {
      switch (interpretation.directive_type) {
        case "solar_reduction":
          applied.solarFactors[hour] *= (
            adjustment as { hours: number[]; factor: number }
          ).factor;
          break;
        case "minimum_battery_reserve":
          applied.minimumReserves[hour] = Math.max(
            applied.minimumReserves[hour],
            (
              adjustment as {
                hours: number[];
                minimum_energy_kwh: number;
              }
            ).minimum_energy_kwh,
          );
          break;
        case "no_charge_window":
          applied.noCharge[hour] = true;
          break;
        case "no_discharge_window":
          applied.noDischarge[hour] = true;
          break;
        case "max_grid_window":
          applied.gridCaps[hour] =
            applied.gridCaps[hour] === null
              ? (
                  adjustment as { hours: number[]; max_grid_kwh: number }
                ).max_grid_kwh
              : Math.min(
                  applied.gridCaps[hour],
                  (
                    adjustment as {
                      hours: number[];
                      max_grid_kwh: number;
                    }
                  ).max_grid_kwh,
                );
          break;
      }
    }
  }

  return applied;
}

export function effectiveSolar(
  request: OptimizeRequest,
  directives: AppliedDirectives,
  hour: number,
): number {
  return request.hours[hour].solar_kwh * directives.solarFactors[hour];
}

export function activeMinimum(
  battery: BatteryInput,
  directives: AppliedDirectives,
  hour: number,
): number {
  return Math.max(battery.minimum_energy_kwh, directives.minimumReserves[hour]);
}