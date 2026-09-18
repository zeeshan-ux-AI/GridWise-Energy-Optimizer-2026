import { GridWiseError, type OptimizeRequest } from "./types";

const MAX_NOTE_LENGTH = 2_000;

function isFiniteNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

function requireNumber(value: unknown, path: string, minimum = 0): number {
  if (!isFiniteNumber(value) || value < minimum) {
    throw new GridWiseError(
      "INVALID_REQUEST",
      `${path} must be a finite number greater than or equal to ${minimum}.`,
    );
  }
  return value;
}

function asRecord(value: unknown, path: string): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new GridWiseError("INVALID_REQUEST", `${path} must be an object.`);
  }
  return value as Record<string, unknown>;
}

export function validateOptimizeRequest(input: unknown): OptimizeRequest {
  const root = asRecord(input, "request");

  if (typeof root.scenario_id !== "string" || root.scenario_id.trim().length === 0) {
    throw new GridWiseError(
      "INVALID_REQUEST",
      "scenario_id must be a non-empty string.",
    );
  }

  if (
    !Array.isArray(root.operator_notes) ||
    root.operator_notes.length < 1 ||
    root.operator_notes.length > 3
  ) {
    throw new GridWiseError(
      "INVALID_REQUEST",
      "operator_notes must contain between 1 and 3 notes.",
    );
  }

  const operator_notes = root.operator_notes.map((note, index) => {
    if (
      typeof note !== "string" ||
      note.trim().length === 0 ||
      note.length > MAX_NOTE_LENGTH
    ) {
      throw new GridWiseError(
        "INVALID_REQUEST",
        `operator_notes[${index}] must be non-empty text no longer than ${MAX_NOTE_LENGTH} characters.`,
      );
    }
    return note.trim();
  });

  if (!Array.isArray(root.hours) || root.hours.length !== 24) {
    throw new GridWiseError("INVALID_REQUEST", "hours must contain exactly 24 entries.");
  }

  const seenHours = new Set<number>();
  const hours = root.hours.map((rawHour, index) => {
    const hour = asRecord(rawHour, `hours[${index}]`);
    const hourNumber = hour.hour;
    if (
      typeof hourNumber !== "number" ||
      !Number.isInteger(hourNumber) ||
      hourNumber < 0 ||
      hourNumber > 23 ||
      seenHours.has(hourNumber)
    ) {
      throw new GridWiseError(
        "INVALID_REQUEST",
        `hours[${index}].hour must be a unique integer from 0 through 23.`,
      );
    }
    seenHours.add(hourNumber);
    return {
      hour: hourNumber,
      demand_kwh: requireNumber(hour.demand_kwh, `hours[${index}].demand_kwh`),
      solar_kwh: requireNumber(hour.solar_kwh, `hours[${index}].solar_kwh`),
      tariff_bdt_per_kwh: requireNumber(
        hour.tariff_bdt_per_kwh,
        `hours[${index}].tariff_bdt_per_kwh`,
      ),
    };
  });

  if (seenHours.size !== 24) {
    throw new GridWiseError("INVALID_REQUEST", "hours must cover every index from 0 through 23.");
  }
  hours.sort((a, b) => a.hour - b.hour);

  const batteryRecord = asRecord(root.battery, "battery");
  const battery = {
    capacity_kwh: requireNumber(batteryRecord.capacity_kwh, "battery.capacity_kwh"),
    initial_energy_kwh: requireNumber(
      batteryRecord.initial_energy_kwh,
      "battery.initial_energy_kwh",
    ),
    minimum_energy_kwh: requireNumber(
      batteryRecord.minimum_energy_kwh,
      "battery.minimum_energy_kwh",
    ),
    max_charge_kwh_per_hour: requireNumber(
      batteryRecord.max_charge_kwh_per_hour,
      "battery.max_charge_kwh_per_hour",
    ),
    max_discharge_kwh_per_hour: requireNumber(
      batteryRecord.max_discharge_kwh_per_hour,
      "battery.max_discharge_kwh_per_hour",
    ),
  };

  if (battery.capacity_kwh <= 0) {
    throw new GridWiseError("INVALID_REQUEST", "battery.capacity_kwh must be greater than zero.");
  }
  if (battery.minimum_energy_kwh > battery.capacity_kwh) {
    throw new GridWiseError(
      "INVALID_REQUEST",
      "battery.minimum_energy_kwh cannot exceed battery.capacity_kwh.",
    );
  }
  if (battery.initial_energy_kwh > battery.capacity_kwh) {
    throw new GridWiseError(
      "INVALID_REQUEST",
      "battery.initial_energy_kwh cannot exceed battery.capacity_kwh.",
    );
  }
  if (battery.initial_energy_kwh < battery.minimum_energy_kwh) {
    throw new GridWiseError(
      "INVALID_REQUEST",
      "battery.initial_energy_kwh cannot be below battery.minimum_energy_kwh.",
    );
  }

  return {
    scenario_id: root.scenario_id,
    operator_notes,
    hours,
    battery,
  };
}