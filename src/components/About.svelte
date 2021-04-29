<script lang="ts">
  // replaced by preprocessor
  const packageVersion = process.env.npm_package_version
  const packageName = process.env.npm_package_name
</script>

<svelte:head>
  <title>gitLog about</title>
</svelte:head>

<main>
  <h1>About this app</h1>

    info: name={packageName} version={packageVersion}

  <p>
  Built with <a rel=external href='https://svelte.dev'>Svelte</a>
  </p>


</main>

<style>
  main {
    padding: 2em;
  }
</style>
