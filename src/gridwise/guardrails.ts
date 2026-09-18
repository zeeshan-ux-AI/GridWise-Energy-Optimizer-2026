import {
  DIRECTIVE_TYPES,
  GridWiseError,
  type BatteryInput,
  type DirectiveInterpretation,
  type DirectiveType,
} from "./types";

function isFiniteNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

function asRecord(value: unknown, path: string): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new GridWiseError("INVALID_LLM_OUTPUT", `${path} must be an object.`, 502);
  }
  return value as Record<string, unknown>;
}

function validateHours(value: unknown, path: string): number[] {
  if (!Array.isArray(value)) {
    throw new GridWiseError("INVALID_LLM_OUTPUT", `${path} must be an array.`, 502);
  }
  const hours = value.map((hour, index) => {
    if (!Number.isInteger(hour) || hour < 0 || hour > 23) {
      throw new GridWiseError(
        "INVALID_LLM_OUTPUT",
        `${path}[${index}] must be an integer from 0 through 23.`,
        502,
      );
    }
    return hour;
  });
  for (let index = 1; index < hours.length; index += 1) {
    if (hours[index] <= hours[index - 1] || hours[index] === hours[index - 1]) {
      throw new GridWiseError(
        "INVALID_LLM_OUTPUT",
        `${path} must be unique and sorted in ascending order.`,
        502,
      );
    }
  }
  return hours;
}

function validateAdjustment(
  directiveType: DirectiveType,
  raw: unknown,
  battery: BatteryInput,
): DirectiveInterpretation["structured_adjustment"] {
  if (directiveType === "no_op") {
    if (raw !== null) {
      throw new GridWiseError(
        "INVALID_LLM_OUTPUT",
        "no_op must have structured_adjustment=null.",
        502,
      );
    }
    return null;
  }

  const adjustment = asRecord(raw, "structured_adjustment");
  const hours = validateHours(adjustment.hours, "structured_adjustment.hours");

  if (directiveType === "solar_reduction") {
    if (!isFiniteNumber(adjustment.factor) || adjustment.factor < 0 || adjustment.factor > 1) {
      throw new GridWiseError(
        "INVALID_LLM_OUTPUT",
        "solar_reduction.factor must be between 0 and 1.",
        502,
      );
    }
    return { hours, factor: adjustment.factor };
  }

  if (directiveType === "minimum_battery_reserve") {
    if (
      !isFiniteNumber(adjustment.minimum_energy_kwh) ||
      adjustment.minimum_energy_kwh < 0 ||
      adjustment.minimum_energy_kwh > battery.capacity_kwh
    ) {
      throw new GridWiseError(
        "INVALID_LLM_OUTPUT",
        "minimum_battery_reserve.minimum_energy_kwh must be within battery capacity.",
        502,
      );
    }
    return {
      hours,
      minimum_energy_kwh: adjustment.minimum_energy_kwh,
    };
  }

  if (directiveType === "max_grid_window") {
    if (!isFiniteNumber(adjustment.max_grid_kwh) || adjustment.max_grid_kwh < 0) {
      throw new GridWiseError(
        "INVALID_LLM_OUTPUT",
        "max_grid_window.max_grid_kwh must be finite and non-negative.",
        502,
      );
    }
    return { hours, max_grid_kwh: adjustment.max_grid_kwh };
  }

  if (Object.keys(adjustment).some((key) => key !== "hours")) {
    throw new GridWiseError(
      "INVALID_LLM_OUTPUT",
      `${directiveType} only accepts an hours array.`,
      502,
    );
  }
  return { hours };
}

export function validateLlmInterpretation(
  output: unknown,
  noteCount: number,
  battery: BatteryInput,
): DirectiveInterpretation[] {
  const root = asRecord(output, "LLM response");
  if (!Array.isArray(root.interpretations)) {
    throw new GridWiseError(
      "INVALID_LLM_OUTPUT",
      "LLM response must contain an interpretations array.",
      502,
    );
  }
  if (root.interpretations.length !== noteCount) {
    throw new GridWiseError(
      "INVALID_LLM_OUTPUT",
      "LLM response must contain exactly one interpretation per note.",
      502,
    );
  }

  return root.interpretations.map((rawInterpretation, expectedIndex) => {
    const raw = asRecord(rawInterpretation, `interpretations[${expectedIndex}]`);
    if (raw.note_index !== expectedIndex) {
      throw new GridWiseError(
        "INVALID_LLM_OUTPUT",
        "Interpretations must preserve note order and use zero-based note_index values.",
        502,
      );
    }
    if (typeof raw.applies !== "boolean") {
      throw new GridWiseError(
        "INVALID_LLM_OUTPUT",
        `interpretations[${expectedIndex}].applies must be boolean.`,
        502,
      );
    }
    if (
      typeof raw.directive_type !== "string" ||
      !DIRECTIVE_TYPES.includes(raw.directive_type as DirectiveType)
    ) {
      throw new GridWiseError(
        "INVALID_LLM_OUTPUT",
        `interpretations[${expectedIndex}] has an unsupported directive_type.`,
        502,
      );
    }
    const directiveType = raw.directive_type as DirectiveType;
    if (directiveType === "no_op" && raw.applies !== false) {
      throw new GridWiseError("INVALID_LLM_OUTPUT", "no_op must set applies=false.", 502);
    }
    if (directiveType !== "no_op" && raw.applies !== true) {
      throw new GridWiseError(
        "INVALID_LLM_OUTPUT",
        "Applicable directives must set applies=true.",
        502,
      );
    }
    const explanation =
      typeof raw.explanation === "string" && raw.explanation.trim().length > 0
        ? raw.explanation.trim()
        : `Operator note ${expectedIndex + 1} processed.`;
    return {
      note_index: expectedIndex,
      applies: raw.applies,
      directive_type: directiveType,
      structured_adjustment: validateAdjustment(
        directiveType,
        raw.structured_adjustment,
        battery,
      ),
      explanation,
    };
  });
}