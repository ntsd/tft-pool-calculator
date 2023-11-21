import type { Champion, Trait } from "../types.js";
import champions from "../data/TFTSet10/champions.json";
import traits from "../data/TFTSet10/traits.json";

export const getChampions: () => Promise<Champion[]> = async () => {
  return champions;
};

export const getTraits: () => Promise<Trait[]> = async () => {
  return traits;
};
