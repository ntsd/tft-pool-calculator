export const title = "TFT Pool Calculator";

export const description =
  "Estimate champions pool probability and optimize traits in the TFT lobby";

export const githubLink = "https://github.com/ntsd/tft-pool-calculator";

// how many champions in the pool for each
// Ex: tier 1 = 29 of each in the pool, tier 5 = 10 of each in the pool
export const poolSize = [22, 20, 17, 10, 9];

// filter trait that having one champion
export const filterTraits = [];

// color by cost start with 1, 0 for non
export const costToColor = [
  "black",
  "grey",
  "green",
  "blue",
  "purple",
  "yellow",
];
