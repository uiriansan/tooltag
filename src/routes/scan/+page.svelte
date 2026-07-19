<script lang="ts">
    import { onMount, onDestroy } from "svelte";
    import QrScanner from "qr-scanner";

    let qr_scanner: QrScanner;
    let video_el: HTMLVideoElement;
    let error: string = $state("No error");

    onMount(() => {
        async function start_scanner() {
            if (await QrScanner.hasCamera()) {
                qr_scanner = new QrScanner(
                    video_el,
                    (result) => (error = `${result.data}`),
                    {
                        highlightScanRegion: true,
                        highlightCodeOutline: true,
                        preferredCamera: "environment",
                    },
                );
                try {
                    await qr_scanner.start();
                } catch (err) {
                    if (err instanceof Error) error = err.message;
                }
            } else {
                error = `No camera detect!`;
            }
        }

        start_scanner();
    });

    onDestroy(() => {
        if (qr_scanner) {
            qr_scanner.stop();
            qr_scanner.destroy();
        }
    });
</script>

<h1>Scan</h1>

<video bind:this={video_el} autoplay muted playsinline id="scanner-feed"
></video>

<p>{error}</p>

<style>
    #scanner-feed {
        width: 100%;
        height: 100vh;
    }
</style>
