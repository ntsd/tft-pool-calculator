export interface ChampionAbility {
  desc: string;
  icon: string;
  name: string;
  variables: ChampionVariable[];
}

export interface ChampionVariable {
  name: string;
  value: number[];
}

export interface ChampionStats {
  armor: number;
  attackSpeed: number;
  critChance: number;
  critMultiplier: number;
  damage: number;
  hp: number;
  initialMana: number;
  magicResist: number;
  mana: number;
  range: number;
}

export interface Champion {
  ability: ChampionAbility;
  apiName: string;
  characterName: string;
  cost: number;
  icon: string;
  name: string;
  squareIcon: string;
  stats: ChampionStats;
  tileIcon: string;
  traits: string[];
}

export interface Trait {
  apiName: string;
  desc: string;
  icon: string;
  name: string;
}

export interface TraitPool extends Trait {
  champions: Champion[];
  curPool: number;
  maxPool: number;
}

export interface ChampionPool extends Champion {
  traitObjects: Trait[];
  curPool: number;
  maxPool: number;
}

export interface Player {
  id: string;
  name: string;
  traits: Trait[];
  isDead: boolean;
  isLocalplayer: boolean;
}

export interface Settings {
  players: Player[];
  filterCosts: [boolean, boolean, boolean, boolean, boolean];
}
