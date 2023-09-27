<script lang="ts">
  import { costToColor } from "tft-pool-calculator-core/const";
  import { championsPoolAtom } from "../store/tftStore";
  import { groupByKey, round } from "../utils";

  $: championsByCosts = Object.fromEntries(
    // sort by cost ascending
    Object.entries(
      // group champion by cost
      groupByKey(Object.values($championsPoolAtom), (c) => c.cost.toString())
    ).sort(([keyA, a], [keyB, b]) => keyA.localeCompare(keyB))
  );
</script>

<div class="flex flex-col">
  {#each Object.entries(championsByCosts) as [cost, champions]}
    <div class="flex flex-row">
      {#each champions as champion}
        <div
          class={`bg-${
            costToColor[champion.cost]
          }-600 relative text-white text-xs md:text-md`}
        >
          <img
            alt={champion.name}
            src={`https://raw.communitydragon.org/latest/game/${champion.squareIcon
              .toLocaleLowerCase()
              .replace(".tex", ".png")}`}
          />
          <div class="text-center">
            {`${round(champion.curPool / champion.maxPool, 2)}`}
          </div>
        </div>
      {/each}
    </div>
  {/each}
</div>
