import { setMutator } from "../const.js";
import type { Champion, Trait } from "../types.js";

export const getChampions: () => Promise<Champion[]> = async () => {
  const championsResp = await fetch(`data/${setMutator}/champions.json`);
  return championsResp.json();
};

export const getTraits: () => Promise<Trait[]> = async () => {
  const traitsResp = await fetch(`data/${setMutator}/traits.json`);
  return traitsResp.json();
};
