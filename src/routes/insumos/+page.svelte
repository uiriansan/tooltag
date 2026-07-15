<script lang="ts">
    import type { PageProps } from "./$types";
    import { goto } from "$app/navigation";

    let { data }: PageProps = $props();
</script>

<h2>{data.insumos.length}</h2>

<div class="flex gap-2 flex-wrap">
    {#each data.insumos as ins, i}
        <div
            class="bg-gray-800 p-10 w-2xl rounded-sm cursor-pointer hover:bg-gray-900 transition-colors duration-200"
            onclick={() => goto(`/insumos/${ins.cod_interno}`)}
        >
            <h1 class="font-bold">{i + 1}. {ins.cod_interno}</h1>
            <p class="text-gray-500">{ins.nome}</p>
        </div>
    {/each}
</div>
