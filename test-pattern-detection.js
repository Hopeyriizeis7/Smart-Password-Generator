// Test runner for PatternRepository + PatternDetector
// Run with: node test-pattern-detection.js

const PatternRepository = require("./js/patternRepository.js");
const PatternDetector = require("./js/patternDetector.js");

const repo = new PatternRepository();
const detector = new PatternDetector(repo);

const testCases = [
  // Clean inputs — should pass through
  { input: "starlight",    expected: false, description: "clean compound word" },
  { input: "kaleidoscope", expected: false, description: "long uncommon word" },
  { input: "thunderstorm", expected: false, description: "long compound word" },
  { input: "elephant",     expected: false, description: "clean animal word (not in list)" },

  // Common/weak words — should be rejected
  { input: "mango",        expected: true,  description: "common fruit — dictionary word" },
  { input: "sunshine",     expected: true,  description: "weak common word" },
  { input: "password",     expected: true,  description: "obvious weak password" },
  { input: "tiger",        expected: true,  description: "common animal" },
  { input: "blue",         expected: true,  description: "common colour" },
  { input: "sarah",        expected: true,  description: "common first name" },

  // Date patterns — should be rejected
  { input: "hope2000",     expected: true,  description: "name + year combination" },
  { input: "01012000",     expected: true,  description: "date with no separators" },
  { input: "01/01/2000",   expected: true,  description: "date with separators" },

  // Sequences — should be rejected
  { input: "123456",       expected: true,  description: "ascending sequence" },
  { input: "111111",       expected: true,  description: "repeated digits" },

  // Edge cases
  { input: "",             expected: true,  description: "empty input" },
];

console.log("Running PatternDetector tests...\n");

let passed = 0;
let failed = 0;

testCases.forEach(({ input, expected, description }) => {
  const result = detector.detect(input);
  const status = result === expected ? "PASS" : "FAIL";
  if (status === "PASS") passed++; else failed++;

  console.log(`[${status}] "${input}" — ${description}`);
  if (result === true) {
    console.log(`       ⚠  ${detector.warn()}`);
  }
  console.log("");
});

console.log(`Results: ${passed} passed, ${failed} failed out of ${testCases.length} tests`);
