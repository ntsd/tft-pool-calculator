<script lang="ts">
  import Select from "svelte-select";
  import type { Trait } from "tft-pool-calculator-core/types";
  import {
    traits,
    settingsAtom,
  } from "tft-pool-calculator-core/store/tftStore";
  import { uuidv4 } from "tft-pool-calculator-core/utils";

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
      <button
        class={`btn join-item ${
          $settingsAtom.filterCosts[0] && `btn-secondary`
        }`}
        on:click={() => {
          const newFilterCosts = $settingsAtom.filterCosts;
          newFilterCosts[0] = !newFilterCosts[0];
          settingsAtom.set({
            ...$settingsAtom,
            filterCosts: newFilterCosts,
          });
        }}
      >
        1
      </button>
      <button
        class={`btn join-item ${
          $settingsAtom.filterCosts[1] && `btn-secondary`
        }`}
        on:click={() => {
          const newFilterCosts = $settingsAtom.filterCosts;
          newFilterCosts[1] = !newFilterCosts[1];
          settingsAtom.set({
            ...$settingsAtom,
            filterCosts: newFilterCosts,
          });
        }}
      >
        2
      </button>
      <button
        class={`btn join-item ${
          $settingsAtom.filterCosts[2] && `btn-secondary`
        }`}
        on:click={() => {
          const newFilterCosts = $settingsAtom.filterCosts;
          newFilterCosts[2] = !newFilterCosts[2];
          settingsAtom.set({
            ...$settingsAtom,
            filterCosts: newFilterCosts,
          });
        }}
      >
        3
      </button>
      <button
        class={`btn join-item ${
          $settingsAtom.filterCosts[3] && `btn-secondary`
        }`}
        on:click={() => {
          const newFilterCosts = $settingsAtom.filterCosts;
          newFilterCosts[3] = !newFilterCosts[3];
          settingsAtom.set({
            ...$settingsAtom,
            filterCosts: newFilterCosts,
          });
        }}
      >
        4
      </button>
      <button
        class={`btn join-item ${
          $settingsAtom.filterCosts[4] && `btn-secondary`
        }`}
        on:click={() => {
          const newFilterCosts = $settingsAtom.filterCosts;
          newFilterCosts[4] = !newFilterCosts[4];
          settingsAtom.set({
            ...$settingsAtom,
            filterCosts: newFilterCosts,
          });
        }}
      >
        5
      </button>
    </div>
  </div>
</div>
