<script lang="ts">
    interface Props {
        foto: string | null;
        nome: string;
        cod: string;
        ferramenta: boolean;
        obs: string | null;
    }

    let { foto, nome, cod, ferramenta, obs }: Props = $props();
</script>

<a
    href={`insumos/${cod}`}
    class="flex w-full items-start gap-3 bg-neutral-primary-soft p-6 border border-default rounded-base shadow-xs flex-row max-w-xl"
>
    <img
        class="object-cover rounded-base h-auto w-28 md:w-48"
        src={foto
            ? `/data/uploads/${foto}`
            : ferramenta
              ? "/data/uploads/ferramenta.png"
              : "/data/uploads/insumo.png"}
        alt=""
    />
    <div class="flex flex-col justify-between md:p-4 leading-normal">
        <div>
            <h6 class="text-heading text-xs">
                {cod}
            </h6>
        </div>
        <h5 class="mb-2 text-md font-bold tracking-tight text-heading">
            {nome}
        </h5>
        <p class="mb-6 text-body text-sm">
            {obs}
        </p>
    </div>
</a>
