import React, { useEffect, useRef, useState } from "react";
import { RootReducer } from "app/rootReducer";
import { useSelector } from "react-redux";
import "./InGame.css";
import { setPosition } from "utils/setWindowPosition";
import { useStore } from "@nanostores/react";
import {
  settingsAtom,
  traits,
  traitsMap,
  Player,
  getCDragonImage,
  filterTraits,
} from "tft-pool-calculator-core";
import PoolModal from "components/PoolModal/PoolModal";
import { createWorker } from "tesseract.js";
import { Image } from "image-js";
import { stringSimilarity } from "string-similarity-js";
import { WINDOW_NAMES } from "app/constants";

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

  setPosition(WINDOW_NAMES.INGAME);
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

const traitArray = Object.keys(traitsMap);

function getCharWhiteList() {
  let charWhiteListMap: { [name: string]: boolean } = {};
  traitArray.forEach((traitName) => {
    for (var i = 0; i < traitName.length; i++) {
      var char = traitName.charAt(i);
      charWhiteListMap[char] = true;
    }
  });

  return Object.keys(charWhiteListMap)
    .sort((a, b) => a.charCodeAt(0) - b.charCodeAt(0))
    .join("");
}

function getCloseTrait(text: string) {
  for (let i = 0; i < traitArray.length; i++) {
    const similar = stringSimilarity(traitArray[i], text, 1);
    if (similar > 0.75) {
      return traitArray[i];
    }
  }
  return "";
}

console.log("getCharWhiteList", getCharWhiteList());

const ocrWorker = await createWorker("eng", undefined, {
  logger: (m) => {
    // console.log("tesseract", m)
  },
});
await ocrWorker.reinitialize("eng", undefined, {
  load_system_dawg: "0",
  load_freq_dawg: "0",
  load_number_dawg: "0",
});
await ocrWorker.setParameters({
  tessedit_char_whitelist: getCharWhiteList(),
});

async function takeScreenShotOCR() {
  return new Promise<string[]>((resolve, reject) => {
    overwolf.media.getScreenshotUrl(
      {
        roundAwayFromZero: true,
        crop: {
          x: 0,
          y: -0.25,
          width: -0.2,
          height: -0.25,
        },
      },
      (result) => {
        if (!result || result.error) {
          reject(new Error(result.error));
          return;
        }
        if (!result.url) {
          reject(new Error("error to get screenshot url"));
          return;
        }
        Image.load(result.url).then((image) => {
          let grey = image.grey({
            algorithm: (red: number, green: number, blue: number) => {
              if (red > 200 && green > 200 && blue > 200) {
                return 0;
              }
              return 255;
            },
          });
          grey.toBlob().then((blob) => {
            ocrWorker.recognize(blob, {}).then((result) => {
              // console.log("result", result.data);
              let traits: string[] = [];
              result.data.text
                .trim()
                .split(/\s+/)
                .forEach((word) => {
                  const closestTrait = getCloseTrait(word);
                  if (closestTrait !== "") {
                    traits.push(closestTrait);
                  }
                });
              // console.log("traits", traits);
              resolve(traits);
            });
          });
        });
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
    const traitStrArr = await takeScreenShotOCR();
    newSetting.players[selectingIndex].traits = traitStrArr
      .filter((t) => !filterTraits.includes(t))
      .slice(0, 2)
      .map((traitStr) => traitsMap[traitStr]);
    setSearchValue("");
    settingsAtom.set({ ...newSetting });
    selectTraitsModalRef.current?.close();
  };

  const screenshotAndOCRAll = async () => {
    const newPlayers = settings.players;

    let localPlayerIndex = 0;
    newPlayers.forEach((player, index) => {
      if (player.isLocalplayer) {
        localPlayerIndex = index;
      }
    });

    overwolf.windows.minimize(WINDOW_NAMES.INGAME);
    await new Promise((resolve) => setTimeout(resolve, 200)); // sleep 0.2 sec
    // https://learn.microsoft.com/en-us/dotnet/api/system.windows.input.key?view=windowsdesktop-7.0
    await overwolf.utils.sendKeyStroke("Space");
    await new Promise((resolve) => setTimeout(resolve, 200)); // sleep 0.2 sec

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
      await new Promise((resolve) => setTimeout(resolve, 200)); // sleep 0.2 sec

      const traitStrArr = await takeScreenShotOCR();

      console.log(
        "currentPlayerIndex",
        currentPlayerIndex,
        "traitStrArr",
        traitStrArr
      );
      if (traitStrArr.length > 0) {
        newPlayers[currentPlayerIndex].traits = await traitStrArr
          .filter((t) => !filterTraits.includes(t))
          .slice(0, 2)
          .map((traitStr) => traitsMap[traitStr]);
      }
    }

    settingsAtom.set({
      ...settings,
      players: newPlayers,
    });

    overwolf.windows.maximize(WINDOW_NAMES.INGAME);
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
    setPosition(WINDOW_NAMES.INGAME);
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
