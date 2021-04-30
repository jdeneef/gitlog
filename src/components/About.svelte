<script lang="ts">
  // replaced by preprocessor
  const packageVersion = process.env.npm_package_version
  const packageName = process.env.npm_package_name
  const node_env = process.env.NODE_ENV
</script>

<svelte:head>
  <title>gitLog about</title>
</svelte:head>

<main>
  <h1>About this app</h1>

    info: name={packageName} version={packageVersion} running in {node_env}

  <p>
  Built with <a rel=external href='https://svelte.dev'>Svelte</a>
  </p>


</main>

<style>
  main {
    padding: 2em;
  }
</style>
