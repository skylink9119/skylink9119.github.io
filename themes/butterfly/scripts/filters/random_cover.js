/**
 * Random cover for posts
 */

'use strict'

hexo.extend.generator.register('post', locals => {
  const imgTestReg = /\.(png|jpe?g|gif|svg|webp|avif)(\?.*)?$/i
  const { post_asset_folder: postAssetFolder } = hexo.config
  const { cover: { default_cover: defaultCover } } = hexo.theme.config

  function * createCoverGenerator () {
    if (!defaultCover) {
      while (true) yield false
    }
    if (!Array.isArray(defaultCover)) {
      while (true) yield defaultCover
    }

    const coverCount = defaultCover.length
    if (coverCount === 1) {
      while (true) yield defaultCover[0]
    }

    const maxHistory = Math.min(3, coverCount - 1)
    const history = []

    while (true) {
      let index
      do {
        index = Math.floor(Math.random() * coverCount)
      } while (history.includes(index))

      history.push(index)
      if (history.length > maxHistory) history.shift()

      yield defaultCover[index]
    }
  }

  const coverGenerator = createCoverGenerator()

  const handleImg = data => {
    let { cover: coverVal, top_img: topImg, pagination_cover: paginationCover } = data

    // Add path to top_img and cover if post_asset_folder is enabled
    if (postAssetFolder) {
      if (topImg && topImg.indexOf('/') === -1 && imgTestReg.test(topImg)) {
        data.top_img = `${data.path}${topImg}`
      }
      if (coverVal && coverVal.indexOf('/') === -1 && imgTestReg.test(coverVal)) {
        data.cover = `${data.path}${coverVal}`
      }
      if (paginationCover && paginationCover.indexOf('/') === -1 && imgTestReg.test(paginationCover)) {
        data.pagination_cover = `${data.path}${paginationCover}`
      }
    }

    if (coverVal === false) return data

    // If cover is not set, use random cover
    if (!coverVal) {
      const randomCover = coverGenerator.next().value
      data.cover = randomCover
      coverVal = randomCover
    }

    if (coverVal && (coverVal.indexOf('//') !== -1 || imgTestReg.test(coverVal))) {
      data.cover_type = 'img'
    }

    return data
  }

  const posts = locals.posts.sort('date').toArray()
  const { length } = posts

  return posts.map((post, i) => {
    if (i) post.prev = posts[i - 1]
    if (i < length - 1) post.next = posts[i + 1]

    post.__post = true

    return {
      data: handleImg(post),
      layout: 'post',
      path: post.path
    }
  })
})
