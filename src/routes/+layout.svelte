<script lang="ts">
    import "./global.css";
    import favicon from "$lib/assets/favicon.svg";
    import tooltag from "$lib/assets/tooltag.png";
    import { page } from "$app/state";
    import Button from "$lib/components/ui/button/button.svelte";
    import Drill from "@lucide/svelte/icons/drill";
    import Search from "@lucide/svelte/icons/search";
    import Scan from "@lucide/svelte/icons/scan-qr-code";
    import Shield from "@lucide/svelte/icons/shield-user";
    import Chevron from "@lucide/svelte/icons/chevron-down";
    import Gauge from "@lucide/svelte/icons/gauge";
    import Logout from "@lucide/svelte/icons/log-out";
    import * as DropdownMenu from "$lib/components/ui/dropdown-menu/";

    let route = $derived<string | null>(page.route.id);

    let ferramentas_button = $state<HTMLButtonElement | null>(null);
    let insumos_button = $state<HTMLButtonElement | null>(null);
    let ocorrencias_button = $state<HTMLButtonElement | null>(null);
    let scan_button = $state<HTMLButtonElement | null>(null);
    let gestao_button = $state<HTMLButtonElement | null>(null);

    $effect(() => {
        ferramentas_button?.classList.remove("underline");
        insumos_button?.classList.remove("underline");
        ocorrencias_button?.classList.remove("underline");
        scan_button?.classList.remove("underline");
        gestao_button?.classList.remove("underline");

        if (route === "/gestao" && gestao_button) {
            gestao_button.classList.add("underline");
        } else {
            let btn: HTMLButtonElement | null;

            if (route === "/ferramentas") {
                btn = ferramentas_button;
            } else if (route === "/insumos") {
                btn = insumos_button;
            } else if (route === "/ocorrencias") {
                btn = ocorrencias_button;
            } else if (route === "/scan") {
                btn = scan_button;
            }

            // @ts-ignore
            if (btn) {
                btn.disabled = true;
                btn.classList.add("underline");
            }
        }
    });

    const logout = () => {
        // TODO: ...
    };

    let { children } = $props();
</script>

<svelte:head><link rel="icon" href={favicon} /></svelte:head>

<nav class="sticky top-0 w-full h-19 z-50 p-2 bg-background">
    <div
        class="h-full md:max-w-332 md:mx-auto flex justify-between bg-accent rounded-lg px-1"
    >
        <div class="flex gap-5">
            <a href="/">
                <img src={tooltag} alt="Tooltag logo" class="w-15" />
            </a>
            <ul class="h-full flex items-center p-1 gap-10">
                <li class="p-0 m-0">
                    <a href="/ferramentas">Ferramentas</a>
                </li>
                <li class="p-0 m-0">
                    <a href="/insumos">Insumos</a>
                </li>
                <li class="p-0 m-0">
                    <a href="/ocorrencias">Ocorrências</a>
                </li>
            </ul>
        </div>
        <div class="flex gap-2 items-center">
            <Button
                variant="ghost"
                size="icon-lg"
                class="hover:bg-white/10! cursor-pointer"
            >
                <Search />
            </Button>

            <Button
                variant="ghost"
                size="icon-lg"
                class="hover:bg-white/10! cursor-pointer"
            >
                <Scan />
            </Button>

            <DropdownMenu.Root>
                <DropdownMenu.Trigger>
                    {#snippet child({ props }: any)}
                        <div class="">
                            <Button
                                {...props}
                                bind:ref={gestao_button}
                                variant="ghost"
                                class="m-0 p-6 underline-offset-5 cursor-pointer text-md text-foreground font-normal hover:bg-white/10!"
                            >
                                <Shield /> Willian <Chevron />
                            </Button>
                        </div>
                    {/snippet}
                </DropdownMenu.Trigger>
                <DropdownMenu.Content class="mt-2">
                    <DropdownMenu.Group>
                        <DropdownMenu.Item class="h-10! p-0">
                            <a
                                href="/gestao"
                                class="px-2 flex gap-2 items-center w-full text-foreground cursor-pointer text-md"
                                ><Gauge /> Gestão</a
                            >
                        </DropdownMenu.Item>
                        <DropdownMenu.Item class="h-10! p-0">
                            <button
                                type="button"
                                class="icon-wrapper px-2 h-full flex gap-2 items-center w-full rounded-sm text-red-500! cursor-pointer text-md"
                                onclick={logout}
                                ><Logout color="#fb2c36" /> Sair</button
                            >
                        </DropdownMenu.Item>
                    </DropdownMenu.Group>
                </DropdownMenu.Content>
            </DropdownMenu.Root>
        </div>
    </div>
</nav>

{@render children()}
