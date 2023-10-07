import { atom, type WritableAtom } from "nanostores";
import { getTraits } from "../api/api";
import type { ChampionPool, Settings, Trait, TraitPool } from "../types";
import { getChampions } from "../api/api";
import { filterTraits, poolSize } from "../const";

const championsPerPlayer = 3;

const rawTraits = await getTraits();

export const traitsMap: { [name: string]: Trait } = {};
rawTraits.forEach((trait) => {
  traitsMap[trait.name] = trait;
});

const initTraitsPool: { [name: string]: TraitPool } = {};

export const champions = await getChampions();

const initChampionsPool: { [name: string]: ChampionPool } = {};

// initial traits pool and champions pool
champions.forEach((champion) => {
  const championPoolSize = poolSize[champion.cost - 1];

  let championTraits: Trait[] = [];
  champion.traits.forEach((traitName) => {
    championTraits.push(traitsMap[traitName]);

    // skip if it's filter traits
    if (filterTraits.includes(traitName)) {
      return;
    }

    if (!initTraitsPool[traitName]) {
      initTraitsPool[traitName] = {
        ...traitsMap[traitName],
        champions: [champion],
        curPool: championPoolSize,
        maxPool: championPoolSize,
      };
    } else {
      if (
        !initTraitsPool[traitName].champions.some(
          (c) => c.name === champion.name
        )
      ) {
        initTraitsPool[traitName].champions.push(champion);
        initTraitsPool[traitName].curPool += poolSize[champion.cost - 1];
        initTraitsPool[traitName].maxPool += poolSize[champion.cost - 1];
      }
    }
  });

  initChampionsPool[champion.name] = {
    ...champion,
    curPool: championPoolSize,
    maxPool: championPoolSize,
    traitObjects: championTraits,
  };
});

// traits filter only when have more than 1 champions
export const traits = Object.values(initTraitsPool);

export const settingsAtom: WritableAtom<Settings> = atom<Settings>({
  players: [],
  filterCosts: [false, true, true, true, true],
});

export const championsPoolAtom: WritableAtom<{ [name: string]: ChampionPool }> =
  atom<{ [name: string]: ChampionPool }>({
    ...initChampionsPool,
  });

export const traitsPoolAtom: WritableAtom<{
  [name: string]: TraitPool;
}> = atom<{
  [name: string]: TraitPool;
}>({
  ...initTraitsPool,
});

// calculate traits pool and champion pool
settingsAtom.subscribe((settings) => {
  console.log("settings", settings);

  // deep copies pools
  let newChampionsPool: {
    [name: string]: ChampionPool;
  } = JSON.parse(JSON.stringify(initChampionsPool));
  const newTraitsPool: {
    [name: string]: TraitPool;
  } = JSON.parse(JSON.stringify(initTraitsPool));

  // filter champions by costs
  Object.keys(newChampionsPool).forEach((key) => {
    const champion = newChampionsPool[key];
    if (!settings.filterCosts[champion.cost - 1]) {
      delete newChampionsPool[key];
    }
  });
  Object.keys(newTraitsPool).forEach((traitName) => {
    newTraitsPool[traitName].champions = newTraitsPool[
      traitName
    ].champions.filter((c) => {
      if (settings.filterCosts[c.cost - 1]) {
        return true;
      }
      // reduce max pool when the champions are filter by costs
      newTraitsPool[traitName].maxPool -= poolSize[c.cost - 1];
      return false;
    });
  });

  // update champion current pool from  all traits players playing
  settings.players.forEach((player) => {
    if (player.isDead) return;

    // estimate champion set of this player
    let championsSet = new Set<string>();
    player.traits.forEach((trait) => {
      if (newTraitsPool[trait.name]) {
        newTraitsPool[trait.name].champions.forEach((champion) => {
          championsSet.add(champion.name);
        });
      }
    });

    // reduce current pool by champions set of this player
    championsSet.forEach((championName) => {
      newChampionsPool[championName].curPool -= championsPerPlayer;
      if (newChampionsPool[championName].curPool < 0) {
        newChampionsPool[championName].curPool = 0;
      }
    });
  });

  // update traits current pool from champion pool
  Object.keys(newTraitsPool).forEach((traitName) => {
    let newCurPool = 0;

    newTraitsPool[traitName].champions.forEach((champion) => {
      newCurPool += newChampionsPool[champion.name].curPool;
    });

    newTraitsPool[traitName].curPool = newCurPool;
  });

  console.log("newChampionsPool", newChampionsPool);
  console.log("newTraitsPool", newTraitsPool);

  championsPoolAtom.set({ ...newChampionsPool });
  traitsPoolAtom.set({ ...newTraitsPool });
});
