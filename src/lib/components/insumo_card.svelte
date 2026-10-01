<script lang="ts">
    import type { ClassValue } from "svelte/elements";
    import ferramenta_foto from "$lib/assets/ferramenta.png";
    import insumo_foto from "$lib/assets/insumo.png";
    import { fly } from "svelte/transition";
    import type { Snippet } from "svelte";

    interface Props {
        foto: string | null;
        nome: string;
        cod: string;
        obs: string | null;
        ferramenta?: boolean;
        class?: ClassValue;
        on_click?: () => void;
        children?: Snippet;
    }

    let {
        foto,
        nome,
        cod,
        obs,
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
    class={`flex w-full justify-between gap-3 bg-transparent transition-colors duration-200 hover:bg-secondary rounded-md ${className}`}
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
        <div class="flex flex-col justify-between md:px-4 leading-normal">
            <div class="flex gap-2 items-center">
                <h6 class="text-blue-400 text-xs">
                    {cod}
                </h6>
            </div>
            <h5
                class="mb-2 mt-2 text-md font-bold tracking-tight text-heading line-clamp-2 overflow-hidden md:line-clamp-3"
            >
                {nome}
            </h5>
            <p class="mb-6 text-body text-sm">
                {obs}
            </p>
        </div>
    </div>
    {#if children}
        <div class="w-30">
            {@render children()}
        </div>
    {/if}
</a>
