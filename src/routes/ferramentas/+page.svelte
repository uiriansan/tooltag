<script lang="ts">
    import InsumoCard from "$lib/components/insumo_card.svelte";
    import { WindowVirtualizer } from "virtua/svelte";
    import { onMount, untrack } from "svelte";
    import { page } from "$app/state";
    import { SortFerramentas } from "$lib/types";
    import InsumoCardSkeleton from "$lib/components/insumo_card_skeleton.svelte";
    import * as InputGroup from "$lib/components/ui/input-group";
    import SearchIcon from "@lucide/svelte/icons/search";
    import XIcon from "@lucide/svelte/icons/x";
    import SortIcon from "@lucide/svelte/icons/list-sort-ascending";
    import * as Select from "$lib/components/ui/select";
    import type { PageProps, Snapshot } from "./$types";
    import Button from "$lib/components/ui/button/button.svelte";
    import Label from "$lib/components/ui/label/label.svelte";
    import { goto } from "$app/navigation";
    import ListPage from "$lib/components/list_page.svelte";
    import Switch from "$lib/components/ui/switch/switch.svelte";
    import { ferramentas_cache } from "./cache.svelte";
    import { compare_arrays_equals } from "$lib/utils";

    let { data }: PageProps = $props();

    const PAGE_LIMIT = 50;
    const SEARCH_DEBOUNCE_MS = 400;

    let search_query = $state<string>(page.url.searchParams.get("q") ?? "");
    let sort_method = $state(
        page.url.searchParams.get("sort") ?? SortFerramentas.COD_AZ,
    );
    let selected_tipos_ferramentas = $state<string[]>(
        (page.url.searchParams.get("tipos") ?? "")
            .split(",")
            .filter((id) => id.length > 0)
            .map((id) => id.trim()),
    );
    let selected_tipos_ferramentas_at_open: string[] = [];

    let is_loading_more = $state(false);
    let request_id = 0;
    let req_abort_controller: AbortController | null = null;

    let restored_scroll = $state<number | null>(null);
    let clicked_item_index = $state<number | null>(null);
    let search_input = $state<HTMLInputElement | null>(null);
    let ready = false;

    let tipos_ferramentas = $derived([
        { id: 0, nome: "Geral" },
        ...data.tipos_ferramentas,
    ]);

    const selected_tipos_label = $derived.by(() => {
        if (
            selected_tipos_ferramentas.length === 0 ||
            selected_tipos_ferramentas.length === tipos_ferramentas.length
        ) {
            return "Todos os tipos";
        }
        return tipos_ferramentas
            .filter((t) => selected_tipos_ferramentas.includes(String(t.id)))
            .map((t) => t.nome)
            .join(", ");
    });
    const selected_maquinas_label = $derived.by(() => {
        return "Todas as máquinas";
    });

    let status_obsoleto = $state<boolean>(
        Boolean(page.url.searchParams.get("obsoleto")),
    );
    let status_incompleto = $state<boolean>(
        Boolean(page.url.searchParams.get("incompleto")),
    );
    let enable_status_filters = $derived.by<boolean>(() => {
        const url_val = page.url.searchParams.get("status");

        if (url_val && url_val === "1") {
            return true;
        }
        return false;
    });

    let versoes_group = $derived.by<boolean>(() => {
        let url_val = page.url.searchParams.get("versoes_group");

        if (url_val === null) return true;

        let group = url_val !== "1" ? false : true;

        return group;
    });

    const sync_url_params = () => {
        const params = new URLSearchParams(page.url.searchParams);

        if (search_query.trim()) {
            params.set("q", search_query.trim());
        } else {
            params.delete("q");
        }

        params.set("sort", sort_method);

        if (selected_tipos_ferramentas.length > 0) {
            params.set("tipos", selected_tipos_ferramentas.join(","));
        } else {
            params.delete("tipos");
        }

        if (status_obsoleto) {
            params.set("obsoleto", "1");
        } else {
            params.delete("obsoleto");
        }

        if (status_incompleto) {
            params.set("incompleto", "1");
        } else {
            params.delete("incompleto");
        }

        if (enable_status_filters) {
            params.set("status", "1");
        } else {
            params.set("status", "0");
        }

        if (versoes_group) {
            params.set("versoes_group", "1");
        } else {
            params.set("versoes_group", "0");
        }

        goto(`?${params.toString()}`, {
            replaceState: true,
            noScroll: true,
            keepFocus: true,
        });
    };

    const apply_filters = () => {
        req_abort_controller?.abort();
        req_abort_controller = null;

        is_loading_more = false;

        ferramentas_cache.offset = 0;
        ferramentas_cache.has_more = true;
        ferramentas_cache.items = [];

        sync_url_params();
        load_more();
    };

    $effect(() => {
        // Debounce busca por texto
        search_query;

        if (!ready) return;

        const timer = setTimeout(apply_filters, SEARCH_DEBOUNCE_MS);
        return () => clearTimeout(timer);
    });

    $effect(() => {
        sort_method;
        enable_status_filters;
        status_obsoleto;
        status_incompleto;
        versoes_group;

        if (!ready) return;

        // `untrack` impede que variáveis utilizadas dentro de `apply_filters`,
        // `sync_url_params` e `load_more` se torne um dependência nos `$effect`s
        // abaixo, resultando em um call loop de `sync_url_params`.
        untrack(() => apply_filters());
    });

    onMount(async () => {
        if (!ferramentas_cache.items || ferramentas_cache.items.length === 0)
            await load_more();

        ready = true;
    });

    const load_more = async () => {
        if (is_loading_more || !ferramentas_cache.has_more) return;

        is_loading_more = true;
        const this_request = ++request_id;

        const controller = new AbortController();
        req_abort_controller = controller;

        try {
            const params = new URLSearchParams({
                offset: String(ferramentas_cache.offset),
                limit: String(PAGE_LIMIT),
            });

            if (search_query.trim()) params.set("q", search_query.trim());

            params.set("sort", sort_method);
            params.set("status", `${Number(enable_status_filters)}`);
            params.set("obsoleto", `${Number(status_obsoleto)}`);
            params.set("incompleto", `${Number(status_incompleto)}`);
            params.set("versoes_group", `${Number(versoes_group)}`);

            if (selected_tipos_ferramentas.length > 0)
                params.set("tipos", selected_tipos_ferramentas.join(","));

            const res = await fetch(`/api/ferramentas/?${params.toString()}`, {
                signal: controller.signal,
            });
            const json = await res.json();

            // Impede que os itens de requisições sobreescritas (quando um nova requisição é
            // feita antes que a anterior seja completada) sejam adicionados à lista:
            if (this_request !== request_id) return;

            if (json.items.length === 0) {
                ferramentas_cache.has_more = false;
            } else {
                ferramentas_cache.items = [
                    ...ferramentas_cache.items,
                    ...json.items,
                ];
                ferramentas_cache.offset += json.items.length;
            }
        } catch (err) {
            if (err instanceof DOMException && err.name === "AbortError")
                return;

            console.error(`Erro ao carregar ferramentas: ${err}`);
        } finally {
            if (this_request === request_id) {
                is_loading_more = false;

                if (req_abort_controller === controller) {
                    req_abort_controller = null;
                }
            }
        }
    };

    const calculate_load_bounds = async () => {
        if (restored_scroll !== null) return;

        // Requisitar mais dados apenas se o final da lista estiver perto do viewport:
        const vp_size = window.innerHeight;
        const scroll_offset = window.scrollY;
        const scroll_size = document.documentElement.scrollHeight;
        const load_threshold = 300; // quantos `px` de distância do final da lista

        if (scroll_offset + vp_size < scroll_size - load_threshold) return;

        await load_more();
    };

    export const snapshot: Snapshot = {
        capture: () => ({
            scroll: window.scrollY,
            item_index: clicked_item_index,
        }),
        restore: (value) => {
            restored_scroll = value?.scroll;
            clicked_item_index = value?.item_index;
        },
    };

    $effect(() => {
        if (restored_scroll === null) return;

        // FIXME: !
        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                window.scrollTo(0, restored_scroll!);
                restored_scroll = null;
            });
        });
    });
