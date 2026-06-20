// Simple manual test runner for PatternRepository + PatternDetector
// Run with: node test-pattern-detection.js

const PatternRepository = require("./js/patternRepository.js");
const PatternDetector = require("./js/patternDetector.js");

const repo = new PatternRepository();
const detector = new PatternDetector(repo);

const testCases = [
  { input: "mango", expected: false, description: "clean common word" },
  { input: "sunshine", expected: true, description: "weak/common word" },
  { input: "hope2000", expected: true, description: "name + year" },
  { input: "01012000", expected: true, description: "date with no separators" },
  { input: "01/01/2000", expected: true, description: "date with separators" },
  { input: "123456", expected: true, description: "ascending sequence" },
  { input: "111111", expected: true, description: "repeated digits" },
  { input: "elephant", expected: false, description: "clean random word" },
  { input: "", expected: true, description: "empty input" },
  { input: "starlight", expected: false, description: "clean compound word" },
];

console.log("Running PatternDetector tests...\n");

let passed = 0;
let failed = 0;

testCases.forEach(({ input, expected, description }) => {
  const result = detector.detect(input);
  const status = result === expected ? "PASS" : "FAIL";
  if (status === "PASS") passed++; else failed++;

  console.log(`[${status}] "${input}" (${description})`);
  console.log(`       expected: ${expected}, got: ${result}`);
  if (result === true) {
    console.log(`       warning: "${detector.warn()}"`);
  }
  console.log("");
});

console.log(`\nResults: ${passed} passed, ${failed} failed out of ${testCases.length} test cases`);
