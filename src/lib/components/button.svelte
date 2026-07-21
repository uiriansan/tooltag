<script lang="ts">
    import { type Component } from "svelte";

    interface Props {
        text: string;
        Icon: any;
        solid?: boolean;
        class?: string;
        on_click?: () => void;
    }
    let {
        text = "",
        Icon,
        solid = false,
        class: className,
        on_click,
    }: Props = $props();
</script>

<button
    type="button"
    class={`inline-flex items-center text-white bg-brand hover:bg-brand-strong box-border border border-transparent focus:ring-4 focus:ring-brand-medium shadow-xs font-medium leading-5 rounded-base text-sm px-4 py-2.5 focus:outline-none ${className}`}
    onclick={on_click}
>
    {#if Icon}
        <Icon />
    {/if}
    <div class="flex-1">
        {text}
    </div>
</button>
