<script lang="ts">
    import type { PageProps } from "./$types";
    let { data }: PageProps = $props();
</script>

<svelte:head>
    <title>{data.insumo[0].nome}</title>
</svelte:head>

{#if data.insumo.length == 1}
    <img
        src={data.insumo[0].foto_path.replace("./", "/")}
        alt=""
        class="rounded-base w-50"
    />
    <h1>{data.insumo[0].cod_interno}</h1>
    <p>{data.insumo[0].nome}</p>
{:else}
    <h1>Insumo não encontrado!</h1>
{/if}
