<script lang="ts">
    import { page } from "$app/state";
    import Button from "$lib/components/button.svelte";
</script>

<div
    class="container mx-auto text-center h-screen flex flex-col justify-center items-center"
>
    <h1 class="font-extrabold text-6xl">{page.status}</h1>
    <p class="mt-2">{page.error?.message}</p>
    <!-- <Button -->
    <!--     text="Voltar" -->
    <!--     icon="arrow-left" -->
    <!--     class="mt-5 w-30" -->
    <!--     on_click={() => history.back()} -->
    <!-- /> -->
</div>
