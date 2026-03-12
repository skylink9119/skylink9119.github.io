/* eslint-disable camelcase */
/**
 * Butterfly
 * Related Posts
 * According the tag
 */

'use strict'

const { postDesc } = require('../common/postDesc')

hexo.extend.helper.register('related_posts', function (currentPost) {
  const relatedPosts = new Map()
  const tagsData = currentPost.tags

  if (!tagsData || !tagsData.length) return ''

  tagsData.forEach(tag => {
    const posts = tag.posts
    posts.forEach(post => {
      if (currentPost.path === post.path) return

      if (relatedPosts.has(post.path)) {
        relatedPosts.get(post.path).weight += 1
      } else {
        const getPostDesc = post.postDesc || postDesc(post, hexo)
        relatedPosts.set(post.path, {
          title: post.title,
          path: post.path,
          cover: post.cover,
          cover_type: post.cover_type,
          weight: 1,
          updated: post.updated,
          created: post.date,
          postDesc: getPostDesc,
          random: Math.random()
        })
      }
    })
  })

  if (relatedPosts.size === 0) {
    return ''
  }

  const hexoConfig = hexo.config
  const config = hexo.theme.config

  const limitNum = config.related_post.limit || 6
  const dateType = config.related_post.date_type || 'created'
  const headlineLang = this._p('post.recommend')

  const relatedPostsList = Array.from(relatedPosts.values()).sort((a, b) => {
    if (b.weight !== a.weight) {
      return b.weight - a.weight
    }
    return b.random - a.random
  })

  let result = '<div class="relatedPosts">'
  result += `<div class="headline"><i class="fas fa-thumbs-up fa-fw"></i><span>${headlineLang}</span></div>`
  result += '<div class="relatedPosts-list">'

  for (let i = 0; i < Math.min(relatedPostsList.length, limitNum); i++) {
    let { cover, title, path, cover_type, created, updated, postDesc } = relatedPostsList[i]
    const { escape_html, url_for, date } = this
    cover = cover || 'var(--default-bg-color)'
    title = escape_html(title)
    const className = postDesc ? 'pagination-related' : 'pagination-related no-desc'
    result += `<a class="${className}" href="${url_for(path)}" title="${title}">`
    if (cover_type === 'img') {
      result += `<img class="cover" src="${url_for(cover)}" alt="cover">`
    } else {
      result += `<div class="cover" style="background: ${cover}"></div>`
    }
    if (dateType === 'created') {
      result += `<div class="info text-center"><div class="info-1"><div class="info-item-1"><i class="far fa-calendar-alt fa-fw"></i> ${date(created, hexoConfig.date_format)}</div>`
    } else {
      result += `<div class="info text-center"><div class="info-1"><div class="info-item-1"><i class="fas fa-history fa-fw"></i> ${date(updated, hexoConfig.date_format)}</div>`
    }
    result += `<div class="info-item-2">${title}</div></div>`

    if (postDesc) {
      result += `<div class="info-2"><div class="info-item-1">${postDesc}</div></div>`
    }
    result += '</div></a>'
  }

  result += '</div></div>'
  return result
})
