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
    import Plus from "@lucide/svelte/icons/plus";
    import Logout from "@lucide/svelte/icons/log-out";
    import * as DropdownMenu from "$lib/components/ui/dropdown-menu/";
    import * as Tooltip from "$lib/components/ui/tooltip";
    import MenuIcon from "@lucide/svelte/icons/menu";
    import XIcon from "@lucide/svelte/icons/x";

    let route = $derived<string | null>(page.route.id);

    const logout = () => {
        // TODO: ...
    };

    let { children } = $props();

    let menu_opened = $state(false);

    const toggle_menu = () => {
        menu_opened = !menu_opened;
    };
</script>

<svelte:head>
    <link rel="icon" href={favicon} />

    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
</svelte:head>

<nav class="sticky top-0 w-full h-19 z-50 lg:p-2 bg-background overflow-hidden">
    <div
        class="h-full md:max-w-332 md:mx-auto flex justify-between items-center bg-accent lg:rounded-lg px-3 lg:px-1"
    >
        <Button
            variant="outline"
            size="lg"
            class="self-center lg:hidden"
            onclick={toggle_menu}
        >
            {#if menu_opened}
                <XIcon />
            {:else}
                <MenuIcon />
            {/if}

            <span class="">Menu</span>
        </Button>
        <div class="hidden lg:flex gap-5">
            <a href="/">
                <img src={tooltag} alt="Tooltag logo" class="w-15" />
            </a>
            <ul class="flex items-center p-1 gap-10">
                <li class="p-0 m-0">
                    <a
                        class="text-muted-foreground"
                        class:text-foreground!={route === "/"}
                        class:font-bold={route === "/"}
                        href={route === "/"
                            ? "javascript:void(0)"
                            : `/?${page.url.searchParams.toString()}`}>Início</a
                    >
                </li>
                <li class="p-0 m-0">
                    <a
                        class="text-muted-foreground"
                        class:text-foreground!={route === "/ferramentas"}
                        class:font-bold={route === "/ferramentas"}
                        href={route === "/ferramentas"
                            ? "javascript:void(0)"
                            : `/ferramentas?${page.url.searchParams.toString()}`}
                        >Ferramentas</a
                    >
                </li>
                <li class="p-0 m-0">
                    <a
                        class="text-muted-foreground"
                        class:text-foreground!={route === "/insumos"}
                        class:font-bold={route === "/insumos"}
                        href={route === "/insumos"
                            ? "javascript:void(0)"
                            : `/insumos?${page.url.searchParams.toString()}`}
                        >Insumos</a
                    >
                </li>
                <li class="p-0 m-0">
                    <a
                        class="text-muted-foreground"
                        class:text-foreground!={route === "/ocorrencias"}
                        class:font-bold={route === "/ocorrencias"}
                        href={route === "/ocorrencias"
                            ? "javascript:void(0)"
                            : `/ocorrencias?${page.url.searchParams.toString()}`}
                        >Ocorrências</a
                    >
                </li>
                <li class="p-0 m-0">
                    <a
                        class="text-muted-foreground"
                        class:text-foreground!={route === "/gestao"}
                        class:font-bold={route === "/gestao"}
                        href={route === "/gestao"
                            ? "javascript:void(0)"
                            : `/gestao?${page.url.searchParams.toString()}`}
                        >Gestão</a
                    >
                </li>
            </ul>
        </div>
        <a href="/" class="lg:hidden">
            <img src={tooltag} alt="Tooltag logo" class="w-15" />
        </a>
        <div class="flex gap-2 items-center">
            <DropdownMenu.Root>
                <DropdownMenu.Trigger>
                    {#snippet child({ props }: any)}
                        <div class="">
                            <Button
                                {...props}
                                variant="ghost"
                                size="lg"
                                class="m-0 underline-offset-5 cursor-pointer text-md font-normal lg:flex hidden"
                            >
                                <Shield /> Willian <Chevron />
                            </Button>
                        </div>
                    {/snippet}
                </DropdownMenu.Trigger>
                <DropdownMenu.Content class="mt-2">
                    <DropdownMenu.Group>
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

            <Tooltip.Provider>
                <Tooltip.Root>
                    <Tooltip.Trigger>
                        {#snippet child({ props })}
                            <Button
                                {...props}
                                variant="ghost"
                                size="icon-lg"
                                class="cursor-pointer lg:flex hidden"
                            >
                                <Search />
                            </Button>
                        {/snippet}
                    </Tooltip.Trigger>
                    <Tooltip.Content>
                        <p>Buscar</p>
                    </Tooltip.Content>
                </Tooltip.Root>
            </Tooltip.Provider>

            <Tooltip.Provider>
                <Tooltip.Root>
                    <Tooltip.Trigger>
                        {#snippet child({ props })}
                            <Button
                                {...props}
                                variant="ghost"
                                size="icon-lg"
                                class="cursor-pointer lg:flex hidden"
                            >
                                <Scan />
                            </Button>
                        {/snippet}
                    </Tooltip.Trigger>
                    <Tooltip.Content>
                        <p>Ler QrCode</p>
                    </Tooltip.Content>
                </Tooltip.Root>
            </Tooltip.Provider>

            <Tooltip.Provider disabled={route === "/ocorrencias/criar"}>
                <Tooltip.Root>
                    <Tooltip.Trigger>
                        {#snippet child({ props })}
                            <Button
                                {...props}
                                variant={route === "/ocorrencias/criar"
                                    ? "ghost"
                                    : "default"}
                                size="lg"
                                class={`cursor-pointer text-white mr-2 ${route === "/ocorrencias/criar" ? "hover:bg-transparent! text-muted-foreground! cursor-not-allowed!" : ""}`}
                                href={route === "/ocorrencias/criar"
                                    ? "javascript:void(0)"
                                    : "/ocorrencias/criar"}
                            >
                                <Plus />
                                <span class="hidden md:block">Criar</span>
                            </Button>
                        {/snippet}
                    </Tooltip.Trigger>
                    <Tooltip.Content>
                        <p>Criar ocorrencia</p>
                    </Tooltip.Content>
                </Tooltip.Root>
            </Tooltip.Provider>
        </div>
    </div>
</nav>
<div
    class="h-screen w-full bg-accent px-3 overflow-hidden"
    class:hidden={!menu_opened}
>
    MENU
</div>

<div class="px-0 lg:px-2">
    {@render children()}
</div>
