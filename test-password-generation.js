// Integration test for the full PasswordGeneration pipeline
// Tests PatternDetector → TransformationEngine → StrengthChecker → PasswordGeneration
// Run with: node test-password-generation.js

const PatternRepository   = require("./js/patternRepository.js");
const PatternDetector     = require("./js/patternDetector.js");
const TransformationEngine = require("./js/transformationEngine.js");
const StrengthChecker     = require("./js/strengthChecker.js");
const PasswordGeneration  = require("./js/passwordGeneration.js");

// Wire up all modules
const repo       = new PatternRepository();
const detector   = new PatternDetector(repo);
const engine     = new TransformationEngine();
const checker    = new StrengthChecker();
const generator  = new PasswordGeneration(detector, engine, checker);

console.log("Running PasswordGeneration integration tests...\n");

let passed = 0;
let failed = 0;

function test(description, result, checkFn) {
  const ok = checkFn(result);
  const status = ok ? "PASS" : "FAIL";
  if (ok) passed++; else failed++;
  console.log(`[${status}] ${description}`);
  if (result.password)  console.log(`       password : "${result.password}"`);
  if (result.warning)   console.log(`       warning  : "${result.warning}"`);
  if (result.strength)  console.log(`       strength : ${result.strength.rating} (${result.strength.score}/6)`);
  console.log("");
}

// ── 1. Rejected inputs ────────────────────────────────────────────────────────
console.log("--- Rejected input tests ---\n");

test(
  "Common fruit 'mango' is rejected",
  generator.generate("mango"),
  r => r.success === false && r.password === null && r.warning !== null
);

test(
  "Common weak password 'password' is rejected",
  generator.generate("password"),
  r => r.success === false && r.warning !== null
);

test(
  "Date pattern '01/01/2000' is rejected",
  generator.generate("01/01/2000"),
  r => r.success === false && r.warning !== null
);

test(
  "Sequential numbers '123456' are rejected",
  generator.generate("123456"),
  r => r.success === false && r.warning !== null
);

test(
  "Empty input is rejected",
  generator.generate(""),
  r => r.success === false && r.warning !== null
);

test(
  "Common name 'sarah' is rejected",
  generator.generate("sarah"),
  r => r.success === false && r.warning !== null
);

// ── 2. Accepted inputs — successful generation ────────────────────────────────
console.log("--- Successful generation tests ---\n");

test(
  "Clean long word 'kaleidoscope' generates successfully",
  generator.generate("kaleidoscope"),
  r => r.success === true && r.password !== null && r.strength.rating === "Strong"
);

test(
  "Clean word 'thunderstorm' generates successfully",
  generator.generate("thunderstorm"),
  r => r.success === true && r.password !== null && r.strength !== null
);

test(
  "Clean word 'starlight' generates successfully",
  generator.generate("starlight"),
  r => r.success === true && r.password !== null
);

test(
  "Generated password is different from original input",
  generator.generate("kaleidoscope"),
  r => r.success === true && r.password !== "kaleidoscope"
);

test(
  "Generated password contains special characters",
  generator.generate("thunderstorm"),
  r => r.success === true && /[^a-zA-Z0-9]/.test(r.password)
);

test(
  "Generated password contains uppercase letters",
  generator.generate("starlight"),
  r => r.success === true && /[A-Z]/.test(r.password)
);

// ── 3. Strength results ───────────────────────────────────────────────────────
console.log("--- Strength result tests ---\n");

test(
  "Long clean input produces Strong rating",
  generator.generate("kaleidoscope"),
  r => r.success && r.strength.rating === "Strong"
);

test(
  "Strength score is between 0 and 6",
  generator.generate("thunderstorm"),
  r => r.success && r.strength.score >= 0 && r.strength.score <= 6
);

test(
  "Strength feedback is returned as an array",
  generator.generate("starlight"),
  r => r.success && Array.isArray(r.strength.feedback)
);

// ── 4. Consistency (deterministic output) ────────────────────────────────────
console.log("--- Deterministic output tests ---\n");

test(
  "Same input always produces same password (deterministic)",
  (() => {
    const r1 = generator.generate("kaleidoscope");
    const r2 = generator.generate("kaleidoscope");
    return { success: r1.password === r2.password, password: r1.password };
  })(),
  r => r.success === true
);

test(
  "formatPassword() returns most recently generated password",
  (() => {
    generator.generate("thunderstorm");
    const pwd = generator.formatPassword();
    return { success: pwd !== null, password: pwd };
  })(),
  r => r.success === true
);

test(
  "Rejected input clears stored password",
  (() => {
    generator.generate("mango"); // rejected
    const pwd = generator.formatPassword();
    return { success: pwd === null, password: pwd };
  })(),
  r => r.success === true
);

// ── Results ───────────────────────────────────────────────────────────────────
console.log(`\nResults: ${passed} passed, ${failed} failed out of ${passed + failed} tests`);
