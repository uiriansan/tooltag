<script lang="ts">
    import { onMount, onDestroy } from "svelte";
    import QrScanner from "qr-scanner";
    import InsumoCard from "$lib/components/insumo_card.svelte";

    let qr_scanner: QrScanner;
    // @ts-ignore
    let video_el: HTMLVideoElement = $state();
    // @ts-ignore
    let prev_canvas: HTMLCanvasElement = $state();
    let started = $state(false);
    let has_camera = $state(false);
    let error: string = $state("");

    interface Insumo {
        id: number;
        cod_frabricacao: string | null;
        cod_interno: string;
        nome: string;
        observacoes: string | null;
        foto: string | null;
        material: string | null;
        ferramenta: boolean;
        tipo: number | null;
        altura_min: number | null;
        altura_max: number | null;
        rpm: number | null;
        avanco_min: number | null;
        categoria: number | null;
        criado_em: number;
        atualizado_em: number;
        adicionado_por: number | null;
        completo: boolean;
    }

    let insumo: Insumo | undefined = $state();

    // TODO: Fix grayed-out feed by picking the right device.
    onMount(async () => {
        if (await QrScanner.hasCamera()) {
            has_camera = true;
            qr_scanner = new QrScanner(video_el, check_result, {
                highlightScanRegion: true,
                highlightCodeOutline: true,
                returnDetailedScanResult: true,
                preferredCamera: "environment",
            });
            try {
                await qr_scanner.start();
                started = true;
            } catch (err) {
                if (err instanceof Error) error = err.message;
            }
        } else {
            error = `No camera detect!`;
        }
    });

    onDestroy(() => {
        if (qr_scanner) {
            qr_scanner.stop();
            qr_scanner.destroy();
        }
    });

    const check_result = async (result: QrScanner.ScanResult) => {
        if (insumo) return;

        if (/^[A-Z]-[0-9]{3}$/.test(result.data.trim())) {
            const response = await fetch(`/api/insumo/${result.data.trim()}`);
            const insumo_data = await response.json();

            if (response.status != 404 && insumo_data.length > 0) {
                insumo = insumo_data[0];
            }
        }
    };
</script>

{#if !started && has_camera}
    <h1>Carregando...</h1>
{/if}

<video
    bind:this={video_el}
    class:hidden={!started}
    autoplay
    muted
    playsinline
    id="scanner-feed"
    class="w-screen h-screen"
></video>

<canvas bind:this={prev_canvas} class="hidden w-screen h-screen"></canvas>

<p>{error}</p>

{#if insumo}
    <div class="absolute bottom-0 slide-up m-2">
        <InsumoCard
            ferramenta={insumo.ferramenta}
            foto={insumo.foto}
            cod={insumo.cod_interno}
            nome={insumo.nome}
            obs={insumo.observacoes}
        />
    </div>
{/if}

<style>
    :global(body) {
        width: 100vw;
        height: 100vh;
        overflow: hidden;
    }

    #scanner-feed {
        display: block;
    }

    .hidden {
        display: none;
    }

    .slide-up {
        animation: slideUp 0.3s ease-out forwards;
    }

    @keyframes slideUp {
        from {
            transform: translateY(100px);
            opacity: 0;
        }
        to {
            transform: translateY(0);
            opacity: 1;
        }
    }
</style>
