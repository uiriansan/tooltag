<script lang="ts">
    import type { PageProps } from "./$types";
    import { goto } from "$app/navigation";
    import InsumoCard from "$lib/components/insumo_card.svelte";

    let { data }: PageProps = $props();
</script>

<div class="flex gap-2 flex-wrap">
    {#each data.insumos as ins, i}
        <InsumoCard
            nome={ins.nome}
            cod={ins.cod_interno}
            foto={ins.foto}
            ferramenta={ins.ferramenta}
            obs={ins.observacoes}
        />
    {/each}
</div>
