import OpenAI from "openai";
import { logger } from "../lib/logger";
import {
  DIRECTIVE_TYPES,
  GridWiseError,
  type OptimizeRequest,
} from "./types";

export interface LlmInterpreter {
  interpret(
    notes: string[],
    request: OptimizeRequest,
  ): Promise<unknown>;
}

const SYSTEM_PROMPT = `You interpret smart-campus energy operator notes into a strict JSON object.
You are not the optimizer. You may only select one of these directive types:
solar_reduction, minimum_battery_reserve, no_charge_window, no_discharge_window, max_grid_window, no_op.

Return exactly:
{"interpretations":[
  {"note_index":0,"applies":true,"directive_type":"...","structured_adjustment":{},"explanation":"short reason"}
]}

There must be one entry for every note, in the original order. Use note_index zero-based.
Use no_op only when the note does not affect the energy schedule; for no_op set applies=false and structured_adjustment=null.
For every other type set applies=true.
Hours are integer hour indices 0 through 23. Time ranges are start-inclusive/end-exclusive:
1 PM to 3 PM means [13,14], and 13:00 to 15:00 means [13,14].
solar_reduction uses {"hours":[...],"factor":number}; factor is the fraction remaining, not the percent reduced.
minimum_battery_reserve uses {"hours":[...],"minimum_energy_kwh":number}.
no_charge_window and no_discharge_window use {"hours":[...]}.
max_grid_window uses {"hours":[...],"max_grid_kwh":number}.
Never modify demand, solar, tariffs, or battery parameters. Do not invent unsupported directives.
Return JSON only, with no markdown.`;

export class OpenAiLlmInterpreter implements LlmInterpreter {
  private readonly client: OpenAI;
  private readonly model: string;

  constructor() {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new GridWiseError(
        "LLM_NOT_CONFIGURED",
        "The operator-note language model is not configured.",
        503,
      );
    }
    this.client = new OpenAI({
      apiKey,
      timeout: 15_000,
      maxRetries: 1,
    });
    this.model = process.env.LLM_MODEL || "gpt-4o-mini";
  }

  async interpret(notes: string[], request: OptimizeRequest): Promise<unknown> {
    try {
      const completion = await this.client.chat.completions.create({
        model: this.model,
        response_format: { type: "json_object" },
        max_tokens: 2_000,
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          {
            role: "user",
            content: JSON.stringify({
              operator_notes: notes,
              allowed_directive_types: DIRECTIVE_TYPES,
              scenario_context: {
                hours: request.hours.map((hour) => hour.hour),
                battery_capacity_kwh: request.battery.capacity_kwh,
              },
            }),
          },
        ],
      });
      const content = completion.choices[0]?.message?.content;
      if (!content) {
        throw new Error("The model returned an empty response.");
      }
      return JSON.parse(content);
    } catch (error) {
      if (error instanceof GridWiseError) {
        throw error;
      }
      const providerError = error as {
        name?: string;
        status?: number;
        code?: string;
        type?: string;
        message?: string;
      };
      logger.warn(
        {
          provider: "openai",
          error_name: providerError.name,
          status: providerError.status,
          code: providerError.code,
          type: providerError.type,
          message: providerError.message?.slice(0, 240),
        },
        "LLM provider request failed",
      );
      if (providerError.status === 429 || providerError.status === 401) {
        throw new GridWiseError(
          "LLM_PROVIDER_UNAVAILABLE",
          "The configured language-model provider is unavailable. Check provider access and billing.",
          503,
        );
      }
      throw new GridWiseError(
        "LLM_FAILURE",
        "The operator-note language model could not produce a usable interpretation.",
        502,
      );
    }
  }
}