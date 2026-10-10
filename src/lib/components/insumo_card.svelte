<script lang="ts">
    import type { ClassValue } from "svelte/elements";
    import ferramenta_foto from "$lib/assets/ferramenta.png";
    import insumo_foto from "$lib/assets/insumo.png";
    import { fly } from "svelte/transition";
    import type { Snippet } from "svelte";
    import type { Maquina } from "$lib/types";

    type Props = {
        foto?: string | null;
        nome: string;
        cod: string;
        obs: string | null;
        categoria: string | null;
        maquinas: Maquina[];
        versao: number;
        ferramenta?: boolean;
        class?: ClassValue;
        on_click?: () => void;
        focus?: boolean;
        children?: Snippet;
    };

    let {
        foto,
        nome,
        cod,
        obs,
        categoria,
        maquinas,
        versao,
        ferramenta,
        class: className = "",
        on_click,
        children,
    }: Props = $props();

    let foto_src = $derived.by(() => {
        if (foto === null) {
            if (ferramenta) {
                return ferramenta_foto;
            } else {
                return insumo_foto;
            }
        }
        return foto;
    });
</script>

<a
    href={ferramenta ? `ferramentas/${cod}` : `insumos/${cod}`}
    class={`flex w-full justify-between gap-3 transition-colors duration-200 hover:bg-secondary rounded-md border border-accent ${className}`}
    onclick={on_click}
    in:fly={{ y: 50, duration: 250 }}
>
    <div class="flex flex-1 items-start gap-3 p-5">
        <div
            class="aspect-square rounded-md w-16 md:w-30 shrink-0 overflow-hidden bg-brand-softer"
        >
            <img
                src={foto_src}
                alt=""
                class="rounded-base object-cover h-full w-full"
            />
        </div>
        <div class="flex flex-col justify-center md:px-4 leading-normal">
            <div class="flex gap-2 items-center">
                <h6 class="text-primary dark:text-blue-400 text-xs">
                    {cod}
                </h6>
                <h6 class="text-foreground text-xs">
                    v{versao}
                </h6>
                <h6 class="text-muted-foreground text-xs">
                    {categoria ?? "Não especificado"}
                </h6>
                {#each maquinas as maquina}
                    <span class="text-muted-foreground/50 text-xs"
                        >{maquina.nome}</span
                    >
                {/each}
            </div>
            <h5
                class="mb-2 mt-2 text-md font-bold tracking-tight text-heading line-clamp-2 overflow-hidden md:line-clamp-3"
            >
                {nome}
            </h5>
            <p class="text-foreground text-sm line-clamp-2 overflow-hidden">
                {obs}
            </p>
        </div>
    </div>
    {#if children}
        <div class="w-30 flex flex-col">
            {@render children()}
        </div>
    {/if}
</a>
