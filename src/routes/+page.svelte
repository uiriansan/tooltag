<script lang="ts">
    import logo_tooltag from "$lib/assets/tooltag.png";
    import MedalLogo from "$lib/components/medal_logo.svelte";
    import Button from "$lib/components/button.svelte";
    import HomeButton from "$lib/components/home_button.svelte";

    import BoxSearch from "@lucide/svelte/icons/search";
    import ClipboardEdit from "@lucide/svelte/icons/clipboard-plus";
    import ClipboardSearch from "@lucide/svelte/icons/clipboard";
    import QrScan from "@lucide/svelte/icons/scan-qr-code";
    import Dashboard from "@lucide/svelte/icons/gauge";
    import { goto } from "$app/navigation";
</script>

<main class="min-h-screen flex flex-col p-6 justify-center items-center">
    <div class="home-icons flex justify-center gap-5">
        <img src={logo_tooltag} alt="Logo tooltag" width="100px" />
        <MedalLogo width="70px" />
    </div>

    <div class="grid grid-cols-2 gap-2 mt-10 justify-stretch items-stretch">
        <HomeButton text="Buscar" Icon={BoxSearch} url="insumos" />
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
        class="w-30 mt-10 rounded-md cursor-pointer bg-secondary text-body box-border border hover:bg-secondary/80 hover:text-heading focus:ring-4 focus:ring-neutral-tertiary shadow-xs"
        on_click={() => goto("/dashboard")}
    />
</main>
