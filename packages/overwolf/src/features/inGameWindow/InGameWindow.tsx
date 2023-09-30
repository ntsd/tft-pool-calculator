import React, { useEffect, useState } from "react";
import { RootReducer } from "app/rootReducer";
import { useSelector } from "react-redux";
import "./InGame.css";
import { setPosition } from "utils/setWindowPosition";
import { useStore } from "@nanostores/react";
import {
  settingsAtom,
  traitsPoolAtom,
  championsPoolAtom,
} from "../../core/store/tftStore";
import { Player } from "../../core/types";
import { SelectTrait } from "components/SelectTrait/SelectTrait";

interface PlayerData {
  index: number;
  name: string;
  health: number;
  xp: number;
}

async function setupRoster(playerDatas: PlayerData[]) {
  const newPlayers: Player[] = [];
  playerDatas.forEach((data, i) => {
    newPlayers.push({
      id: data.name,
      name: data.name,
      isDead: false,
      traits: [],
    });
  });

  settingsAtom.set({
    ...settingsAtom.get(),
    players: newPlayers,
  });

  setPosition("in_game", 350, 170);
}

function updateRoster(playerDatas: PlayerData[]) {
  const newPlayers = settingsAtom.get().players;

  newPlayers.forEach((player, i) => {
    playerDatas.forEach((data) => {
      if (player.name === data.name && data.health <= 0) {
        newPlayers[i].isDead = true;
      }
    });
  });

  settingsAtom.set({
    ...settingsAtom.get(),
    players: [...newPlayers],
  });
}

function handleRoster(jsonStr: string) {
  const roster = JSON.parse(jsonStr);

  const players: Array<PlayerData> = [];

  for (const name in roster) {
    const playerData: PlayerData = roster[name];
    playerData.name = name;

    players.push(playerData);
  }

  players.sort((a, b) => a.index - b.index);

  if (players.length) {
    if (settingsAtom.get().players.length && players.length) {
      updateRoster(players);
    } else {
      setupRoster(players);
    }
  }
}

// https://overwolf.github.io/api/live-game-data/supported-games/teamfight-tactics
const InGameWindow = () => {
  const { info } = useSelector((state: RootReducer) => state.background);
  const traitsPool = useStore(traitsPoolAtom);
  const championsPool = useStore(championsPoolAtom);
  const settings = useStore(settingsAtom);

  // initialize
  // useEffect(() => {
  //   setPosition("in_game", 350, 170);
  // }, []);

  useEffect(() => {
    const feature = info.feature;
    const key = info.key;

    console.info("[InGameWindow][info]", JSON.stringify(info, null, 2));

    if (feature === "roster" && key === "player_status") {
      handleRoster(info.value);
    }
  }, [info]);

  return (
    <div className="p-0 m-0 overflow-hidden w-full h-full relative">
      <div className="players-container">
        <div id="box-7" className="box">
          {settings.players[7] && <SelectTrait>test</SelectTrait>}
        </div>
        <div id="box-0" className="box">
          {settings.players[0] && <SelectTrait>test</SelectTrait>}
        </div>
        <div id="box-1" className="box">
          {settings.players[1] && <SelectTrait>test</SelectTrait>}
        </div>
        <div id="box-6" className="box">
          {settings.players[6] && <SelectTrait>test</SelectTrait>}
        </div>
        <div className="box invisible"></div>
        <div id="box-2" className="box">
          {settings.players[2] && <SelectTrait>test</SelectTrait>}
        </div>
        <div id="box-5" className="box">
          {settings.players[5] && <SelectTrait>test</SelectTrait>}
        </div>
        <div id="box-4" className="box">
          {settings.players[4] && <SelectTrait>test</SelectTrait>}
        </div>
        <div id="box-3" className="box">
          {settings.players[3] && <SelectTrait>test</SelectTrait>}
        </div>
      </div>
    </div>
  );
};

export default InGameWindow;
