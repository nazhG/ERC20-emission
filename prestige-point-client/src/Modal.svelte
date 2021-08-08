<script>
    export let message, linkRef, linkText;
</script>

<p>
    {message}
    {#if linkRef}
        <br>
        <a href="{linkRef}">{linkText}</a>
    {/if}
</p>