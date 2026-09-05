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

    let route = $derived<string | null>(page.route.id);

    const logout = () => {
        // TODO: ...
    };

    let { children } = $props();
</script>

<svelte:head><link rel="icon" href={favicon} /></svelte:head>

<nav class="sticky top-0 w-full h-19 z-50 lg:p-2 bg-background">
    <div
        class="h-full md:max-w-332 md:mx-auto flex justify-between bg-accent lg:border lg:rounded-lg px-1"
    >
        <div class="flex gap-5">
            <a href="/">
                <img src={tooltag} alt="Tooltag logo" class="w-15" />
            </a>
            <ul class="h-full flex items-center p-1 gap-10">
                <li class="p-0 m-0">
                    <a
                        class="text-muted-foreground"
                        class:text-primary-foreground={route === "/ferramentas"}
                        href={route === "/ferramentas"
                            ? "javascript:void(0)"
                            : "/ferramentas"}>Ferramentas</a
                    >
                </li>
                <li class="p-0 m-0">
                    <a
                        class="text-muted-foreground"
                        class:text-primary-foreground={route === "/insumos"}
                        href={route === "/insumos"
                            ? "javascript:void(0)"
                            : "/insumos"}>Insumos</a
                    >
                </li>
                <li class="p-0 m-0">
                    <a
                        class="text-muted-foreground"
                        class:text-primary-foreground={route === "/ocorrencias"}
                        href={route === "/ocorrencias"
                            ? "javascript:void(0)"
                            : "/ocorrencias"}>Ocorrências</a
                    >
                </li>
            </ul>
        </div>
        <div class="flex gap-2 items-center">
            <Button
                variant={route === "/ocorrencias/criar" ? "ghost" : "default"}
                size="icon-lg"
                class="hover:bg-white/10! cursor-pointer text-primary-foreground"
                href={route === "/ocorrencias/criar"
                    ? "javascript:void(0)"
                    : "/ocorrencias/criar"}
            >
                <Plus />
            </Button>

            <Button
                variant="ghost"
                size="icon-lg"
                class="hover:bg-white/10! cursor-pointer text-primary-foreground"
            >
                <Search />
            </Button>

            <Button
                variant="ghost"
                size="icon-lg"
                class="hover:bg-white/10! cursor-pointer text-primary-foreground"
            >
                <Scan />
            </Button>

            <DropdownMenu.Root>
                <DropdownMenu.Trigger>
                    {#snippet child({ props }: any)}
                        <div class="">
                            <Button
                                {...props}
                                variant="ghost"
                                size="lg"
                                class="m-0 underline-offset-5 cursor-pointer text-md  text-primary-foreground font-normal hover:bg-white/10!"
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
