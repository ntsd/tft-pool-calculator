import { setMutator } from "../const";
import type { Champion, Trait } from "../types";

export const getChampions: () => Promise<Champion[]> = async () => {
  const championsResp = await fetch(`/data/${setMutator}/champions.json`);
  return championsResp.json();
};

export const getTraits: () => Promise<Trait[]> = async () => {
  const traitsResp = await fetch(`/data/${setMutator}/traits.json`);
  return traitsResp.json();
};
