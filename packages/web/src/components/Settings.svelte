<script lang="ts">
  import Select from "svelte-select";
  import type { Trait } from "tft-pool-calculator-core/src/types";
  import {
    traits,
    settingsAtom,
  } from "tft-pool-calculator-core/src/store/tftStore";
  import { uuidv4 } from "tft-pool-calculator-core/src/utils";

  const onSelectChange = (index: number) => {
    return (e: CustomEvent<Trait[]>) => {
      const settings = settingsAtom.get();
      settings.players[index].traits = e.detail || [];
      settingsAtom.set({ ...settings });
    };
  };
</script>

<div class="flex flex-col gap-2">
  {#each $settingsAtom.players as player, index}
    <div class="flex flex-col md:flex-row gap-2">
      <input
        type="text"
        placeholder="Player Name"
        class="input input-bordered max-w-xs"
        bind:value={player.name}
      />
      <Select
        id={player.id}
        items={traits}
        name={"Traits"}
        multiple
        searchable={true}
        label="name"
        itemId="name"
        class="svelte-select"
        placeholder="Traits"
        placeholderAlwaysShow
        on:input={onSelectChange(index)}
        value={player.traits}
      />
    </div>
  {/each}

  <div class="flex justify-between">
    <button
      class="btn btn-primary"
      on:click={() => {
        settingsAtom.set({
          ...$settingsAtom,
          players: [
            ...$settingsAtom.players,
            {
              id: uuidv4(),
              name: `Player ${$settingsAtom.players.length + 1}`,
              traits: [],
              isDead: false,
            },
          ],
        });
      }}
      disabled={$settingsAtom.players.length > 6}>Add Player</button
    >
    <button
      class="btn btn-ghost"
      on:click={() => {
        settingsAtom.set({
          ...$settingsAtom,
          players: [
            ...$settingsAtom.players.map((p) => ({
              ...p,
              traits: [],
            })),
          ],
        });
      }}>Reset All</button
    >
  </div>
  <div class="flex gap-2 items-center justify-center">
    <span>Cost Filter :</span>
    <div class="join">
      {#each [0, 1, 2, 3, 4] as num}
        <button
          class={`btn join-item ${
            $settingsAtom.filterCosts[num] && `btn-secondary`
          }`}
          on:click={() => {
            const newFilterCosts = $settingsAtom.filterCosts;
            newFilterCosts[num] = !newFilterCosts[num];
            settingsAtom.set({
              ...$settingsAtom,
              filterCosts: newFilterCosts,
            });
          }}
        >
          {num + 1}
        </button>
      {/each}
    </div>
  </div>
</div>
