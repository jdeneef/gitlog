<script lang="ts">
  import Router from 'svelte-spa-router'
  import { location } from 'svelte-spa-router'
  import About from './components/About.svelte'
  import NotFound from './components/NotFound.svelte'
  /* import ShowLogs from './components/ShowLogs.svelte' */
  import ShowLog from './components/ShowLog.svelte'

  const routes = {
    '/': ShowLog,
    '/about': About,
    '/:dir': ShowLog,
    '/archive/:dir': ShowLog,
    '*': NotFound,
  }
</script>

<nav>
  <a
    class="item"
    class:active={!$location.match(/^\/(archive|about)/)}
    href="/"
    alt="home">home</a
  >
  <a class="item" class:active={$location.match(/^\/archive/)} href="#/archive">
    archive
  </a>
  <a
    class="item about"
    class:active={$location.match(/^\/about/)}
    href="#/about">about</a
  >
</nav>
<section>
  <Router {routes} />
</section>

<style>
  nav {
    display: flex;
    height: 2em;
  }
  nav .item {
    text-decoration: none;
    color: white;
    padding: 0.25em 2em;
    border-bottom: 3px solid transparent;
  }
  nav .item:active,
  nav .item:focus,
  nav .item.active {
    border-bottom: 3px solid rgb(97, 175, 239);
  }
  nav .item.about {
    margin-left: auto;
  }
  section {
    margin: 0 1em;
  }
</style>
