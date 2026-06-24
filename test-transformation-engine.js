// Test runner for TransformationEngine
// Run with: node test-transformation-engine.js

const TransformationEngine = require("./js/transformationEngine.js");

const engine = new TransformationEngine();

console.log("Running TransformationEngine tests...\n");

let passed = 0;
let failed = 0;

// ── Helper ────────────────────────────────────────────────────────────────────
function test(description, actual, checkFn) {
  const result = checkFn(actual);
  const status = result ? "PASS" : "FAIL";
  if (result) passed++; else failed++;
  console.log(`[${status}] ${description}`);
  console.log(`       input/output: "${actual}"`);
  if (!result) console.log(`       ✗ Check failed`);
  console.log("");
}

// ── 1. Individual technique tests ─────────────────────────────────────────────

console.log("--- substitute() tests ---\n");

test(
  "substitute: 'a' replaced with '@'",
  engine.substitute("apple"),
  out => out.includes("@")
);

test(
  "substitute: 'e' replaced with '3'",
  engine.substitute("elephant"),
  out => out.includes("3")
);

test(
  "substitute: 's' replaced with '$'",
  engine.substitute("storm"),
  out => out.includes("$")
);

test(
  "substitute: characters with no substitution rule are preserved unchanged",
  engine.substitute("mnpq"),
  out => out.includes("m") && out.includes("n") && out.includes("p") && out.includes("q")
);

console.log("--- capitalise() tests ---\n");

test(
  "capitalise: first character is uppercase",
  engine.capitalise("starlight"),
  out => out[0] === out[0].toUpperCase()
);

test(
  "capitalise: output contains both upper and lowercase",
  engine.capitalise("kaleidoscope"),
  out => out !== out.toUpperCase() && out !== out.toLowerCase()
);

console.log("--- insertSymbol() tests ---\n");

test(
  "insertSymbol: output is longer than input",
  engine.insertSymbol("starlight"),
  out => out.length > "starlight".length
);

test(
  "insertSymbol: output contains at least one special character",
  engine.insertSymbol("starlight"),
  out => /[#*&%^~]/.test(out)
);

// ── 2. Full transform() pipeline tests ───────────────────────────────────────

console.log("--- transform() full pipeline tests ---\n");

const inputs = [
  "kaleidoscope",
  "starlight",
  "thunderstorm",
  "elephant",
  "blueocean"
];

inputs.forEach(input => {
  const output = engine.transform(input);

  // Check 1 — output is longer than input (symbol insertion worked)
  const longerThanInput = output.length > input.length;

  // Check 2 — output contains at least one special character
  const hasSpecial = /[#*&%^~@$!]/.test(output);

  // Check 3 — output contains at least one uppercase letter
  const hasUpper = /[A-Z]/.test(output);

  // Check 4 — output is not identical to input (transformation occurred)
  const wasTransformed = output !== input;

  // Check 5 — output is deterministic (same input = same output)
  const deterministic = engine.transform(input) === output;

  const allPass = longerThanInput && hasSpecial && hasUpper && wasTransformed && deterministic;
  const status = allPass ? "PASS" : "FAIL";
  if (allPass) passed++; else failed++;

  console.log(`[${status}] transform("${input}") → "${output}"`);
  console.log(`       longer than input: ${longerThanInput}`);
  console.log(`       has special char:  ${hasSpecial}`);
  console.log(`       has uppercase:     ${hasUpper}`);
  console.log(`       was transformed:   ${wasTransformed}`);
  console.log(`       deterministic:     ${deterministic}`);
  console.log("");
});

// ── 3. Edge cases ─────────────────────────────────────────────────────────────

console.log("--- edge case tests ---\n");

test(
  "transform: empty string returns empty string",
  engine.transform(""),
  out => out === ""
);

test(
  "transform: single character input",
  engine.transform("a"),
  out => out.length > 1 // symbols added means output longer than 1 char
);

// ── Results ───────────────────────────────────────────────────────────────────

console.log(`Results: ${passed} passed, ${failed} failed out of ${passed + failed} tests`);
