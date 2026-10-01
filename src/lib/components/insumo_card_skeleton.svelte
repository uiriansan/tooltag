<script lang="ts">
    import Skeleton from "$lib/components/ui/skeleton/skeleton.svelte";

    let { opacity }: { opacity: number } = $props();

    const normal_opacity = $derived.by(() => {
        if (opacity < 0) {
            return 0;
        }
        return opacity;
    });
</script>

<div
    role="status"
    class="flex w-full items-start gap-3 bg-transparent p-5 border border-transparent rounded-base flex-row"
    style={`opacity: ${normal_opacity / 100.0};`}
>
    <Skeleton
        class="flex items-center justify-center sm:w-96 aspect-square rounded-base w-16 md:w-30 shrink-0 overflow-hidden"
    />
    <div class="w-full">
        <Skeleton class="h-2.5 rounded-full w-48 mb-4" />
        <Skeleton class="h-2 rounded-full max-w-[480px] mb-2.5" />
        <Skeleton class="h-2 rounded-full mb-2.5 max-w-[500px]" />
        <Skeleton class="h-2 rounded-full max-w-[440px] mb-2.5" />
        <Skeleton class="h-2 rounded-full max-w-[460px] mb-2.5" />
        <Skeleton class="h-2 rounded-full max-w-[360px]" />
    </div>
    <span class="sr-only">Loading...</span>
</div>
