<script lang="ts">
    import SvelteVirtualList from "@humanspeak/svelte-virtual-list";
    import InsumoCard from "$lib/components/insumo_card.svelte";
    import type { Insumo } from "$lib/types";
    import { page } from "$app/state";
    import { onMount, tick } from "svelte";
    import { ferramentas_cache } from "./cache.svelte.js";

    let scroll_index = $state(0);
    let restored_scroll = $state<number | null>(null);
    const limit = 50;
    let is_loading = $state(false);

    let list: SvelteVirtualList;

    let search_query = $state(page.url.searchParams.get("q") ?? null);

    const load_more = async () => {
        if (is_loading || !ferramentas_cache.has_more) return;

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
                ferramentas_cache.items.push(...data.items);
                ferramentas_cache.offset += data.items.length;
            }
        } catch (err) {
            console.log(`Fetch error: ${err}`);
        } finally {
            is_loading = false;
        }
    };

    onMount(() => {
        const url_offset = Number(page.url.searchParams.get("offset"));
        if (ferramentas_cache.offset === 0 && url_offset !== 0) {
            ferramentas_cache.offset = url_offset;
        }
    });

    $effect(() => {
        if (list && restored_scroll !== null) {
            tick().then(() => {
                list.scrollToOffset({
                    offset: restored_scroll!,
                    smoothScroll: false,
                });
                console.log("scrolled!", restored_scroll);
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
            load_more();
        }, 400);

        return () => clearTimeout(timer);
    });

    export const snapshot = {
        capture: () => {
            const vp = document.querySelector(
                '#virtual-list-viewport[aria-label="vlist-viewport"]',
            );
            return vp?.scrollTop ?? 0;
        },
        restore: (value: number) => {
            restored_scroll = value;
        },
    };
</script>

<svelte:head>
    <title>Ferramentas</title>
</svelte:head>

<div
    class="h-screen w-full scrollbar-thin p-1 flex flex-col max-w-[86rem] md:mx-auto md:flex-row overflow-auto"
>
    <div
        class="md:shrink-0 w-full md:h-full md:w-80 bg-neutral-primary-soft p-5"
    >
        <label for="simple-search" class="sr-only">Search</label>
        <div class="relative w-full">
            <div
                class="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none"
            ></div>
            <input
                type="text"
                id="simple-search"
                class="px-3 py-2.5 bg-neutral-secondary-medium border border-default-medium rounded-base ps-9 text-heading text-sm focus:ring-brand focus:border-brand block w-full placeholder:text-body"
                placeholder="Buscar código ou nome..."
                required
                bind:value={search_query}
            />
        </div>
    </div>
    <SvelteVirtualList
        bind:this={list}
        items={ferramentas_cache.items}
        onLoadMore={load_more}
        loadMoreThreshold={limit}
        hasMore={ferramentas_cache.has_more}
        itemsClass="p-1 md:p-5 flex-1"
        viewportLabel="vlist-viewport"
        onRangeChange={() => {
            const vp = document.querySelector(
                '#virtual-list-viewport[aria-label="vlist-viewport"]',
            );
            console.log(vp?.scrollTop);
        }}
    >
        {#snippet renderItem(item, i)}
            <InsumoCard
                nome={item.nome}
                foto={item.foto_path!}
                cod={item.cod_interno}
                obs={item.observacoes}
                ferramenta={true}
            />

            {#if i === ferramentas_cache.items.length - 1 && is_loading}
                <h1>Loading...</h1>
            {/if}
        {/snippet}
    </SvelteVirtualList>
</div>

<style>
    :global(body) {
        overflow: hidden;
    }
</style>
