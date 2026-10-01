<script lang="ts">
    import type { FerramentaCardData } from "$lib/types";
    import type { PageProps, Snapshot } from "./$types";

    let ferramenta = $state<FerramentaCardData | null>(null);

    export const snapshot: Snapshot = {
        capture: () => ({}),
        restore: (value) => {},
    };
</script>

<svelte:head>
    <title>...</title>
</svelte:head>
