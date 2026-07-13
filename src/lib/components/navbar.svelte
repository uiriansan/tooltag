<script lang="ts">
    let pode_voltar: boolean = false;
    let logado: boolean = false;
</script>

<nav
    class="bg-neutral-primary fixed w-full z-20 top-0 start-0 border-b border-default"
>
    <div
        class="max-w-screen-xl flex flex-wrap items-center justify-between mx-auto p-4"
    >
        <a
            href="https://flowbite.com/"
            class="flex items-center space-x-3 rtl:space-x-reverse"
        >
            <img
                src="https://flowbite.com/docs/images/logo.svg"
                class="h-7"
                alt="Flowbite Logo"
            />
            <span
                class="self-center text-xl text-heading font-semibold whitespace-nowrap"
                >Flowbite</span
            >
        </a>
        <div
            class="inline-flex md:order-2 space-x-3 md:space-x-0 rtl:space-x-reverse"
        >
            <button
                type="button"
                class="text-white bg-brand hover:bg-brand-strong box-border border border-transparent focus:ring-4 focus:ring-brand-medium shadow-xs font-medium leading-5 rounded-base text-sm px-3 py-2 focus:outline-none"
                >Get started</button
            >
        </div>
    </div>
</nav>
