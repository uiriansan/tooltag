<script lang="ts">
    let pode_voltar: boolean = false;
    let logado: boolean = false;
</script>

<header>
    {#if pode_voltar}
        <button>Voltar</button>
    {/if}

    {#if logado}
        <button></button>
    {/if}
</header>
