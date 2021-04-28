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
  const name = $location === '/' ? 'overview' : params.dir
</script>

<h1>Git Logs - {name}</h1>

{#await getFiles then files}
  {#each files as item}
    {#if item.type === 'directory' && item.name !== 'archive'}
      <a class="dir" href="#/{inArchive ? 'archive/' : ''}{item.name}">
        {item.name}
      </a>
    {:else if item.type === 'file' && item.name === 'git.log'}
      <div class="gitcal">
        Git activities: {name}<br>
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
        {#await fetch(url + '/' + item.name).then((r) => r.text())}
          Loading ...
        {:then data}
          {@html marked(data)}
        {/await}
      </div>
    {/if}
  {/each}
{:catch error}
  <div class="error">
    {error.message}
  </div>
{/await}

<style>
  .dir:first-of-type::before {
    content: 'Projects: ';
  }
  .dir {
    text-decoration: none;
  }
  .gitcal {
    margin: 1em 0;
    padding: 0.5em;
    background: rgb(92, 99, 112);
    box-shadow: 5px 5px 5px rgb(52,59,72);
    overflow: hidden;
  }
  .readme {
    padding: 0.5em;
    box-shadow: 5px 5px 5px rgb(52,59,72);
    background: #fefefe;
    color: rgb(72, 79, 92);
  }
</style>
