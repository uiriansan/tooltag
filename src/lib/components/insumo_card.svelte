<script lang="ts">
    import type { ClassValue } from "svelte/elements";

    interface Props {
        foto: string;
        nome: string;
        cod: string;
        obs: string | null;
        ferramenta?: boolean;
        class?: ClassValue;
    }

    let {
        foto,
        nome,
        cod,
        obs,
        ferramenta,
        class: className = "",
    }: Props = $props();
</script>

<a
    href={ferramenta ? `ferramentas/${cod}` : `insumos/${cod}`}
    class={`flex w-full items-start gap-3 bg-transparent p-5 transition-colors duration-200 hover:bg-neutral-primary-medium border border-transparent hover:border-brand rounded-base shadow-xs flex-row ${className}`}
>
    <div
        class="aspect-square rounded-base w-16 md:w-30 shrink-0 overflow-hidden bg-brand-softer"
    >
        <img
            src={foto}
            alt=""
            class="rounded-base object-cover h-full w-full"
        />
    </div>
    <div class="flex flex-col justify-between md:px-4 leading-normal">
        <div class="flex gap-2 items-center">
            <h6 class="text-blue-400 text-xs">
                {cod}
            </h6>
            <span
                class="text-xs bg-blue-300 border-blue-600 text-blue-600 p-1 px-2 rounded-full"
                class:bg-green-300={ferramenta}
                class:border-green-600={ferramenta}
                class:text-green-600={ferramenta}
            >
                {#if ferramenta}
                    Ferramenta
                {:else}
                    Insumo
                {/if}
            </span>
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
</a>
