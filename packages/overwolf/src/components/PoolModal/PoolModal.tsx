import React, { useEffect, useRef, useState } from "react";
import { useStore } from "@nanostores/react";
import {
  costToColor,
  traitsPoolAtom,
  championsPoolAtom,
  settingsAtom,
  ChampionPool,
  TraitPool,
  getCDragonImageRelativePath,
  groupByKey,
  round,
} from "tft-pool-calculator-core";
import "./PoolModal.css";

const PoolModal = () => {
  const [page, setPage] = useState<"traits" | "champions">("traits");

  const settings = useStore(settingsAtom);
  const traitsPool = useStore(traitsPoolAtom);
  const championsPool = useStore(championsPoolAtom);
  const poolModalRef = useRef<HTMLDialogElement>(null);

  const headers = [
    "Trait",
    "Champions",
    "Estimate Pool",
    "Max Pool",
    "Probability",
  ];

  const [sortBy, setSortBy] = useState<(typeof headers)[number]>("Probability");
  const [sortDesc, setSortDesc] = useState<boolean>(true);
  const [sortedTraitsPool, setSortedTraitsPool] = useState<TraitPool[]>([]);

  useEffect(() => {
    setSortedTraitsPool(
      Object.values(traitsPool).sort((a, b) => {
        if (!sortDesc) {
          // if sort desc swap
          const c = a;
          a = b;
          b = c;
        }

        switch (sortBy) {
          case "Trait":
            return b.name.localeCompare(a.name);
          case "Champions":
            return b.champions.length - a.champions.length;
          case "Max Pool":
            return b.maxPool - a.maxPool;
          case "Estimate Pool":
            return b.curPool - a.curPool;
          case "Probability":
            return b.curPool / b.maxPool - a.curPool / a.maxPool;
        }
        return b.curPool - a.curPool;
      })
    );
  }, [sortBy, sortDesc, traitsPool]);

  const [championsByCosts, setChampionsByCosts] = useState<{
    [k: string]: ChampionPool[];
  }>({});

  useEffect(() => {
    setChampionsByCosts(
      Object.fromEntries(
        // sort by cost ascending
        Object.entries(
          // group champion by cost
          groupByKey(Object.values(championsPool), (c) => c.cost.toString())
        ).sort(([keyA, a], [keyB, b]) => keyA.localeCompare(keyB))
      )
    );
  }, [championsPool]);

  return (
    <div className="absolute bg-transparent top-0 right-0 w-1/2 h-1/2 flex cursor-pointer">
      <div className="tooltip w-full h-full" data-tip="Show Pool Analytic">
        <button
          className="bg-transparent w-full h-full flex cursor-pointer"
          onClick={() => {
            poolModalRef.current?.showModal();
          }}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M3 6a3 3 0 013-3h12a3 3 0 013 3v12a3 3 0 01-3 3H6a3 3 0 01-3-3V6zm4.5 7.5a.75.75 0 01.75.75v2.25a.75.75 0 01-1.5 0v-2.25a.75.75 0 01.75-.75zm3.75-1.5a.75.75 0 00-1.5 0v4.5a.75.75 0 001.5 0V12zm2.25-3a.75.75 0 01.75.75v6.75a.75.75 0 01-1.5 0V9.75A.75.75 0 0113.5 9zm3.75-1.5a.75.75 0 00-1.5 0v9a.75.75 0 001.5 0v-9z"
              clipRule="evenodd"
            />
          </svg>
        </button>
      </div>
      <dialog className="modal" ref={poolModalRef}>
        <div className="modal-box min-w-[70%]">
          <form method="dialog">
            <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">
              ✕
            </button>
          </form>
          <h3 className="font-bold text-lg">Pool Analytic</h3>
          <div className="flex gap-2 items-center justify-center">
            <span>Cost Filter :</span>
            <div className="join">
              {[0, 1, 2, 3, 4].map((i) => (
                <button
                  key={i}
                  className={`btn join-item ${
                    settings.filterCosts[i] && `btn-secondary`
                  }`}
                  onClick={() => {
                    const newFilterCosts = settings.filterCosts;
                    newFilterCosts[i] = !newFilterCosts[i];
                    settingsAtom.set({
                      ...settings,
                      filterCosts: newFilterCosts,
                    });
                  }}
                >
                  {i + 1}
                </button>
              ))}
            </div>
          </div>
          <div className="py-2">
            <div className="tabs">
              <button
                className={`tab tab-lg tabs-boxed ${
                  page === "traits" && "tab-active"
                }`}
                onClick={() => {
                  setPage("traits");
                }}
              >
                Traits
              </button>
              <button
                className={`tab tab-lg tabs-boxed ${
                  page === "champions" && "tab-active"
                }`}
                onClick={() => {
                  setPage("champions");
                }}
              >
                Champions
              </button>
            </div>
          </div>
          {page === "traits" ? (
            <div className="overflow-x-auto">
              <table className="table">
                <thead>
                  <tr>
                    {headers.map((header) => (
                      <th>
                        <button
                          className={
                            header === sortBy
                              ? sortDesc
                                ? "bg-base-100 arrow-up"
                                : "arrow-down"
                              : "arrow-up arrow-down"
                          }
                          onClick={() => {
                            if (sortBy === header) {
                              setSortDesc(!sortDesc);
                            }
                            setSortBy(header);
                          }}
                        >
                          {header}
                        </button>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {sortedTraitsPool
                    .filter((t) => t.maxPool > 0)
                    .map((trait) => (
                      <tr>
                        <th>{trait.name}</th>
                        <td className="flex gap-1">
                          {trait.champions
                            .filter((c) => championsPool[c.name])
                            .map((c) => ({
                              name: c.name,
                              cost: championsPool[c.name].cost,
                              curPool: championsPool[c.name].curPool,
                              maxPool: championsPool[c.name].maxPool,
                              percent:
                                championsPool[c.name].curPool /
                                championsPool[c.name].maxPool,
                            }))
                            .sort((a, b) => a.curPool - b.curPool)
                            .map((c) => ({
                              ...c,
                              text: `${c.name} (${c.curPool}/${
                                c.maxPool
                              }/${round(c.percent)})`,
                            }))
                            .map((champion) => (
                              <span
                                className={`text-${
                                  costToColor[champion.cost]
                                }-600`}
                              >
                                {champion.text}
                              </span>
                            ))}
                        </td>
                        <td>{trait.curPool}</td>
                        <td>{trait.maxPool}</td>
                        <td>{round(trait.curPool / trait.maxPool)}</td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="flex flex-col">
              {Object.entries(championsByCosts).map(([cost, champions]) => (
                <div className="flex flex-row">
                  {champions.map((champion) => (
                    <div
                      className={`bg-${
                        costToColor[champion.cost]
                      }-600 relative text-white text-xs md:text-md`}
                    >
                      <img
                        alt={champion.name}
                        src={getCDragonImageRelativePath(champion.tileIcon)}
                      />
                      <div className="text-center">
                        {`${champion.curPool}/${champion.maxPool}/${round(
                          champion.curPool / champion.maxPool,
                          2
                        )}`}
                      </div>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          )}
        </div>
        <form method="dialog" className="modal-backdrop">
          <button>close</button>
        </form>
      </dialog>
    </div>
  );
};

export default PoolModal;
