<script lang="ts">
    import "./global.css";
    import favicon from "$lib/assets/favicon.svg";

    import Navbar from "$lib/components/navbar.svelte";

    let { children } = $props();
</script>

<svelte:head><link rel="icon" href={favicon} /></svelte:head>

<div class="container mx-auto px-50">
    <Navbar />
</div>

{@render children()}
