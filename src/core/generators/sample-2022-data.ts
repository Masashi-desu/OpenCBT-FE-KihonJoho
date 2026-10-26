// Reviewed example inputs for a managed diagram; no runtime code comes from data.
export const sampleBigramCases = [
  { words: ["importance", "inflation", "information", "innovation"], first: "n", second: "f" },
  { words: ["banana", "band", "car", "can"], first: "a", second: "n" },
  { words: ["network", "newton", "banana", "can"], first: "n", second: "e" },
  { words: ["paper", "pen", "apple", "map"], first: "p", second: "e" },
] as const;
