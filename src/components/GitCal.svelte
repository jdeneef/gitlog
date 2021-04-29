<script lang="ts">
  // generate gitlogfile:
  // $> git log --date=short --pretty=format:%ad | sort | uniq -c > gitlog.log
  export let gitlog: string
  export let styles = {}
  export let months = '6'

  const lstyles = {
    commits0: 'rgb(22,27,34)',
    commits1: 'rgb(14,68,41)',
    commits2: 'rgb(38, 166, 65)',
    commits3: 'rgb(57, 211, 83)',
    text: 'rgb(201,209,217)',
    ...styles,
  }

  let days = []
  let loading = true
  let maxcommits = 0
  let error = ''

  const _gitlog = gitlog
    .split('\n')
    .map((d) => d.match(/\s+(\d+)\s+(\d{4}-\d{2}-\d{2})/))
    .filter((d) => d)
    .reduce((a, c) => ((a[c[2]] = Number(c[1])), a), {})

  const setStyles = (node: HTMLElement | SVGElement, styles: object) => {
    Object.entries(styles).forEach(([key, value]) => {
      node.style.setProperty(key, value)
    })
  }

  // calculate start and stop date
  const calEnd = new Date()
  const calStart = new Date(
    calEnd.getFullYear(),
    calEnd.getMonth() - Number(months),
    1
  )
  calStart.setDate(-calStart.getDay() + 1)

  // format days
  for (let date = calStart; date < calEnd; date.setDate(date.getDate() + 1)) {
    const day =
      date.getFullYear() +
      '-' +
      ('00' + (date.getMonth() + 1)).slice(-2) +
      '-' +
      ('00' + date.getDate()).slice(-2)
    const commits = _gitlog[day] || 0
    if (commits > maxcommits) maxcommits = commits
    days.push({
      date: new Date(date),
      commits,
    })
  }
  loading = false

  const commits = (c: number) => {
    if (c === 0) return 'commits0'
    if (c / maxcommits <= 0.2) return 'commits1'
    if (c / maxcommits <= 0.7) return 'commits2'
    return 'commits3'
  }
</script>

{#if loading}
  Loading ..
{:else if error}
  {error}
{:else}
  <svg width={((days.length / 7) | (0 + 1)) * 12} height="97">
    <g>
      {#each days as day, index}
        {#if day.date.getDate() === 1}
          <text
            use:setStyles={{ fill: lstyles.text }}
            class="month"
            x={((index / 7) | 0) * 12}
            y="10"
          >
            {day.date.toLocaleString('default', { month: 'short' })}
            {#if !day.date.getMonth()}
              -{day.date.getFullYear() % 100}
            {/if}
          </text>
        {/if}
        <rect
          fill={lstyles[commits(day.commits)]}
          width="10"
          height="10"
          x={((index / 7) | 0) * 12}
          y={day.date.getDay() * 12 + 14}
          rx="2"
          ry="2"
        >
          <title
            >{day.date.toDateString()} - {day.commits === 0
              ? 'no '
              : day.commits}
            commit{day.commits !== 1 ? 's' : ''}</title
          >
        </rect>
      {/each}
    </g>
  </svg>
{/if}

<style>
  .month {
    font-size: xx-small;
  }
</style>
