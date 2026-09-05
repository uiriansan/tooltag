<script lang="ts">
    import type { Snippet } from "svelte";

    let { list, filters }: { list: Snippet; filters: Snippet } = $props();
</script>

<div class="flex flex-wrap gap-10 md:max-w-332 md:mx-auto">
    <aside
        class="sticky z-40 top-19 flex flex-col w-full h-fit shrink-0 gap-2 lg:w-90 md:gap-6 bg-accent p-2 md:p-6 lg:rounded-lg lg:sticky lg:top-20"
    >
        {@render filters()}
    </aside>

    <main class="flex-1">
        {@render list()}
    </main>
</div>

<style>
    :global(body) {
        margin: 0;
        padding: 0;
        overflow-y: auto;
    }
</style>
