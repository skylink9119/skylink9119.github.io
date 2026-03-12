hexo.extend.helper.register('getArchiveLength', function () {
  const archiveGenerator = hexo.config.archive_generator
  const posts = this.site.posts

  const { yearly, monthly, daily } = archiveGenerator
  const { year, month, day } = this.page

  // Archives Page
  if (!year) return posts.length

  // Create a map to count posts per period
  const mapData = this.fragment_cache('createArchiveObj', () => {
    const map = new Map()
    posts.forEach(post => {
      const date = post.date
      const y = date.year()
      const m = date.month() + 1
      const d = date.date()

      if (yearly) {
        const keyYear = `${y}`
        map.set(keyYear, (map.get(keyYear) || 0) + 1)
      }

      if (monthly) {
        const keyMonth = `${y}-${m}`
        map.set(keyMonth, (map.get(keyMonth) || 0) + 1)
      }

      if (daily) {
        const keyDay = `${y}-${m}-${d}`
        map.set(keyDay, (map.get(keyDay) || 0) + 1)
      }
    })
    return map
  })

  // Determine the appropriate key to fetch based on current page context
  let key
  if (yearly && year) key = `${year}`
  if (monthly && month) key = `${year}-${month}`
  if (daily && day) key = `${year}-${month}-${day}`

  // Return the count for the current period or default to the total posts
  return mapData.get(key) || posts.length
})
