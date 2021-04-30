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

  const baseURL = 'process.env.baseURL'

  const url = baseURL + (params.dir ? params.dir + '/' : '')

  const getFiles: Promise<nginxJson[]> = fetch(url).then(r => r.json())
  const name = $location === '/' ? 'overview' : params.dir
</script>

<h1>Git Logs - {name}</h1>

<div class="wrapper">
  {#await getFiles then files}
    {#if files.find(d => d.type === 'directory' && d.name !== 'archive')}
      Projects:
      <div class="projects">
        {#each files.filter(d => d.type === 'directory') as item}
          <a class="dir" href="#/{item.name}">
            {item.name}
          </a>
        {/each}
      </div>
    {/if}
    {#each files.filter(d => d.type === 'file' && d.name === 'git.log') as item}
      <div class="gitcal">
        Git activities: {item.name}<br />
        {#await fetch(url + '/git.log').then(r => r.text())}
          Loading ...
        {:then data}
          <GitCal
            gitlog={data}
            months="12"
            styles={{ commits0: 'rgb(65,72,89)' }}
          />
        {/await}
      </div>
    {/each}
    {#each files.filter(d => d.type === 'file' && d.name.match(/\.(md|txt)/i)) as item}
      <div class="readme">
        {#await fetch(url + '/' + item.name).then(r => r.text())}
          Loading ...
        {:then data}
          {@html marked(data)}
        {/await}
      </div>
    {/each}
  {:catch error}
    <div class="error">
      {error.message}
    </div>
  {/await}
</div>

<style>
  .wrapper {
    display: flex;
    flex-direction: column;
  }
  .projects {
    order: 1;
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
  }
  .dir {
    padding: 0.25em 0.5em;
    margin: 0.25em 0.5em;
    text-decoration: none;
    box-shadow: 2px 2px 2px rgb(52, 59, 72);
    background-color: rgb(92, 99, 112);
  }
  .dir:active {
    box-shadow: none;
  }
  .gitcal {
    order: 2;
    margin: 1em 0;
    padding: 0.5em;
    background: rgb(92, 99, 112);
    box-shadow: 5px 5px 5px rgb(52, 59, 72);
    overflow: hidden;
  }
  .readme {
    order: 3;
    padding: 0.5em;
    box-shadow: 5px 5px 5px rgb(52, 59, 72);
    background: #fefefe;
    color: rgb(72, 79, 92);
  }
</style>
