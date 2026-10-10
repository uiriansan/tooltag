<script lang="ts">
    import Button from "$lib/components/ui/button/button.svelte";
    import * as Select from "$lib/components/ui/select";
    import Label from "$lib/components/ui/label/label.svelte";
    import CheckIcon from "@lucide/svelte/icons/check";
    import UncheckIcon from "@lucide/svelte/icons/square-arrow-down";
    import XIcon from "@lucide/svelte/icons/x";
    import { compare_arrays_equals } from "$lib/utils";

    interface Maquina {
        id: number;
        nome: string;
    }
    interface Celula {
        id: number;
        nome: string | null;
        maquinas: Maquina[];
    }
    type MaquinasSelectType = {
        selected_maquinas: string[];
        celulas: Celula[];
        apply_filters_cb: () => void;
    };

    let {
        selected_maquinas = $bindable<string[]>(),
        celulas,
        apply_filters_cb,
    }: MaquinasSelectType = $props();

    let selected_maquinas_at_open: string[] = [];
    let highlighted_celula = $state(-1);

    const selected_maquinas_label = $derived.by(() => {
        if (
            selected_maquinas.length === 0 ||
            selected_maquinas.length ===
                celulas.map((c) => c.maquinas).flat().length
        ) {
            return "Todas as máquinas";
        }
        return celulas
            .map((c) => c.maquinas)
            .flat()
            .filter((m) => selected_maquinas.includes(String(m.id)))
            .map((m) => m.nome)
            .join(", ");
    });

    const handle_maquinas_celula_select = (
        value: string,
        celula: {
            id: number;
            nome: string | null;
            maquinas: { id: number; nome: string }[];
        },
    ) => {
        if (value) {
            const celula_maquinas = value.replace("__celula-", "").split(",");

            if (
                celula_maquinas.some((m: string) =>
                    selected_maquinas.includes(m),
                )
            ) {
                for (let maquina of celula_maquinas) {
                    const m_idx = selected_maquinas.indexOf(maquina);

                    if (m_idx !== -1) {
                        selected_maquinas.splice(m_idx, 1);
                    }
                }
            } else {
                for (let maquina of celula_maquinas) {
                    const m_idx = selected_maquinas.indexOf(maquina);

                    if (m_idx === -1) {
                        selected_maquinas = [...selected_maquinas, maquina];
                    }
                }
            }

            const selected_maquinas_celula_idx =
                selected_maquinas.indexOf(value);

            if (selected_maquinas_celula_idx !== -1) {
                selected_maquinas.splice(selected_maquinas_celula_idx, 1);
            }
        }
    };
</script>

<div class="flex flex-col gap-1.5">
    <Label for="tipo_ferramenta" class="pl-1.5 text-foreground text-md"
        >Máquinas:</Label
    >
    <Select.Root
        bind:value={selected_maquinas}
        type="multiple"
        name="tipo_ferramenta"
        disabled={celulas.length === 0}
        allowDeselect={true}
        onOpenChange={(opened) => {
            if (opened && selected_maquinas_at_open.length === 0) {
                selected_maquinas_at_open = [...selected_maquinas];
            } else {
                if (
                    !compare_arrays_equals(
                        selected_maquinas_at_open,
                        selected_maquinas,
                    )
                ) {
                    apply_filters_cb();
                }
                selected_maquinas_at_open = [];
            }
        }}
        onValueChange={(value) => {
            if (highlighted_celula !== -1) {
                const celula = celulas.find((c) => c.id === highlighted_celula);
                if (celula) {
                    handle_maquinas_celula_select(
                        `__celula-${celula.maquinas.map((m) => m.id).join(",")}`,
                        celula,
                    );
                }
            }
        }}
    >
        <Select.Trigger class="w-full field-sizing-fixed cursor-pointer h-10!">
            <span class="overflow-hidden text-ellipsis"
                >{selected_maquinas_label}</span
            >
        </Select.Trigger>
        <Select.Content class="max-g-[300px] w-full">
            <Select.Group>
                <Select.GroupHeading>
                    {#snippet child()}
                        <div
                            class="flex justify-between px-1.5 items-center h-6"
                        >
                            <span class="text-xs text-muted-foreground"
                                >Selecione uma ou mais:</span
                            >
                            {#if selected_maquinas.length > 0}
                                <Button
                                    variant="outline"
                                    class="cursor-pointer"
                                    size="xs"
                                    onclick={() => (selected_maquinas = [])}
                                >
                                    <XIcon /> Limpar
                                </Button>
                            {/if}
                        </div>
                    {/snippet}
                </Select.GroupHeading>
            </Select.Group>
            {#each celulas as celula (celula.id)}
                {#if celula.id !== 0}
                    <Select.Item
                        value={`__celula-${celula.maquinas.map((m) => m.id).join(",")}`}
                        show_indicator={false}
                        class={highlighted_celula === celula.id
                            ? "rounded-none"
                            : ""}
                        onHighlight={() => {
                            highlighted_celula = celula.id;
                        }}
                        onUnhighlight={() => {
                            highlighted_celula = -1;
                        }}
                    >
                        <div
                            class="w-full flex justify-between items-center text-muted-foreground! text-xs cursor-s-resize"
                        >
                            <span class="flex-1">{celula.nome}</span>
                            {#if celula.maquinas.some( (m) => selected_maquinas.includes(String(m.id)), )}
                                <CheckIcon />
                            {:else}
                                <UncheckIcon />
                            {/if}
                        </div>
                    </Select.Item>
                {/if}
                {#each celula.maquinas as maquina (maquina.id)}
                    <Select.Item
                        value={String(maquina.id)}
                        label={maquina.nome}
                        class={`cursor-pointer hover:bg-accent ${highlighted_celula === celula.id ? "bg-accent rounded-none" : highlighted_celula !== -1 ? "bg-transparent!" : ""}`}
                        >{maquina.nome}</Select.Item
                    >
                {/each}
            {/each}
        </Select.Content>
    </Select.Root>
</div>
