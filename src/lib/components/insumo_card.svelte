<script lang="ts">
    import type { ClassValue } from "svelte/elements";

    interface Props {
        foto: string;
        nome: string;
        cod: string;
        obs: string | null;
        class?: ClassValue;
    }

    let { foto, nome, cod, obs, class: className = "" }: Props = $props();
</script>

<a
    href={`insumos/${cod}`}
    class={`flex w-full items-start gap-3 bg-neutral-primary-soft p-6 border border-neutral-primary-medium transition-colors duration-200 hover:bg-neutral-primary-medium hover:border-neutral-primary-strong rounded-base shadow-xs flex-row max-w-xl ${className}`}
>
    <div
        class="aspect-square rounded-base w-16 md:w-48 shrink-0 overflow-hidden bg-brand-softer"
    >
        <img
            src={foto}
            alt=""
            class="rounded-base object-cover h-full w-full"
        />
    </div>
    <div class="flex flex-col justify-between md:px-4 leading-normal">
        <div>
            <h6 class="text-blue-400 text-xs line-clamp-1 overflow-hidden">
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
</a>
