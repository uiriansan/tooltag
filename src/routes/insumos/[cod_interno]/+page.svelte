<script lang="ts">
    import type { PageProps } from "./$types";
    let { data }: PageProps = $props();
</script>

{#if data.insumo.length == 1}
    <h1>{data.insumo[0].cod_interno}</h1>
    <p>{data.insumo[0].nome}</p>
{:else}
    <h1>Insumo não encontrado!</h1>
{/if}
