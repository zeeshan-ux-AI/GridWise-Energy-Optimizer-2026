import { readFile } from "node:fs/promises";
import process from "node:process";

const casesPath =
  process.env.PUBLIC_CASES_PATH ??
  new URL("../tests/fixtures/public-cases.json", import.meta.url);
const baseUrl = (process.env.GRIDWISE_API_URL ?? "http://127.0.0.1:8080").replace(
  /\/$/,
  "",
);
const payload = JSON.parse(await readFile(casesPath, "utf8"));

function closeEnough(actual, expected) {
  return Math.abs(Number(actual) - Number(expected)) <= 0.01;
}

function assertSchedule(input, output, expectedDirectives) {
  if (output.scenario_id !== input.scenario_id) {
    throw new Error("scenario_id was not echoed");
  }
  if (output.hourly_plan?.length !== 24) {
    throw new Error("hourly_plan does not contain 24 entries");
  }
  if (output.directive_interpretation?.length !== input.operator_notes.length) {
    throw new Error("directive_interpretation length mismatch");
  }

  for (let index = 0; index < expectedDirectives.length; index += 1) {
    const actual = output.directive_interpretation[index];
    const expected = expectedDirectives[index];
    if (
      actual.note_index !== index ||
      actual.applies !== expected.applies ||
      actual.directive_type !== expected.directive_type
    ) {
      throw new Error(`directive interpretation mismatch at note ${index}`);
    }
    if (JSON.stringify(actual.structured_adjustment) !== JSON.stringify(expected.structured_adjustment)) {
      throw new Error(`structured adjustment mismatch at note ${index}`);
    }
  }

  let previousEnergy = input.battery.initial_energy_kwh;
  let totalGrid = 0;
  let totalCost = 0;
  let peakGrid = 0;
  const solarFactors = Array.from({ length: 24 }, () => 1);
  const reserve = Array.from(
    { length: 24 },
    () => input.battery.minimum_energy_kwh,
  );
  const noCharge = Array.from({ length: 24 }, () => false);
  const noDischarge = Array.from({ length: 24 }, () => false);
  const gridCaps = Array.from({ length: 24 }, () => null);

  for (const directive of expectedDirectives) {
    if (!directive.applies || directive.structured_adjustment === null) continue;
    for (const hour of directive.structured_adjustment.hours) {
      const adjustment = directive.structured_adjustment;
      if (directive.directive_type === "solar_reduction") solarFactors[hour] *= adjustment.factor;
      if (directive.directive_type === "minimum_battery_reserve") reserve[hour] = Math.max(reserve[hour], adjustment.minimum_energy_kwh);
      if (directive.directive_type === "no_charge_window") noCharge[hour] = true;
      if (directive.directive_type === "no_discharge_window") noDischarge[hour] = true;
      if (directive.directive_type === "max_grid_window") gridCaps[hour] = gridCaps[hour] === null ? adjustment.max_grid_kwh : Math.min(gridCaps[hour], adjustment.max_grid_kwh);
    }
  }

  for (let hour = 0; hour < 24; hour += 1) {
    const row = output.hourly_plan[hour];
    const source = input.hours[hour];
    if (row.hour !== hour) throw new Error(`hour ${hour} is out of order`);
    const charge = row.battery_action === "charge" ? row.battery_kwh : 0;
    const discharge = row.battery_action === "discharge" ? row.battery_kwh : 0;
    if (!closeEnough(row.grid_kwh + row.solar_used_kwh + discharge, source.demand_kwh + charge)) {
      throw new Error(`energy balance failed at hour ${hour}`);
    }
    if (row.solar_used_kwh > source.solar_kwh * solarFactors[hour] + 0.01) {
      throw new Error(`solar constraint failed at hour ${hour}`);
    }
    if (!closeEnough(row.battery_energy_after_kwh, previousEnergy + charge - discharge)) {
      throw new Error(`battery transition failed at hour ${hour}`);
    }
    if (row.battery_energy_after_kwh < reserve[hour] - 0.01 || row.battery_energy_after_kwh > input.battery.capacity_kwh + 0.01) {
      throw new Error(`battery bounds failed at hour ${hour}`);
    }
    if (noCharge[hour] && charge > 0.01) throw new Error(`no-charge failed at hour ${hour}`);
    if (noDischarge[hour] && discharge > 0.01) throw new Error(`no-discharge failed at hour ${hour}`);
    if (gridCaps[hour] !== null && row.grid_kwh > gridCaps[hour] + 0.01) throw new Error(`grid cap failed at hour ${hour}`);
    previousEnergy = row.battery_energy_after_kwh;
    totalGrid += row.grid_kwh;
    totalCost += row.grid_kwh * source.tariff_bdt_per_kwh;
    peakGrid = Math.max(peakGrid, row.grid_kwh);
  }
  if (!closeEnough(previousEnergy, input.battery.initial_energy_kwh)) throw new Error("battery neutrality failed");
  if (!closeEnough(output.total_grid_kwh, totalGrid)) throw new Error("total_grid_kwh mismatch");
  if (!closeEnough(output.total_cost_bdt, totalCost)) throw new Error("total_cost_bdt mismatch");
  if (!closeEnough(output.peak_grid_kwh, peakGrid)) throw new Error("peak_grid_kwh mismatch");
}

console.log("GridWise Public Case Validation");
console.log("================================");
let passed = 0;
for (const sample of payload.cases) {
  try {
    const response = await fetch(`${baseUrl}/optimize-energy`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(sample.input),
    });
    const body = await response.json();
    if (!response.ok) throw new Error(body?.error?.message ?? `HTTP ${response.status}`);
    assertSchedule(sample.input, body, sample.expected_output.directive_interpretation);
    passed += 1;
    console.log(`${sample.id.padEnd(10)} PASS`);
  } catch (error) {
    console.log(`${sample.id.padEnd(10)} FAIL  ${error instanceof Error ? error.message : String(error)}`);
  }
}
console.log(`\n${passed}/${payload.cases.length} cases passed`);
if (passed !== payload.cases.length) process.exitCode = 1;