<script lang="ts">
    import InsumoCard from "$lib/components/insumo_card.svelte";
    import { WindowVirtualizer } from "virtua/svelte";
    import { ferramentas_cache } from "./cache.svelte";
    import { onMount } from "svelte";
    import { page } from "$app/state";
    import { SortFerramentas, type Insumo } from "$lib/types";
    import { tick } from "svelte";
    import InsumoCardSkeleton from "$lib/components/insumo_card_skeleton.svelte";
    import * as InputGroup from "$lib/components/ui/input-group";
    import SearchIcon from "@lucide/svelte/icons/search";
    import XIcon from "@lucide/svelte/icons/x";
    import SortIcon from "@lucide/svelte/icons/list-sort-ascending";
    import * as Select from "$lib/components/ui/select";
    import type { PageProps } from "./$types";
    import Button from "$lib/components/ui/button/button.svelte";
    import Label from "$lib/components/ui/label/label.svelte";
    import { goto } from "$app/navigation";

    let { data }: PageProps = $props();

    let tipos_ferramentas: { id: number; nome: string }[] =
        data.tipos_ferramentas;
    let selected_tipos_ferramentas = $state<number[]>([]);

    const limit = 50;
    let is_loading = $state(false);
    let restored_scroll = $state<number | null>(null);
    let search_query = $state<string | null>(page.url.searchParams.get("q"));
    let sort_method = $state<string>(
        page.url.searchParams.get("sort") || "COD_AZ",
    );

    let search_input = $state<HTMLInputElement | null>(null);

    const load_data = async () => {
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

    const calculate_load_bounds = async () => {
        // Requisitar mais dados apenas se o último item da list estiver visível:
        const vp_size = window.innerHeight;
        const scroll_offset = window.scrollY;
        const scroll_size = document.documentElement.scrollHeight;
        const load_threshold = 300;

        if (scroll_offset + vp_size < scroll_size - load_threshold) return;

        await load_data();
    };

    export const snapshot = {
        capture: () => {
            return window.scrollY;
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

        if (restored_scroll === null && ferramentas_cache.items.length === 0) {
            await load_data();
        }
    });

    $effect(() => {
        if (restored_scroll == null) return;

        // FIXME: Window scrolling again after this, resulting in incorrect viewport positioning
        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                window.scrollTo(0, restored_scroll!);
                restored_scroll = null;
            });
        });
    });

    $effect(() => {
        if (
            search_query &&
            search_query.trim() === ferramentas_cache.debounce_query
        )
            return;

        const timer = setTimeout(async () => {
            if (search_query) {
                ferramentas_cache.debounce_query = search_query.trim();
                ferramentas_cache.offset = 0;
                ferramentas_cache.has_more = true;
                ferramentas_cache.items = [];

                page.url.searchParams.set(
                    "q",
                    ferramentas_cache.debounce_query,
                );
                goto(page.url, {
                    replaceState: true,
                    noScroll: true,
                    keepFocus: true,
                });

                await load_data();
            } else {
                page.url.searchParams.delete("q");
                goto(page.url, {
                    replaceState: true,
                    noScroll: true,
                    keepFocus: true,
                });
            }
        }, 400);

        return () => clearTimeout(timer);
    });

    const join_selected_tipos = () => {
        if (
            selected_tipos_ferramentas.length === 0 ||
            selected_tipos_ferramentas.length === tipos_ferramentas.length
        ) {
            return "Todos os tipos";
        }

        let selected_nomes = [];
        for (const id of selected_tipos_ferramentas) {
            const tipo = tipos_ferramentas.find((t) => t.id === id);
            if (tipo) selected_nomes.push(tipo.nome);
        }
        return selected_nomes.join(", ");
    };

    let y = $state(0);
</script>

<svelte:head>
    <title>Ferramentas</title>
</svelte:head>

