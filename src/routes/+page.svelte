<script lang="ts">
    import logo_tooltag from "$lib/assets/tooltag.png";
    import logo_medal from "$lib/assets/medal.svg";
    import Button from "$lib/components/button.svelte";
    import HomeButton from "$lib/components/home_button.svelte";

    import BoxSearch from "~icons/fluent/box-search-16-filled";
    import ClipboardEdit from "~icons/fluent/clipboard-edit-20-filled";
    import ClipboardSearch from "~icons/fluent/clipboard-search-24-filled";
    import QrScan from "~icons/fluent/scan-qr-code-24-filled";
    import Dashboard from "~icons/fluent/layout-infographic-20-filled";
    import { goto } from "$app/navigation";
</script>

<main class="min-h-screen flex flex-col p-6 justify-center items-center">
    <div class="home-icons flex justify-center gap-5">
        <img src={logo_tooltag} alt="Logo tooltag" width="100px" />
        <img src={logo_medal} alt="Logo Medal" width="70px" />
    </div>

    <div class="grid grid-cols-2 gap-2 mt-10 justify-stretch items-stretch">
        <HomeButton text="Insumos" Icon={BoxSearch} url="insumos" />
        <HomeButton text="Ler QrCode" Icon={QrScan} url="scan" />
        <HomeButton
            text="Ocorrências"
            Icon={ClipboardSearch}
            url="ocorrencias"
        />
        <HomeButton
            text="Criar ocorrência"
            Icon={ClipboardEdit}
            url="ocorrencias/criar"
        />
    </div>

    <Button
        text="Gestão"
        Icon={Dashboard}
        class="w-30 mt-10 bg-neutral-secondary-medium text-body box-border border border-default-medium hover:bg-neutral-tertiary-medium hover:text-heading focus:ring-4 focus:ring-neutral-tertiary shadow-xs"
        on_click={() => goto("/dashboard")}
    />
</main>
