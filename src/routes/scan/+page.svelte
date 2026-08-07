<script lang="ts">
    import { onMount, onDestroy } from "svelte";
    import type { Insumo } from "$lib/types";
    import QrScanner from "qr-scanner";
    import InsumoCard from "$lib/components/insumo_card.svelte";
    import Close from "~icons/fluent/add-24-regular";
    import FlashOn from "~icons/fluent/flash-24-filled";
    import FlashOff from "~icons/fluent/flash-off-24-filled";
    import CameraSwitch from "~icons/fluent/camera-switch-24-filled";
    import Button from "$lib/components/button.svelte";
    import ArrowLeft from "~icons/fluent/arrow-left-16-filled";
    import { goto } from "$app/navigation";

    let qr_scanner: QrScanner;
    let video_el: HTMLVideoElement;
    let video_overlay: HTMLDivElement;
    let cam_select: HTMLSelectElement;
    let started = $state(false);
    let has_camera = $state(false);
    let error: string | null = $state(null);
    let has_flash: boolean = $state(false);
    let flash_on: boolean = $state(false);
    let available_cameras: QrScanner.Camera[] | null = $state(null);
    let active_cam: string = $state("");

    let failed_scans: string[] = [];

    const update_cam_capabilities = async () => {
        has_flash = await qr_scanner.hasFlash();
    };

    let insumo: Insumo | undefined = $state();
    let should_scan = $state(true);

    onMount(async () => {
        if (await QrScanner.hasCamera()) {
            has_camera = true;
            qr_scanner = new QrScanner(video_el, check_result, {
                highlightScanRegion: true,
                highlightCodeOutline: true,
                returnDetailedScanResult: true,
                maxScansPerSecond: 5,
                preferredCamera:
                    localStorage.getItem("active_cam") ?? "environment",
                overlay: video_overlay,
                calculateScanRegion: (video_el) => {
                    const video_rect = video_el.getBoundingClientRect();

                    const vw = video_el.videoWidth;
                    const vh = video_el.videoHeight;

                    const scale = Math.max(
                        video_rect.width / vw,
                        video_rect.height / vh,
                    );

                    const display_w = vw * scale;
                    const display_h = vh * scale;

                    const crop_x = (display_w - video_rect.width) / 2;
                    const crop_y = (display_h - video_rect.height) / 2;

                    const css_size = video_rect.width * 0.6;
                    const css_x = (video_rect.width - css_size) / 2;
                    const css_y = (video_rect.height - css_size) / 2;

                    return {
                        x: (css_x + crop_x) / scale,
                        y: (css_y + crop_y) / (scale * 2),
                        width: css_size / scale,
                        height: css_size / scale,
                    };
                },
            });

            try {
                qr_scanner.start().then(async () => {
                    started = true;
                    qr_scanner.setInversionMode("both");

                    available_cameras = await QrScanner.listCameras(true);
                    available_cameras = available_cameras.sort((a, b) =>
                        a.label.localeCompare(b.label),
                    );

                    active_cam = video_el.srcObject
                        // @ts-ignore
                        ?.getVideoTracks()[0]
                        .getSettings().deviceId;

                    await update_cam_capabilities();
                });
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

        if (
            /^[A-Z][0-9]{3}$/.test(result.data.trim()) ||
            /^[0-9]{6}$/.test(result.data.trim())
        ) {
            const response = await fetch(`/api/insumos/${result.data.trim()}`);
            const insumo_data = await response.json();

            if (
                !failed_scans.includes(result.data.trim()) &&
                response.status === 429
            ) {
                error = insumo_data.error || "Aguarde um momento";
            } else if (
                !failed_scans.includes(result.data.trim()) &&
                response.status != 404 &&
                insumo_data.length > 0
            ) {
                insumo = insumo_data[0];
                error = "";
            } else {
                failed_scans.push(result.data.trim());
                error = `Insumo não encontrado`;
            }
        } else {
            failed_scans.push(result.data.trim());
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

<svelte:head>
    <title>Scan QrCode</title>
    <meta
        name="viewport"
        content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no"
    />
</svelte:head>

{#if !started && has_camera}
    <div
        role="status"
        class="block min-w-screen min-h-screen fixed bottom-0 right-0 top-0 left-0 object-cover inset-0 bg-neutral-primary animate-pulse flex flex-col items-center justify-center -mt-50"
    >
        <svg
            class="w-20 h-20 text-fg-disabled"
            aria-hidden="true"
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            fill="none"
            viewBox="0 0 24 24"
            ><path
                stroke="currentColor"
                stroke-linejoin="round"
                stroke-width="2"
                d="M10 3v4a1 1 0 0 1-1 1H5m14-4v16a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V7.914a1 1 0 0 1 .293-.707l3.914-3.914A1 1 0 0 1 9.914 3H18a1 1 0 0 1 1 1ZM9 12h2a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1H9a1 1 0 0 1-1-1v-2a1 1 0 0 1 1-1Zm5.697 2.395v-.733l1.269-1.219v2.984l-1.268-1.032Z"
            /></svg
        >
        <span class="text-fg-disabled font-bold mt-5">Carregando...</span>
    </div>
{/if}

<div id="video-container">
    <video
        bind:this={video_el}
        class:hidden={!started}
        autoplay
        muted
        playsinline
        id="video-feed"
        onclick={() => (insumo ? close_card() : (should_scan = true))}
        oncontextmenu={(e) => e.preventDefault()}
        class="block min-w-screen min-h-screen fixed bottom-0 right-0 top-0 left-0 object-cover inset-0"
    ></video>
    <div
        bind:this={video_overlay}
        class:hidden={!started}
        class="video-overlay"
    >
        <span class="corner corner-tl"></span>
        <span class="corner corner-tr"></span>
        <span class="corner corner-bl"></span>
        <span class="corner corner-br"></span>
    </div>
</div>

<div class="fixed inset-x-0 top-0 w-full flex items-center justify-between p-3">
    <Button
        text="Menu"
        Icon={ArrowLeft}
        class="w-30 bg-neutral-secondary-medium text-body box-border border border-default-medium hover:bg-neutral-tertiary-medium hover:text-heading focus:ring-4 focus:ring-neutral-tertiary shadow-xs"
        on_click={() => goto("/")}
    />
    {#if started}
        <div class="flex gap-2">
            <button
                type="button"
                class="bg-white/15 p-2 rounded-full"
                class:hidden={!(
                    available_cameras && available_cameras.length > 1
                )}
                onclick={() => {
                    cam_select.showPicker();
                }}
            >
                <CameraSwitch class="w-6 h-6" />
            </button>

            <button
                type="button"
                class="bg-white/15 p-2 rounded-full disabled:bg-white/5 disabled:text-disabled"
                disabled={!has_flash}
                onclick={async () => {
                    should_scan = false;
                    qr_scanner.toggleFlash().then(() => {
                        should_scan = true;
                        flash_on = !flash_on;
                    });
                }}
            >
                {#if flash_on}
                    <FlashOff class="w-6 h-6" />
                {:else}
                    <FlashOn class="w-6 h-6" />
                {/if}
            </button>
        </div>
    {/if}
</div>

<select
    bind:this={cam_select}
    class:hidden={!(available_cameras && available_cameras.length > 1) ||
        !should_scan}
    onchange={(event) => {
        // @ts-ignore
        const selected_cam = event.target?.value;
        should_scan = false;
        qr_scanner.turnFlashOff().then(() => {
            flash_on = false;
        });
        qr_scanner.setCamera(selected_cam).then(async () => {
            await update_cam_capabilities();
            localStorage.setItem("active_cam", selected_cam);
            should_scan = true;
        });
    }}
>
    <optgroup label="Selecione uma câmera:">
        {#each available_cameras as cam}
            <option value={cam.id} selected={cam.id === active_cam}>
                {cam.label
                    .toLowerCase()
                    .split(",")
                    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
                    .join(" - ")}
            </option>
        {/each}
    </optgroup>
</select>

{#if error && error.length > 0}
    <div
        class="absolute bottom-0 left-0 right-0 slide-up m-2 p-4 flex justify-center bg-danger-soft border border-danger-strong rounded-base overflow-hidden"
    >
        <p class="text-danger-strong text-center">{error}</p>
    </div>
{/if}

{#if insumo}
    <div class="absolute bottom-0 slide-up m-2 overflow-visible">
        <div class="flex justify-center mb-5">
            <button
                type="button"
                onclick={close_card}
                class="p-2 rounded-full bg-neutral-primary-soft text-heading
                border border-neutral-secondary-strong"
            >
                <Close class="rotate-45 w-10 h-10" />
            </button>
        </div>
        <InsumoCard
            foto={insumo.foto_path?.replace("./", "/")!}
            cod={insumo.cod_interno}
            nome={insumo.nome}
            obs={insumo.observacoes}
            class="shadow-xl shadow-dark/50 border-neutral-secondary-strong"
        />
    </div>
{/if}

<style>
    :global(body) {
        width: 100vw;
        height: 100vh;
        overflow: hidden;
    }

    #video-container {
        overflow: hidden;
    }
    .video-overlay {
        position: absolute;
        aspect-ratio: 1;
        border-radius: 50px;
        outline: rgba(0, 0, 0, 0.6) solid 50vmax;
    }
    .corner {
        position: absolute;
        width: 30%;
        height: 30%;
        border: 4px solid white;
    }
    .corner-tl {
        top: -10px;
        left: -10px;
        border-right: none;
        border-bottom: none;
        border-top-left-radius: 80%;
    }
    .corner-tr {
        top: -10px;
        right: -10px;
        border-left: none;
        border-bottom: none;
        border-top-right-radius: 80%;
    }
    .corner-bl {
        bottom: -10px;
        left: -10px;
        border-right: none;
        border-top: none;
        border-bottom-left-radius: 80%;
    }
    .corner-br {
        bottom: -10px;
        right: -10px;
        border-left: none;
        border-top: none;
        border-bottom-right-radius: 80%;
    }
    :global(.code-outline-highlight) {
        stroke: var(--color-blue-400) !important;
        stroke-width: 3 !important;
        stroke-dasharray: 5 5 !important;
        transform: scale(1.15);
    }

    #video-feed {
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
