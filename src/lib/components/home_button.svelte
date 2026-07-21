<script lang="ts">
    import { type Component } from "svelte";

    interface Props {
        text: string;
        Icon: any;
        url: string;
    }
    let { text = "", Icon, url = "#" }: Props = $props();
</script>

<a
    href={url}
    class="bg-brand w-full aspect-square md:w-50 p-6 rounded-base shadow-xs hover:bg-brand-strong transition-colors duration-200 flex flex-col justify-center items-center flex-1 gap-5"
>
    {#if Icon}
        <Icon class="w-10 h-10 text-fg-brand-subtle" />
    {/if}

    <h5
        class="mb-3 line-clamp-2 font-semibold tracking-tight text-heading text-center"
    >
        {text}
    </h5>
</a>
