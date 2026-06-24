// Test runner for StrengthChecker
// Run with: node test-strength-checker.js

const StrengthChecker = require("./js/strengthChecker.js");
const TransformationEngine = require("./js/transformationEngine.js");

const checker = new StrengthChecker();
const engine = new TransformationEngine();

console.log("Running StrengthChecker tests...\n");

let passed = 0;
let failed = 0;

function test(description, result, checkFn) {
  const status = checkFn(result) ? "PASS" : "FAIL";
  if (status === "PASS") passed++; else failed++;
  console.log(`[${status}] ${description}`);
  console.log(`       score: ${result.score}/6 | rating: ${result.rating}`);
  if (result.feedback) console.log(`       feedback: ${result.feedback.join(' ')}`);
  console.log("");
}

// ── 1. Known weak passwords ───────────────────────────────────────────────────
console.log("--- Weak password tests ---\n");

test(
  "Short password (under 8 chars) scores low despite character diversity",
  checker.evaluate("ab1#"),
  r => r.score <= 4 && r.feedback.some(f => f.includes("too short"))
);

test(
  "Empty input rates as Weak",
  checker.evaluate(""),
  r => r.score === 0 && r.rating === "Weak"
);

test(
  "All lowercase, no symbols, short — Weak",
  checker.evaluate("abcdef"),
  r => r.score <= 4 && r.feedback.some(f => f.includes("too short"))
);

// ── 2. Medium strength passwords ─────────────────────────────────────────────
console.log("--- Medium password tests ---\n");

test(
  "Has length + upper + lower + number but no special char — Medium",
  checker.evaluate("Elephant123"),
  r => r.rating === "Medium"
);

test(
  "Has length + upper + special but no number — Medium",
  checker.evaluate("Starlight#!"),
  r => r.score >= 3 && r.score <= 4
);

// ── 3. Strong passwords ───────────────────────────────────────────────────────
console.log("--- Strong password tests ---\n");

test(
  "Meets all 6 criteria — Strong",
  checker.evaluate("Th1s!$@Str0ng#"),
  r => r.rating === "Strong" && r.score === 6
);

test(
  "12+ chars with all character types — Strong",
  checker.evaluate("K@13!d#0$c0p3&"),
  r => r.rating === "Strong"
);

// ── 4. Integration — TransformationEngine outputs fed into StrengthChecker ───
console.log("--- Integration tests (TransformationEngine → StrengthChecker) ---\n");

const testWords = [
  "kaleidoscope",
  "thunderstorm",
  "starlight",
  "elephant",
  "blueocean"
];

testWords.forEach(word => {
  const transformed = engine.transform(word);
  const result = checker.evaluate(transformed);
  const status = result.rating !== "Weak" ? "PASS" : "FAIL";
  if (status === "PASS") passed++; else failed++;

  console.log(`[${status}] "${word}" → "${transformed}"`);
  console.log(`       score: ${result.score}/6 | rating: ${result.rating}`);
  console.log(`       feedback: ${result.feedback.join(' ')}`);
  console.log("");
});

// ── 5. Feedback messages ──────────────────────────────────────────────────────
console.log("--- Feedback message tests ---\n");

const shortResult = checker.evaluate("ab");
const shortPass = shortResult.feedback.some(f => f.includes("too short"));
console.log(`[${shortPass ? "PASS" : "FAIL"}] Short password triggers length feedback`);
console.log(`       feedback: ${shortResult.feedback.join(' ')}\n`);
if (shortPass) passed++; else failed++;

const strongResult = checker.evaluate("K@13!d#0$c0p3&");
const strongPass = strongResult.feedback[0].includes("meets all");
console.log(`[${strongPass ? "PASS" : "FAIL"}] Strong password triggers positive feedback`);
console.log(`       feedback: ${strongResult.feedback.join(' ')}\n`);
if (strongPass) passed++; else failed++;

// ── Results ───────────────────────────────────────────────────────────────────
console.log(`Results: ${passed} passed, ${failed} failed out of ${passed + failed} tests`);
