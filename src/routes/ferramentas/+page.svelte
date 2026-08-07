<script lang="ts">
    import InsumoCard from "$lib/components/insumo_card.svelte";
    import { Virtualizer, type VirtualizerHandle } from "virtua/svelte";
    import { ferramentas_cache } from "./cache.svelte";
    import { onMount } from "svelte";
    import { page } from "$app/state";
    import type { Insumo } from "$lib/types";
    import { tick } from "svelte";

    const limit = 10;
    let is_loading = $state(false);
    let restored_scroll = $state<number | null>(null);
    let search_query = $state<string | null>(null);

    let virtualizer: VirtualizerHandle;

    const load_data = async () => {
        if (is_loading || !ferramentas_cache.has_more) return;
        // Requisitar mais dados apenas se o último item da list estiver visível:
        const vp_size = virtualizer.getViewportSize();
        const scroll_offset = virtualizer.getScrollOffset();
        const scroll_size = virtualizer.getScrollSize();
        const load_threshold = 300;

        if (scroll_offset + vp_size < scroll_size - load_threshold) return;

        console.log("requesting...");

        is_loading = true;

        let req_url = `/api/ferramentas/?offset=${ferramentas_cache.offset}&limit=${limit}`;

        if (ferramentas_cache.debounce_query) {
            req_url = `${req_url}&q=${ferramentas_cache.debounce_query}`;
        }

        try {
            const res = await fetch(req_url);
            const data = await res.json();

            if (data.items.length === 0) {
                ferramentas_cache.has_more = false;
            } else {
                ferramentas_cache.items = [
                    ...ferramentas_cache.items,
                    ...data.items,
                ];
                ferramentas_cache.offset += data.items.length;
            }
        } catch (err) {
            console.log(`Fetch error: ${err}`);
        } finally {
            is_loading = false;
        }
    };

    export const snapshot = {
        capture: () => {
            return virtualizer.getScrollOffset();
        },
        restore: (value: number) => {
            restored_scroll = value;
        },
    };

    onMount(async () => {
        const url_offset = Number(page.url.searchParams.get("offset"));
        if (ferramentas_cache.offset === 0 && url_offset !== 0) {
            ferramentas_cache.offset = url_offset;
        }

        if (restored_scroll === null) {
            await load_data();
        }
    });

    $effect(() => {
        if (virtualizer && restored_scroll !== null) {
            tick().then(() => {
                virtualizer.scrollTo(restored_scroll!);
                restored_scroll = null;
            });
        }
    });

    $effect(() => {
        if (!search_query || search_query === ferramentas_cache.debounce_query)
            return;

        const timer = setTimeout(() => {
            ferramentas_cache.debounce_query = search_query;
            ferramentas_cache.offset = 0;
            ferramentas_cache.has_more = true;
            ferramentas_cache.items = [];
            load_data();
        }, 400);

        return () => clearTimeout(timer);
    });
</script>

<div class="h-screen overflow-auto">
    <Virtualizer
        bind:this={virtualizer}
        data={ferramentas_cache.items}
        getKey={(item, i) => `${item.cod_interno}${i}`}
        onscroll={load_data}
    >
        {#snippet children(ferramenta, index)}
            <InsumoCard
                cod={ferramenta.cod_interno}
                nome={ferramenta.nome}
                foto={ferramenta.foto_path!}
                obs={ferramenta.observacoes}
                ferramenta={true}
            />
        {/snippet}
    </Virtualizer>

    {#if is_loading}
        <h1>Loading...</h1>
    {/if}
</div>

<style>
    :global(body) {
        overflow: hidden;
    }
</style>
