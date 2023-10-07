import React, { useEffect, useRef, useState } from "react";
import { RootReducer } from "app/rootReducer";
import { useSelector } from "react-redux";
import "./InGame.css";
import { setPosition } from "utils/setWindowPosition";
import { useStore } from "@nanostores/react";
import { settingsAtom, traits, traitsMap } from "../../core/store/tftStore";
import { Player, Trait } from "../../core/types";
import { getCDragonImage } from "core/utils";
import PoolModal from "components/PoolModal/PoolModal";

const windowId = "in_game";

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
      isLocalplayer: data.localplayer,
      traits: [],
    });
  });

  settingsAtom.set({
    ...settingsAtom.get(),
    players: newPlayers,
  });

  setPosition(windowId);
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
  const setting = settingsAtom.get();

  let players: Array<PlayerData> = [];

  for (const name in roster) {
    const playerData: PlayerData = roster[name];
    playerData.name = name;

    players.push(playerData);
  }

  players = players.sort((a, b) => a.index - b.index);

  if (players.length > 0) {
    // check if index and players are the same
    let isUpdate = players.every((p, i) => {
      if (!setting.players[i] || p.name !== setting.players[i].name) {
        return false;
      }
      return true;
    });

    if (isUpdate) {
      updateRoster(players);
    } else {
      setupRoster(players);
    }
  }
}

async function screenshotRequest() {
  return new Promise<string[]>((resolve, reject) => {
    overwolf.web.sendHttpRequest(
      "http://localhost:23453/screenshot",
      overwolf.web.enums.HttpRequestMethods.GET,
      [],
      "",
      (result: overwolf.web.SendHttpRequestResult) => {
        if (result) {
          if (result.data) {
            const traitStrArr = JSON.parse(result.data) as string[];
            resolve(traitStrArr);
            return;
          }
        }
        reject(new Error("screenshot error:" + result.error));
      }
    );
  });
}

// https://overwolf.github.io/api/live-game-data/supported-games/teamfight-tactics
// https://overwolf.github.io/api/games/input-tracking
const InGameWindow = () => {
  const { info, event } = useSelector((state: RootReducer) => state.background);
  const settings = useStore(settingsAtom);
  const [selectingIndex, setSelectingIndex] = useState<number>(-1);
  const selectTraitsModalRef = useRef<HTMLDialogElement>(null);
  const [searchValue, setSearchValue] = useState("");
  const searchInput = useRef<HTMLInputElement>(null);

  const handleSelectTrait = (index: number) => {
    setSearchValue("");
    setSelectingIndex(index);
    selectTraitsModalRef.current?.showModal();
    searchInput.current?.focus();
  };

  const screenshotAndOCR = async () => {
    const newSetting = settings;
    const traitStrArr = await screenshotRequest();
    newSetting.players[selectingIndex].traits = traitStrArr
      .slice(0, 3)
      .map((traitStr) => traitsMap[traitStr]);
    setSearchValue("");
    settingsAtom.set({ ...newSetting });
  };

  const screenshotAndOCRAll = async () => {
    const newPlayers = settings.players;

    console.log("screenshotAndOCR");

    let localPlayerIndex = 0;
    newPlayers.forEach((player, index) => {
      if (player.isLocalplayer) {
        localPlayerIndex = index;
      }
    });

    overwolf.windows.minimize(windowId);

    let currentPlayerIndex = localPlayerIndex;
    while (true) {
      currentPlayerIndex += 1;
      if (currentPlayerIndex >= newPlayers.length) {
        currentPlayerIndex = 0;
      }
      if (currentPlayerIndex === localPlayerIndex) {
        break;
      }

      const currentPlayer = newPlayers[currentPlayerIndex];
      if (currentPlayer.isDead) {
        continue;
      }

      await overwolf.utils.sendKeyStroke("D1");
      await new Promise((resolve) => setTimeout(resolve, 500)); // sleep 0.5 sec

      const traitStrArr = await screenshotRequest();

      console.log(
        "currentPlayerIndex",
        currentPlayerIndex,
        "traitStrArr",
        traitStrArr
      );
      if (traitStrArr.length > 0) {
        newPlayers[currentPlayerIndex].traits = await traitStrArr
          .slice(0, 2)
          .map((traitStr) => traitsMap[traitStr]);
      }
    }

    settingsAtom.set({
      ...settings,
      players: newPlayers,
    });

    overwolf.windows.maximize(windowId);
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
    setPosition(windowId);
  }, []);

  useEffect(() => {
    // console.info("[event]", JSON.stringify(event, null, 2));
    if (event.length > 0) {
      event.forEach((ev) => {
        if (ev.name === "match_start") {
          // reset if match start
          settingsAtom.set({
            players: [],
            filterCosts: [false, true, true, true, true],
          });
        }
      });
    }
  }, [event]);

  useEffect(() => {
    // console.info("[info]", JSON.stringify(info, null, 2));
    const roster = info["roster"];
    if (roster) {
      // @ts-ignore
      handleRoster(roster["player_status"]);
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
          <div
            data-tip="OCR all"
            className="tooltip absolute bg-transparent top-0 left-0 w-1/2 h-1/2 flex cursor-pointer"
          >
            <button
              className="bg-transparent w-full h-full flex cursor-pointer"
              onClick={() => {
                screenshotAndOCRAll();
              }}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M6 3a3 3 0 00-3 3v1.5a.75.75 0 001.5 0V6A1.5 1.5 0 016 4.5h1.5a.75.75 0 000-1.5H6zM16.5 3a.75.75 0 000 1.5H18A1.5 1.5 0 0119.5 6v1.5a.75.75 0 001.5 0V6a3 3 0 00-3-3h-1.5zM12 8.25a3.75 3.75 0 100 7.5 3.75 3.75 0 000-7.5zM4.5 16.5a.75.75 0 00-1.5 0V18a3 3 0 003 3h1.5a.75.75 0 000-1.5H6A1.5 1.5 0 014.5 18v-1.5zM21 16.5a.75.75 0 00-1.5 0V18a1.5 1.5 0 01-1.5 1.5h-1.5a.75.75 0 000 1.5H18a3 3 0 003-3v-1.5z" />
              </svg>
            </button>
          </div>
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
            <h3 className="text-lg font-bold">Select Trait (select up to 4)</h3>
            <input
              type="text"
              autoFocus
              placeholder="Search"
              className="input input-bordered w-full"
              onChange={(e) => {
                setSearchValue(e.target.value);
              }}
              value={searchValue}
              ref={searchInput}
            />
            <button
              className="btn btn-primary"
              onClick={() => {
                screenshotAndOCR();
              }}
            >
              OCR
            </button>
            <div className="grid grid-cols-6 py-4 w-full gap-1">
              {traits
                .sort((a, b) => b.champions.length - a.champions.length)
                .filter((v) =>
                  v.name.toLowerCase().startsWith(searchValue.toLowerCase())
                )
                .map((trait) => {
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
                          // skip if selected more than 3
                          if (
                            newSetting.players[selectingIndex].traits.length > 3
                          ) {
                            return;
                          }
                          // add if it not have
                          newSetting.players[selectingIndex].traits.push(trait);
                          setSearchValue("");
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
