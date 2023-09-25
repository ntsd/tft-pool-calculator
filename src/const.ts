export const title = "TFT Pool Calculator";

export const description =
  "Estimate champions pool probability and optimize trait in the TFT lobby";

export const githubLink = "https://github.com/ntsd/tft-pool-calculator";

export const setMutator = "TFTSet9_Stage2";

// how many champions in the pool for each
// Ex: tier 1 = 29 of each in the pool, tier 5 = 10 of each in the pool
export const poolSize = [29, 22, 18, 12, 10];

// roll percentage of tier per level
// start with 1
export const rollProbabilities = [
  [100, 0, 0, 0, 0],
  [100, 0, 0, 0, 0],
  [75, 25, 0, 0, 0],
  [55, 30, 15, 0, 0],
  [45, 33, 20, 2, 0],
  [25, 40, 30, 5, 1],
  [19, 30, 35, 15, 4],
  [16, 20, 35, 25, 16],
  [9, 15, 30, 30, 25],
  [5, 10, 20, 40, 35],
];

// filter trait that having one champion
export const filterTraits = [
  "Darkin",
  "Wanderer",
  "Reaver King",
  "Technogenius",
  "Empress",
];

// color by cost start with 1, 0 for non
export const costToColor = [
  "black",
  "grey",
  "green",
  "blue",
  "purple",
  "yellow",
];
