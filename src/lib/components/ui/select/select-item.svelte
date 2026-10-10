<script lang="ts">
    import { Select as SelectPrimitive } from "bits-ui";
    import CheckIcon from "@lucide/svelte/icons/check";
    import { cn, type WithoutChild } from "$lib/utils.js";

    type ItemProps = SelectPrimitive.ItemProps & {
        show_indicator?: boolean;
    };

    let {
        ref = $bindable(null),
        class: className,
        value,
        label,
        show_indicator = true,
        children: childrenProp,
        ...restProps
    }: WithoutChild<ItemProps> = $props();
</script>

<SelectPrimitive.Item
    bind:ref
    {value}
    data-slot="select-item"
    class={cn(
        "gap-1.5 rounded-md py-1 pl-1.5 text-sm focus:bg-accent focus:text-accent-foreground not-data-[variant=destructive]:focus:**:text-accent-foreground [&_svg:not([class*='size-'])]:size-4 *:[span]:last:flex *:[span]:last:items-center *:[span]:last:gap-2 relative flex w-full cursor-default items-center outline-hidden select-none focus:bg-accent focus:text-accent-foreground data-highlighted:bg-accent data-highlighted:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0",
        show_indicator ? "pr-8" : "pr-1.5",
        className,
    )}
    {...restProps}
>
    {#snippet children({ selected, highlighted })}
        {#if show_indicator}
            <span
                class="absolute end-2 flex size-3.5 items-center justify-center"
            >
                {#if selected}
                    <CheckIcon
                        class="cn-select-item-indicator-icon text-primary"
                    />
                {/if}
            </span>
        {/if}
        <span class="flex flex-1 gap-2 shrink-0 whitespace-nowrap">
            {#if childrenProp}
                {@render childrenProp({ selected, highlighted })}
            {:else}
                {label || value}
            {/if}
        </span>
    {/snippet}
</SelectPrimitive.Item>
