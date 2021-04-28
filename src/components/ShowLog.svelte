<script lang="ts">
  export let params: { dir?: string } = {}
  import { location } from 'svelte-spa-router'
  import marked from 'marked'
  import GitCal from '../components/GitCal.svelte'

  marked.setOptions({
    mangle: true,
    gfm: true,
    breaks: true,
    smartLists: true,
    smartypants: true,
  })

  type nginxJson = {
    name: string
    type: string
    mtime: string
    size?: number
  }

  const inArchive = $location.match(/^\/archive/)

  const url = [
    'https://de-neef.net/gitlog/gitlogs',
    inArchive && 'archive',
    params.dir !== 'archive' && params.dir,
  ]
    .filter((d) => d)
    .join('/')

  const getFiles: Promise<nginxJson[]> = fetch(url).then((r) => r.json())
  const gitdir = $location === '/' ? 'overview' : params.dir
</script>

<h1>Git Logs {gitdir}</h1>
{$location}

{#await getFiles then files}
  {#each files as item}
    {#if item.type === 'directory'}
      <a class="dir" href="#/{inArchive ? 'archive/' : ''}{item.name}">
        {item.name}
      </a>
    {:else if item.type === 'file' && item.name === 'git.log'}
      <div class="gitcal">
        {#await fetch(url + '/git.log').then((r) => r.text())}
          Loading ...
        {:then data}
          <GitCal
            gitlog={data}
            months="12"
            styles={{ commits0: 'rgb(65,72,89)' }}
          />
        {/await}
      </div>
    {:else if item.type === 'file' && item.name.match(/\.(md|txt)/i)}
      <div class="readme">
        text: {item.name}
      </div>
    {:else}
      error
    {/if}
  {/each}
{:catch error}
  <div class="error">
    {error.message}
  </div>
{/await}

<style>
  .dir {
  }
  .gitcal {
    margin: 1em 0;
  }
  .readme {
  }
</style>