</script>

<svelte:head>
    <title>Ferramentas</title>
</svelte:head>

<svelte:window
    onmousedown={() => {
        if (clicked_item_index !== null) clicked_item_index = null;
    }}
/>

<ListPage>
    {#snippet list()}
        <WindowVirtualizer
            data={ferramentas_cache.items}
            getKey={(item, i) => `${item.cod_interno}${i}`}
            onscroll={calculate_load_bounds}
        >
            {#snippet children(ferramenta, index)}
                <InsumoCard
                    cod={ferramenta.cod_interno}
                    nome={ferramenta.nome}
                    foto={ferramenta.foto_path}
                    obs={ferramenta.observacoes}
                    ferramenta={true}
                    class={`${clicked_item_index !== null && clicked_item_index === index ? "border-2! border-primary-foreground! bg-accent! rounded-md" : "rounded-md"}`}
                    on_click={() => {
                        clicked_item_index = index;
                    }}
                />
            {/snippet}
        </WindowVirtualizer>

        {#if is_loading_more}
            <InsumoCardSkeleton />
        {/if}
    {/snippet}

    {#snippet filters()}
        <h1 class="text-lg font-bold">Ferramentas</h1>
        <div class="flex gap-2">
            <InputGroup.Root class="h-10">
                <InputGroup.Input
                    bind:ref={search_input}
                    placeholder="Código, nome ou observacões..."
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
            <Label for="tipo_ferramenta" class="pl-1.5 text-foreground text-md"
                >Tipos:</Label
            >
            <Select.Root
                bind:value={selected_tipos_ferramentas}
                type="multiple"
                name="tipo_ferramenta"
                disabled={tipos_ferramentas.length === 0}
                allowDeselect={true}
                onOpenChange={(opened) => {
                    if (opened) {
                        selected_tipos_ferramentas_at_open =
                            selected_tipos_ferramentas;
                    } else {
                        if (
                            !compare_arrays_equals(
                                selected_tipos_ferramentas_at_open,
                                selected_tipos_ferramentas,
                            )
                        ) {
                            apply_filters();
                        }
                        selected_tipos_ferramentas_at_open = [];
                    }
                }}
            >
                <Select.Trigger
                    class="w-full field-sizing-fixed cursor-pointer h-10!"
                >
                    <span class="overflow-hidden text-ellipsis"
                        >{selected_tipos_label}</span
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
                                value={String(tipo.id)}
                                label={tipo.nome}
                                class="cursor-pointer hover:bg-accent"
                                >{tipo.nome}</Select.Item
                            >
                        {/each}
                    </Select.Group>
                </Select.Content>
            </Select.Root>
        </div>
        <div class="flex flex-col gap-1.5">
            <Label for="tipo_ferramenta" class="pl-1.5 text-foreground text-md"
                >Máquinas:</Label
            >
            <Select.Root
                bind:value={selected_tipos_ferramentas}
                type="multiple"
                name="tipo_ferramenta"
                disabled={tipos_ferramentas.length === 0}
                allowDeselect={true}
                onOpenChange={(opened) => {
                    if (opened) {
                        selected_tipos_ferramentas_at_open =
                            selected_tipos_ferramentas;
                    } else {
                        if (
                            !compare_arrays_equals(
                                selected_tipos_ferramentas_at_open,
                                selected_tipos_ferramentas,
                            )
                        ) {
                            apply_filters();
                        }
                        selected_tipos_ferramentas_at_open = [];
                    }
                }}
            >
                <Select.Trigger
                    class="w-full field-sizing-fixed cursor-pointer h-10!"
                >
                    <span class="overflow-hidden text-ellipsis"
                        >{selected_maquinas_label}</span
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
                                        >Selecione uma ou mais:</span
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
                                value={String(tipo.id)}
                                label={tipo.nome}
                                class="cursor-pointer hover:bg-accent"
                                >{tipo.nome}</Select.Item
                            >
                        {/each}
                    </Select.Group>
                </Select.Content>
            </Select.Root>
        </div>
        <div class="flex flex-col gap-3">
            <div class="flex justify-between items-center">
                <label
                    for="status_switch"
                    class="flex-1 pl-1.5 text-foreground font-medium text-md"
                >
                    Status:
                </label>
                <Switch
                    id="status_switch"
                    class="cursor-pointer"
                    bind:checked={enable_status_filters}
                />
            </div>
            <div class="pl-3 flex justify-between gap-2">
                <input
                    type="checkbox"
                    id="status_obsoleto_switch"
                    class="cursor-pointer w-4"
                    bind:checked={status_obsoleto}
                    disabled={!enable_status_filters}
                />
                <Label
                    for="status_obsoleto_switch"
                    class={`text-muted-foreground text-sm flex-1 ${enable_status_filters ? "cursor-pointer" : "text-muted-foreground/50"}`}
                    >Obsoleto</Label
                >
            </div>
            <div class="pl-3 flex justify-between gap-2">
                <input
                    type="checkbox"
                    id="status_incompleto_switch"
                    class="cursor-pointer w-4"
                    bind:checked={status_incompleto}
                    disabled={!enable_status_filters}
                />
                <Label
                    for="status_incompleto_switch"
                    class={`text-muted-foreground text-sm flex-1 ${enable_status_filters ? "cursor-pointer" : "text-muted-foreground/50"}`}
                    >Cadastro incompleto</Label
                >
            </div>
        </div>
        <div class="flex justify-between">
            <Label
                for="versoes_group_switch"
                class="pl-1.5 text-muted-foreground text-sm flex-1 cursor-pointer"
                >Agrupar versões de um mesmo item</Label
            >
            <Switch
                id="versoes_group_switch"
                class="cursor-pointer"
                bind:checked={versoes_group}
            />
        </div>
    {/snippet}
</ListPage>
