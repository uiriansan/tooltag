<script lang="ts">
    import { onMount, onDestroy } from "svelte";
    import QrScanner from "qr-scanner";
    import InsumoCard from "$lib/components/insumo_card.svelte";
    import Close from "~icons/fluent/add-24-regular";

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
    let should_scan = $state(true);

    onMount(async () => {
        if (await QrScanner.hasCamera()) {
            has_camera = true;
            qr_scanner = new QrScanner(video_el, check_result, {
                highlightScanRegion: false,
                highlightCodeOutline: false,
                returnDetailedScanResult: true,
                maxScansPerSecond: 5,
                preferredCamera: "environment",
            });

            try {
                await qr_scanner.start();
                started = true;
            } catch (err) {
                if (err instanceof Error) error = err.message;
            }
        } else {
            error = `Nenhuma câmera disponível`;
        }
    });

    onDestroy(() => {
        if (qr_scanner) {
            qr_scanner.stop();
            qr_scanner.destroy();
        }
    });

    const check_result = async (result: QrScanner.ScanResult) => {
        if (insumo || !should_scan) return;

        if (/^[A-Z]-[0-9]{3}$/.test(result.data.trim())) {
            const response = await fetch(`/api/insumo/${result.data.trim()}`);
            const insumo_data = await response.json();

            if (response.status != 404 && insumo_data.length > 0) {
                insumo = insumo_data[0];
            } else {
                error = `Insumo não encontrado`;
            }
        } else {
            error = `Código inválido`;
        }
    };

    function close_card() {
        should_scan = false;
        insumo = undefined;
        setTimeout(() => {
            should_scan = true;
        }, 2000);
    }
</script>

{#if !started && has_camera}
    <h1>Carregando...</h1>
{/if}

<div class="">
    <video
        bind:this={video_el}
        class:hidden={!started}
        autoplay
        muted
        playsinline
        id="scanner-feed"
        onclick={() => (insumo ? close_card() : (should_scan = true))}
        class="min-w-screen min-h-screen fixed bottom-0 right-0 top-0 left-0 object-cover"
    ></video>
</div>

<p>{error}</p>

{#if insumo}
    <div class="absolute bottom-0 slide-up m-2 overflow-visible">
        <div class="flex justify-center mb-5">
            <button
                type="button"
                onclick={close_card}
                class="p-2 rounded-full bg-neutral-primary-soft text-heading
                border border-heading"
            >
                <Close class="rotate-45 w-10 h-10" />
            </button>
        </div>
        <InsumoCard
            ferramenta={insumo.ferramenta}
            foto={insumo.foto}
            cod={insumo.cod_interno}
            nome={insumo.nome}
            obs={insumo.observacoes}
            class="shadow-xl shadow-heading/50"
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
