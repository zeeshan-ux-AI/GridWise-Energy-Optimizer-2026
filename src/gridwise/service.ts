import { applyDirectives } from "./directives";
import { validateLlmInterpretation } from "./guardrails";
import { OpenAiLlmInterpreter, type LlmInterpreter } from "./llm";
import { optimizeSchedule } from "./optimizer";
import { replayAndValidate } from "./replay";
import { validateOptimizeRequest } from "./request-validation";
import type { OptimizeRequest, OptimizeResponse } from "./types";

export async function optimizeEnergy(
  input: unknown,
  interpreter: LlmInterpreter = new OpenAiLlmInterpreter(),
): Promise<OptimizeResponse> {
  const request = validateOptimizeRequest(input);
  const rawInterpretation = await interpreter.interpret(
    request.operator_notes,
    request,
  );
  const directiveInterpretation = validateLlmInterpretation(
    rawInterpretation,
    request.operator_notes.length,
    request.battery,
  );
  const directives = applyDirectives(request, directiveInterpretation);
  const hourlyPlan = optimizeSchedule(request, directives);
  const totals = replayAndValidate(request, directives, hourlyPlan);

  return {
    scenario_id: request.scenario_id,
    directive_interpretation: directiveInterpretation,
    hourly_plan: hourlyPlan.map((entry) => ({
      ...entry,
      grid_kwh: Number(entry.grid_kwh.toFixed(6)),
      solar_used_kwh: Number(entry.solar_used_kwh.toFixed(6)),
      battery_kwh: Number(entry.battery_kwh.toFixed(6)),
      battery_energy_after_kwh: Number(
        entry.battery_energy_after_kwh.toFixed(6),
      ),
    })),
    total_grid_kwh: Number(totals.total_grid_kwh.toFixed(6)),
    total_cost_bdt: Number(totals.total_cost_bdt.toFixed(6)),
    peak_grid_kwh: Number(totals.peak_grid_kwh.toFixed(6)),
    plan_summary:
      "Grid imports are minimized while honoring solar availability, battery limits, operator directives, and end-of-day battery neutrality.",
  };
}

export { validateOptimizeRequest };
export type { OptimizeRequest };