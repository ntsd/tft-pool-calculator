import { setMutator } from "../const";
import type { Champion, Trait } from "../types";

export const getChampions = async () => {
  const championsResp = await fetch(`/data/${setMutator}/champions.json`);
  return championsResp.json() as Promise<Champion[]>;
};

export const getTraits = async () => {
  const traitsResp = await fetch(`/data/${setMutator}/traits.json`);
  return traitsResp.json() as Promise<Trait[]>;
};