<div class="flex flex-wrap gap-10 md:max-w-332 md:mx-auto">
    <aside
        class="flex flex-col w-full h-fit shrink-0 gap-2 lg:w-90 md:gap-6 bg-accent p-2 md:p-6 lg:rounded-lg lg:sticky lg:top-20"
    >
        <h1 class="text-lg font-bold">Ferramentas</h1>
        <div class="flex gap-2">
            <InputGroup.Root class="h-10">
                <InputGroup.Input
                    bind:ref={search_input}
                    placeholder="Código, nome ou descrição..."
                    bind:value={search_query}
                    class=""
                />
                <InputGroup.Addon>
                    <SearchIcon />
                </InputGroup.Addon>
                <InputGroup.Addon align="inline-end">
                    <Button
                        variant="ghost"
                        class="cursor-pointer"
                        size="icon-sm"
                        onclick={() => {
                            search_query = "";
                            search_input?.focus();
                        }}
                    >
                        <XIcon />
                    </Button>
                </InputGroup.Addon>
            </InputGroup.Root>
            <Select.Root
                bind:value={sort_method}
                type="single"
                name="sort_method"
                onValueChange={() => {
                    page.url.searchParams.set("sort", sort_method);
                    goto(page.url, {
                        replaceState: true,
                        noScroll: true,
                        keepFocus: true,
                    });
                }}
            >
                <Select.Trigger class="cursor-pointer h-10!">
                    <SortIcon />
                </Select.Trigger>
                <Select.Content>
                    <Select.Group>
                        <Select.Label>Ordernar por:</Select.Label>
                        <Select.Item
                            value={SortFerramentas.COD_AZ}
                            class="cursor-pointer">Código (A-Z)</Select.Item
                        >
                        <Select.Item
                            value={SortFerramentas.COD_ZA}
                            class="cursor-pointer">Código (Z-A)</Select.Item
                        >
                        <Select.Item
                            value={SortFerramentas.DATA_ADD_NEW}
                            class="cursor-pointer"
                            >Data de cadastro (recente)</Select.Item
                        >
                        <Select.Item
                            value={SortFerramentas.DATA_ADD_OLD}
                            class="cursor-pointer"
                            >Data de cadastro (antigo)</Select.Item
                        >
                        <Select.Item
                            value={SortFerramentas.DATA_UPD_NEW}
                            class="cursor-pointer"
                            >Data de atualização (recente)</Select.Item
                        >
                        <Select.Item
                            value={SortFerramentas.DATA_UPD_OLD}
                            class="cursor-pointer"
                            >Data de atualização (antigo)</Select.Item
                        >
                    </Select.Group>
                </Select.Content>
            </Select.Root>
        </div>
        <div class="flex flex-col gap-1.5">
            <Label for="tipo_ferramenta" class="pl-1.5 text-foreground"
                >Tipos:</Label
            >
            <Select.Root
                bind:value={selected_tipos_ferramentas}
                type="multiple"
                name="tipo_ferramenta"
                disabled={tipos_ferramentas.length === 0}
                allowDeselect={true}
                onValueChange={() => {
                    page.url.searchParams.set(
                        "tipos",
                        selected_tipos_ferramentas.join(","),
                    );
                    goto(page.url, {
                        replaceState: true,
                        noScroll: true,
                        keepFocus: true,
                    });
                }}
            >
                <Select.Trigger
                    class="w-full field-sizing-fixed cursor-pointer h-10!"
                >
                    <span class="overflow-hidden text-ellipsis"
                        >{join_selected_tipos()}</span
                    >
                </Select.Trigger>
                <Select.Content class="max-g-[300px] w-full">
                    <Select.Group>
                        <Select.GroupHeading>
                            {#snippet child()}
                                <div
                                    class="flex justify-between px-1.5 items-center"
                                >
                                    <span class="text-xs text-muted-foreground"
                                        >Selecione um ou mais:</span
                                    >
                                    <Button
                                        variant="outline"
                                        class="cursor-pointer"
                                        size="xs"
                                        onclick={() =>
                                            (selected_tipos_ferramentas = [])}
                                    >
                                        <XIcon /> Limpar
                                    </Button>
                                </div>
                            {/snippet}
                        </Select.GroupHeading>
                        {#each tipos_ferramentas as tipo (tipo.id)}
                            <Select.Item
                                value={tipo.id}
                                label={tipo.nome}
                                class="cursor-pointer hover:bg-accent"
                                >{tipo.nome}</Select.Item
                            >
                        {/each}
                    </Select.Group>
                </Select.Content>
            </Select.Root>
        </div>
    </aside>

    <main class="flex-1">
        <WindowVirtualizer
            data={ferramentas_cache.items}
            getKey={(item, i) => `${item.cod_interno}${i}`}
            onscroll={calculate_load_bounds}
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
        </WindowVirtualizer>

        {#if is_loading}
            <InsumoCardSkeleton />
        {/if}
    </main>
</div>

<style>
    :global(body) {
        margin: 0;
        padding: 0;
        overflow-y: auto;
    }
</style>
