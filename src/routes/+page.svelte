<script lang="ts">
    import logo_tooltag from "$lib/assets/tooltag.png";
    import logo_medal from "$lib/assets/medal.svg";

    import QrCodeIcon from "$lib/assets/icons/qr_code.svelte";
    import MagnifyingGlassIcon from "$lib/assets/icons/magnifying_glass.svelte";
    import InvoiceIcon from "$lib/assets/icons/invoice.svelte";
</script>

<main class="h-screen flex flex-col">
    <div class="home-icons flex justify-center gap-5">
        <img src={logo_tooltag} alt="Logo tooltag" width="100px" />
        <img src={logo_medal} alt="Logo Medal" width="100px" />
    </div>

    <div
        class="home-buttons flex flex-1 flex-col gap-5 items-center justify-center"
    >
        <button><MagnifyingGlassIcon /> Buscar</button>
        <button><InvoiceIcon /> Solicitar insumo</button>
        <button><QrCodeIcon /> Ler QrCode </button>
    </div>
</main>

<style>
    .home-icons {
        margin-top: 150px;
    }
    .home-buttons > button {
        width: 400px;
        display: flex;
        align-items: center;
        height: 60px;
        gap: 30px;
        padding: 15px;
        border-radius: 5px;
        cursor: pointer;
        background-image: linear-gradient(
            135deg,
            var(--accent-color) 0%,
            var(--primary-color) 100%
        );
        background-clip: border-box;
        border-width: medium;
        border-style: none;
        text-transform: uppercase;
        font-weight: bold;
        color: #abb2bf;
        box-shadow: hsl(from var(--primary-color) h s l / 0.3) 0px 8px 25px;
        transition: 0.5s all;
        position: relative;
        -webkit-backface-visibility: hidden;
        backface-visibility: hidden;
        will-change: transform;
        font-size: 1em;
    }
    .home-buttons > button:hover {
        background-image: linear-gradient(
            135deg,
            var(--accent-color) 100%,
            var(--primary-color) 0%
        );
        transform: scale(1.05) rotate(0.02deg);
    }
</style>
