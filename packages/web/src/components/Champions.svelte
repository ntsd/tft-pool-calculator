<script lang="ts">
  import { costToColor } from "tft-pool-calculator-core/src/const";
  import { championsPoolAtom } from "tft-pool-calculator-core/src/store/tftStore";
  import {
    groupByKey,
    round,
    getCDragonImage,
  } from "tft-pool-calculator-core/src/utils";

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
          <img alt={champion.name} src={getCDragonImage(champion.tileIcon)} />
          <div class="text-center">
            {`${round(champion.curPool / champion.maxPool, 2)}`}
          </div>
        </div>
      {/each}
    </div>
  {/each}
</div>
