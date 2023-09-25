<script lang="ts">
  import { costToColor } from "../const";
  import { championsPoolAtom, traitsPoolAtom } from "../store/tftStore";
  import { round } from "../utils";

  const headers = [
    "Trait",
    "Champions",
    "Estimate Pool",
    "Max Pool",
    "Probability",
  ];

  let sortBy: (typeof headers)[number] = "Probability";
  let sortDesc = true;

  $: sortedTraitsPool = Object.values($traitsPoolAtom).sort((a, b) => {
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
  });
</script>

<div class="overflow-x-auto">
  <table class="table">
    <thead>
      <tr>
        {#each headers as header}
          <th>
            <button
              class={header === sortBy
                ? sortDesc
                  ? "bg-base-100 arrow-up"
                  : "arrow-down"
                : "arrow-up arrow-down"}
              on:click={() => {
                if (sortBy == header) {
                  sortDesc = !sortDesc;
                }
                sortBy = header;
              }}
            >
              {header}
            </button>
          </th>
        {/each}
      </tr>
    </thead>
    <tbody>
      {#each sortedTraitsPool as trait}
        <tr>
          <th>{trait.name}</th>
          <td class="flex gap-1">
            {#each trait.champions
              .map( (c) => ({ name: c.name, cost: $championsPoolAtom[c.name].cost, curPool: $championsPoolAtom[c.name].curPool, maxPool: $championsPoolAtom[c.name].maxPool, percent: $championsPoolAtom[c.name].curPool / $championsPoolAtom[c.name].maxPool }) )
              .sort((a, b) => a.curPool - b.curPool)
              .map( (c) => ({ ...c, text: `${c.name} (${c.curPool}/${c.maxPool}/${round(c.percent)})` }) ) as champion}
              <span class={`text-${costToColor[champion.cost]}-600`}
                >{champion.text}</span
              >
            {/each}
          </td>
          <td>{trait.curPool}</td>
          <td>{trait.maxPool}</td>
          <td>{round(trait.curPool / trait.maxPool)}</td>
        </tr>
      {/each}
    </tbody>
  </table>
</div>

<style>
  th button {
    width: 100%;
    display: flex;
    align-items: center;
  }
  th button {
    padding-right: 18px;
    position: relative;
  }
  th button:before,
  th button:after {
    border: 4px solid transparent;
    content: "";
    display: block;
    height: 0;
    right: 5px;
    top: 50%;
    position: absolute;
    width: 0;
  }
  th button.arrow-up:before {
    border-bottom-color: #666;
    margin-top: -9px;
  }
  th button.arrow-down:after {
    border-top-color: #666;
    margin-top: 1px;
  }
</style>
