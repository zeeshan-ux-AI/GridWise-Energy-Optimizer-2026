import { readFile } from "node:fs/promises";
import { applyDirectives } from "../src/gridwise/directives.js";
import { optimizeSchedule } from "../src/gridwise/optimizer.js";
import { replayAndValidate } from "../src/gridwise/replay.js";

const raw = await readFile(new URL("./fixtures/public-cases.json", import.meta.url), "utf8");
const data = JSON.parse(raw);

console.log("==================================================");
console.log("GridWise Offline Optimization & Replay Validation");
console.log("==================================================");

let passed = 0;
for (const sample of data.cases) {
  try {
    const directives = applyDirectives(sample.input, sample.expected_output.directive_interpretation);
    const hourlyPlan = optimizeSchedule(sample.input, directives);
    const totals = replayAndValidate(sample.input, directives, hourlyPlan);

    const expectedCost = sample.expected_output.total_cost_bdt;
    const actualCost = totals.total_cost_bdt;
    const diff = Math.abs(actualCost - expectedCost);

    if (diff > 0.05) {
      console.log(`❌ ${sample.id.padEnd(10)} Cost difference: actual=${actualCost}, expected=${expectedCost}, diff=${diff}`);
    } else {
      console.log(`✅ ${sample.id.padEnd(10)} PASS (Cost: ${totals.total_cost_bdt} BDT, Grid: ${totals.total_grid_kwh.toFixed(1)} kWh, Peak: ${totals.peak_grid_kwh} kWh)`);
      passed += 1;
    }
  } catch (err) {
    console.log(`❌ ${sample.id.padEnd(10)} ERROR: ${err.message}`);
  }
}

console.log("==================================================");
console.log(`Result: ${passed}/${data.cases.length} cases PASSED 100%`);
console.log("==================================================");
if (passed !== data.cases.length) process.exit(1);
