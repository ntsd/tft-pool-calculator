import React, { useEffect, useRef, useState } from "react";
import { RootReducer } from "app/rootReducer";
import { useSelector } from "react-redux";
import "./InGame.css";
import { setPosition } from "utils/setWindowPosition";
import { useStore } from "@nanostores/react";
import {
  settingsAtom,
  traits,
} from "../../core/store/tftStore";
import { Player } from "../../core/types";
import { getCDragonImage } from "core/utils";
import PoolModal from "components/PoolModal/PoolModal";

interface PlayerData {
  index: number;
  name: string;
  health: number;
  xp: number;
  localplayer: boolean;
}

async function setupRoster(playerDatas: PlayerData[]) {
  const newPlayers: Player[] = [];
  playerDatas.forEach((data, i) => {
    newPlayers.push({
      id: data.name,
      name: data.name,
      isDead: data.localplayer, // set to dead if it's local player
      traits: [],
    });
  });

  settingsAtom.set({
    ...settingsAtom.get(),
    players: newPlayers,
  });

  // setPosition("in_game");
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
  const settings = useStore(settingsAtom);
  const [selectingIndex, setSelectingIndex] = useState<number>(-1);
  const selectTraitsModalRef = useRef<HTMLDialogElement>(null);

  const handleSelectTrait = (index: number) => {
    console.log("setSelectingIndex", index);
    setSelectingIndex(index);
    console.log("selectTraitsModalRef.current", selectTraitsModalRef.current);
    selectTraitsModalRef.current?.showModal();
  };

  const createPlayerBox = (index: number) => (
    <div className="box">
      {settings.players[index] &&
        !settings.players[index].isDead &&
        (settings.players[index].traits.length > 0 ? (
          <button
            className="w-full h-full flex flex-wrap cursor-pointer"
            onClick={() => {
              handleSelectTrait(index);
            }}
          >
            {settings.players[index].traits.map((t) => (
              <div
                key={`${index}-${t.name}`}
                className="tooltip w-1/2 h-1/2"
                data-tip={t.name}
              >
                <img
                  alt={t.name}
                  src={getCDragonImage(t.icon)}
                  className="w-full h-full"
                ></img>
              </div>
            ))}
          </button>
        ) : (
          <button
            className="absolute bg-transparent top-0 right-0 w-1/2 h-1/2 flex cursor-pointer"
            onClick={() => {
              handleSelectTrait(index);
            }}
          >
            <img
              alt={"bookmark"}
              src={"/bookmark.svg"}
              className="w-full invert"
            ></img>
          </button>
        ))}
    </div>
  );

  // initialize
  useEffect(() => {
    // TODO: remove this mock
    // handleRoster(
    //   '{"MonterHuhter":{"index":1,"health":0,"xp":7,"localplayer":false,"rank":7},"XExy":{"index":2,"health":22,"xp":7,"localplayer":false,"rank":0},"TemPigmo":{"index":3,"health":30,"xp":9,"localplayer":false,"rank":0},"hotcode":{"index":4,"health":52,"xp":9,"localplayer":true,"rank":0},"Playboy Legend":{"index":5,"health":0,"xp":8,"localplayer":false,"rank":8},"SameZ":{"index":6,"health":30,"xp":7,"localplayer":false,"rank":0},"KraTomBoY":{"index":7,"health":78,"xp":8,"localplayer":false,"rank":0},"Trax":{"index":8,"health":0,"xp":7,"localplayer":false,"rank":6}}'
    // );
    setPosition("in_game");
  }, []);

  useEffect(() => {
    // console.info("[InGameWindow][info]", JSON.stringify(info, null, 2));
    const feature = info.feature;
    const key = info.key;

    if (feature === "roster" && key === "player_status") {
      handleRoster(info.value);
    }
  }, [info]);

  return (
    <div className="p-0 m-0 overflow-hidden w-screen h-screen relative">
      <div className="players-container">
        {createPlayerBox(7)}
        {createPlayerBox(0)}
        {createPlayerBox(1)}
        {createPlayerBox(6)}
        <div className="box">
          <PoolModal />
        </div>
        {createPlayerBox(2)}
        {createPlayerBox(5)}
        {createPlayerBox(4)}
        {createPlayerBox(3)}
      </div>

      <dialog
        id="selectTraitsModal"
        className="modal"
        ref={selectTraitsModalRef}
      >
        {settings && settings.players[selectingIndex] && (
          <div className="modal-box">
            <form method="dialog">
              <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">
                ✕
              </button>
            </form>
            <h3 className="text-lg font-bold">Select Trait (select up to 3)</h3>
            <div className="grid grid-cols-6 py-4 w-full gap-1">
              {traits.map((trait) => {
                const has = settings.players[selectingIndex].traits.some(
                  (t) => t.name === trait.name
                );
                return (
                  <div
                    className={`flex flex-col cursor-pointer p-2 justify-center items-center box-border ${
                      has && "border-red-500 border-2"
                    }`}
                    key={trait.name}
                    onClick={() => {
                      const newSetting = settings;
                      if (has) {
                        // remove if it have
                        newSetting.players[selectingIndex].traits =
                          newSetting.players[selectingIndex].traits.filter(
                            (t) => t.name !== trait.name
                          );
                      } else {
                        // skip if select more than 3
                        if (
                          newSetting.players[selectingIndex].traits.length > 2
                        ) {
                          return;
                        }
                        // add if it not have
                        newSetting.players[selectingIndex].traits.push(trait);
                      }
                      settingsAtom.set({ ...newSetting });
                    }}
                  >
                    <img alt={trait.name} src={getCDragonImage(trait.icon)} />
                    <div className="text-center">{trait.name}</div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
        <form method="dialog" className="modal-backdrop">
          <button>close</button>
        </form>
      </dialog>
    </div>
  );
};

export default InGameWindow;
