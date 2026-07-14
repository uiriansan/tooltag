<script lang="ts">
    import * as Icon from "flowbite-svelte-icons";
    import { type Component } from "svelte";

    interface Props {
        text: string;
        icon: string;
        solid?: boolean;
        class?: string;
        on_click?: () => void;
    }
    let {
        text = "",
        icon = "",
        solid = false,
        class: className,
        on_click,
    }: Props = $props();

    let icon_suffix = $derived(solid ? "Solid" : "Outline");
    let icon_name = $derived(
        `${icon
            .toLowerCase()
            .split("-")
            .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
            .join("")}${icon_suffix}`,
    );
    let IconComponent = $derived(Icon[icon_name as keyof typeof Icon]);
</script>

<button
    type="button"
    class={`inline-flex items-center text-white bg-brand hover:bg-brand-strong box-border border border-transparent focus:ring-4 focus:ring-brand-medium shadow-xs font-medium leading-5 rounded-base text-sm px-4 py-2.5 focus:outline-none ${className}`}
    onclick={on_click}
>
    {#if IconComponent}
        {/* @ts-ignore */ null}
        <IconComponent />
    {/if}
    <div class="flex-1">
        {text}
    </div>
</button>
