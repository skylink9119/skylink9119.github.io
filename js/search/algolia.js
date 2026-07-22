window.addEventListener('load', () => {
  const { algolia } = GLOBAL_CONFIG
  const { appId, apiKey, indexName, hitsPerPage = 5, languages } = algolia

  if (!appId || !apiKey || !indexName) {
    return console.error('Algolia setting is invalid!')
  }

  const CONTENT_FIELDS = ['contentStripTruncate', 'contentStrip', 'content']
  const HIGHLIGHT_PARAMS = {
    highlightPreTag: '<mark>',
    highlightPostTag: '</mark>',
    attributesToHighlight: ['title', 'content', 'contentStrip', 'contentStripTruncate']
  }

  // Pre-compiled regex for tag balancing (reused across cutContent calls)
  const TAG_REGEX = /<\/?([a-zA-Z][a-zA-Z0-9]*)[^>]*\/?>/g

  const $searchMask = document.getElementById('search-mask')
  const $searchDialog = document.querySelector('#algolia-search .search-dialog')
  const $loadingStatus = document.getElementById('loading-status')
  const $hits = document.getElementById('algolia-hits')
  const $hitsEmpty = document.getElementById('algolia-hits-empty')
  const $hitsList = document.querySelector('#algolia-hits .ais-Hits-list')
  const $hitsWrapper = document.querySelector('#algolia-hits .ais-Hits')
  const $pagination = document.getElementById('algolia-pagination')
  const $paginationList = document.querySelector('#algolia-pagination .ais-Pagination-list')
  const $stats = document.querySelector('#algolia-info .ais-Stats-text')
  const $searchInput = document.querySelector('#algolia-search-input .ais-SearchBox-input')
  const $searchForm = document.querySelector('#algolia-search-input .ais-SearchBox-form')

  const animateElements = show => {
    const action = show ? 'animateIn' : 'animateOut'
    const maskAnimation = show ? 'to_show 0.5s' : 'to_hide 0.5s'
    const dialogAnimation = show ? 'titleScale 0.5s' : 'search_close .5s'
    btf[action]($searchMask, maskAnimation)
    btf[action]($searchDialog, dialogAnimation)
  }

  const fixSafariHeight = () => {
    if (window.innerWidth < 768) {
      $searchDialog.style.setProperty('--search-height', `${window.innerHeight}px`)
    }
  }

  // Debounced resize to avoid layout thrashing
  let resizeTimer
  const onResize = () => {
    clearTimeout(resizeTimer)
    resizeTimer = setTimeout(fixSafariHeight, 150)
  }

  const handleEscape = event => {
    if (event.code === 'Escape') {
      closeSearch()
      document.removeEventListener('keydown', handleEscape)
    }
  }

  const showLoading = show => {
    if ($loadingStatus) $loadingStatus.hidden = !show
  }

  const openSearch = () => {
    btf.overflowPaddingR.add()
    animateElements(true)
    showLoading(false)

    setTimeout(() => {
      if ($searchInput) $searchInput.focus()
    }, 100)

    document.addEventListener('keydown', handleEscape)
    fixSafariHeight()
    window.addEventListener('resize', onResize)
  }

  const closeSearch = () => {
    btf.overflowPaddingR.remove()
    animateElements(false)
    document.removeEventListener('keydown', handleEscape)
    window.removeEventListener('resize', onResize)
  }

  const searchClickFn = () => {
    btf.addEventListenerPjax(document.querySelector('#search-button > .search'), 'click', openSearch)
  }

  const searchFnOnce = () => {
    $searchMask.addEventListener('click', closeSearch)
    document.querySelector('#algolia-search .search-close-button').addEventListener('click', closeSearch)
  }

  const extractContentStr = content => {
    if (!content) return ''
    if (typeof content === 'string') return content.trim()
    if (typeof content === 'object') {
      if (content.value !== undefined) {
        const str = String(content.value).trim()
        return str || ''
      }
      if (content.matchedWords || content.matchLevel || content.fullyHighlighted !== undefined) return ''
      try {
        const str = JSON.stringify(content).trim()
        return (str === '{}' || str === '[]' || str === '""') ? '' : str
      } catch (e) { return '' }
    }
    if (content.toString && typeof content.toString === 'function') {
      const str = content.toString().trim()
      return (str === '[object Object]' || str === '[object Array]') ? '' : str
    }
    return ''
  }

  const extractHighlightValue = highlightObj => {
    if (!highlightObj) return ''
    if (typeof highlightObj === 'string') return highlightObj.trim()
    if (typeof highlightObj === 'object' && highlightObj.value !== undefined) {
      return String(highlightObj.value).trim()
    }
    return ''
  }

  const cutContent = content => {
    const contentStr = extractContentStr(content)
    if (!contentStr) return ''

    const firstOccur = contentStr.indexOf('<mark>')
    let start = firstOccur - 30
    let end = firstOccur + 120
    let pre = ''
    let post = ''

    if (start <= 0) {
      start = 0
      end = 140
    } else {
      pre = '...'
    }

    if (end > contentStr.length) {
      end = contentStr.length
    } else {
      post = '...'
    }

    let substr = contentStr.substring(start, end)

    // Remove incomplete tags at boundaries
    const firstCloseBracket = substr.indexOf('>')
    const firstOpenBracket = substr.indexOf('<')
    if (firstCloseBracket !== -1 && (firstOpenBracket === -1 || firstCloseBracket < firstOpenBracket)) {
      substr = substr.substring(firstCloseBracket + 1)
    }

    const lastOpenBracket = substr.lastIndexOf('<')
    const lastCloseBracket = substr.lastIndexOf('>')
    if (lastOpenBracket !== -1 && lastOpenBracket > lastCloseBracket) {
      substr = substr.substring(0, lastOpenBracket)
    }

    // Balance tags using regex
    const tagStack = []
    let balancedStr = ''
    let lastIndex = 0
    let match

    TAG_REGEX.lastIndex = 0
    while ((match = TAG_REGEX.exec(substr)) !== null) {
      const fullTag = match[0]
      const tagName = match[1]
      const tagStart = match.index

      // Append text before this tag
      balancedStr += substr.substring(lastIndex, tagStart)

      if (fullTag.startsWith('</')) {
        // Closing tag - remove matching opening tag from stack
        const idx = tagStack.lastIndexOf(tagName)
        if (idx !== -1) tagStack.splice(idx, 1)
      } else if (!fullTag.endsWith('/>') && !fullTag.startsWith('<!')) {
        // Opening tag (not self-closing or comment)
        tagStack.push(tagName)
      }
      balancedStr += fullTag
      lastIndex = tagStart + fullTag.length
    }
    balancedStr += substr.substring(lastIndex)

    // Close unclosed tags
    for (let i = tagStack.length - 1; i >= 0; i--) {
      balancedStr += `</${tagStack[i]}>`
    }

    // Check if we cut a mark tag at the beginning
    if (start > 0 || pre) {
      const checkStart = Math.max(0, start - 30)
      const actualFirstOpenBracket = contentStr.indexOf('<', checkStart)
      const actualFirstMark = contentStr.indexOf('<mark>', checkStart)
      if (actualFirstOpenBracket !== -1 && (actualFirstMark === -1 || actualFirstOpenBracket < actualFirstMark)) {
        pre = '...'
      }
    }

    return `${pre}${balancedStr}${post}`
  }

  let searchClient

  if (window['algoliasearch/lite'] && typeof window['algoliasearch/lite'].liteClient === 'function') {
    searchClient = window['algoliasearch/lite'].liteClient(appId, apiKey)
  } else if (typeof window.algoliasearch === 'function') {
    searchClient = window.algoliasearch(appId, apiKey)
  } else {
    return console.error('Algolia search client not found!')
  }

  if (!searchClient) {
    return console.error('Failed to initialize Algolia search client')
  }

  let currentQuery = ''
  let searchRequestId = 0 // Race condition guard

  const toggleResultsVisibility = hasResults => {
    $pagination.style.display = hasResults ? '' : 'none'
    $stats.style.display = hasResults ? '' : 'none'
  }

  const renderHits = (hits, query, page = 0) => {
    if (hits.length === 0 && query) {
      $hitsEmpty.textContent = languages.hits_empty.replace(/\$\{query}/, query)
      $hitsEmpty.style.display = ''
      $hitsWrapper.style.display = 'none'
      $stats.style.display = 'none'
      return
    }

    $hitsEmpty.style.display = 'none'

    const hitsHTML = hits.map((hit, index) => {
      const itemNumber = page * hitsPerPage + index + 1
      const link = hit.permalink || (GLOBAL_CONFIG.root + hit.path)
      const result = hit._highlightResult || hit

      // Content extraction - try highlight result first, then raw hit
      let content = ''
      for (const field of CONTENT_FIELDS) {
        if (result[field]) { content = cutContent(result[field]); break }
        if (hit[field]) { content = cutContent(hit[field]); break }
      }

      // Title handling - try highlight result first, then raw hit
      let title = 'no-title'
      const titleSource = result.title || hit.title
      if (titleSource) {
        title = extractHighlightValue(titleSource) || 'no-title'
      }
      if (title === 'no-title') {
        if (typeof hit.title === 'string' && hit.title.trim()) {
          title = hit.title.trim()
        } else if (hit.title?.value) {
          title = String(hit.title.value).trim() || 'no-title'
        }
      }

      return `<li class="ais-Hits-item" value="${itemNumber}">
          <a href="${link}" class="algolia-hit-item-link">
            <span class="algolia-hits-item-title">${title}</span>
            ${content ? `<div class="algolia-hit-item-content">${content}</div>` : ''}
          </a>
        </li>`
    }).join('')

    $hitsList.innerHTML = hitsHTML
    $hitsWrapper.style.display = query ? '' : 'none'

    if (hits.length > 0) {
      $stats.style.display = ''
    }
  }

  const renderPagination = (page, nbPages) => {
    if (nbPages <= 1) {
      $pagination.style.display = 'none'
      $paginationList.innerHTML = ''
      return
    }

    const isFirstPage = page === 0
    const isLastPage = page === nbPages - 1

    // Responsive page display
    const isMobile = window.innerWidth < 768
    const maxVisiblePages = isMobile ? 3 : 5
    let startPage = Math.max(0, page - Math.floor(maxVisiblePages / 2))
    const endPage = Math.min(nbPages - 1, startPage + maxVisiblePages - 1)

    // Adjust starting page to maintain max visible pages
    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(0, endPage - maxVisiblePages + 1)
    }

    const parts = []

    // Only add ellipsis and first page when there are many pages
    if (nbPages > maxVisiblePages && startPage > 0) {
      parts.push('<li class="ais-Pagination-item ais-Pagination-item--page"><a class="ais-Pagination-link" aria-label="Page 1" href="#" data-page="0">1</a></li>')
      if (startPage > 1) {
        parts.push('<li class="ais-Pagination-item ais-Pagination-item--ellipsis"><span class="ais-Pagination-link">...</span></li>')
      }
    }

    // Add middle page numbers
    for (let i = startPage; i <= endPage; i++) {
      if (i === page) {
        parts.push(`<li class="ais-Pagination-item ais-Pagination-item--page ais-Pagination-item--selected"><span class="ais-Pagination-link" aria-label="Page ${i + 1}">${i + 1}</span></li>`)
      } else {
        parts.push(`<li class="ais-Pagination-item ais-Pagination-item--page"><a class="ais-Pagination-link" aria-label="Page ${i + 1}" href="#" data-page="${i}">${i + 1}</a></li>`)
      }
    }

    // Only add ellipsis and last page when there are many pages
    if (nbPages > maxVisiblePages && endPage < nbPages - 1) {
      if (endPage < nbPages - 2) {
        parts.push('<li class="ais-Pagination-item ais-Pagination-item--ellipsis"><span class="ais-Pagination-link">...</span></li>')
      }
      parts.push(`<li class="ais-Pagination-item ais-Pagination-item--page"><a class="ais-Pagination-link" aria-label="Page ${nbPages}" href="#" data-page="${nbPages - 1}">${nbPages}</a></li>`)
    }

    // Build prev/next links
    const prevLink = isFirstPage
      ? '<span class="ais-Pagination-link ais-Pagination-link--disabled" aria-label="Previous Page"><i class="fas fa-angle-left"></i></span>'
      : `<a class="ais-Pagination-link" aria-label="Previous Page" href="#" data-page="${page - 1}"><i class="fas fa-angle-left"></i></a>`
    const nextLink = isLastPage
      ? '<span class="ais-Pagination-link ais-Pagination-link--disabled" aria-label="Next Page"><i class="fas fa-angle-right"></i></span>'
      : `<a class="ais-Pagination-link" aria-label="Next Page" href="#" data-page="${page + 1}"><i class="fas fa-angle-right"></i></a>`

    $paginationList.innerHTML = `<li class="ais-Pagination-item ais-Pagination-item--previousPage ${isFirstPage ? 'ais-Pagination-item--disabled' : ''}">${prevLink}</li>${parts.join('')}<li class="ais-Pagination-item ais-Pagination-item--nextPage ${isLastPage ? 'ais-Pagination-item--disabled' : ''}">${nextLink}</li>`
    $pagination.style.display = currentQuery ? '' : 'none'
  }

  const renderStats = (nbHits, processingTimeMS, query) => {
    if (query) {
      const stats = languages.hits_stats
        .replace(/\$\{hits}/, nbHits)
        .replace(/\$\{time}/, processingTimeMS)
      $stats.innerHTML = `<hr>${stats}`
      $stats.style.display = ''
    } else {
      $stats.style.display = 'none'
    }
  }

  const performSearch = async (query, page = 0) => {
    const trimmedQuery = query.trim()

    if (!trimmedQuery) {
      currentQuery = ''
      searchRequestId++
      renderHits([], '', 0)
      renderPagination(0, 0)
      renderStats(0, 0, '')
      toggleResultsVisibility(false)
      return
    }

    showLoading(true)
    currentQuery = trimmedQuery
    const requestId = ++searchRequestId

    try {
      let result

      if (searchClient && typeof searchClient.search === 'function') {
        // v5 multi-index search
        const searchResult = await searchClient.search([{
          indexName,
          query: trimmedQuery,
          params: { page, hitsPerPage, ...HIGHLIGHT_PARAMS }
        }])
        result = searchResult.results[0]
      } else if (searchClient && typeof searchClient.initIndex === 'function') {
        // v4 single-index search
        const index = searchClient.initIndex(indexName)
        result = await index.search(trimmedQuery, { page, hitsPerPage, ...HIGHLIGHT_PARAMS })
      } else {
        throw new Error('Algolia: No compatible search method available')
      }

      // Discard stale results from superseded searches
      if (requestId !== searchRequestId) return

      renderHits(result.hits || [], trimmedQuery, page)

      const actualNbPages = result.nbHits <= hitsPerPage ? 1 : (result.nbPages || 0)
      renderPagination(page, actualNbPages)
      renderStats(result.nbHits || 0, result.processingTimeMS || 0, trimmedQuery)

      const hasResults = result.hits && result.hits.length > 0
      toggleResultsVisibility(hasResults)

      // Refresh Pjax links
      if (window.pjax) {
        window.pjax.refresh($hits)
      }
    } catch (error) {
      if (requestId !== searchRequestId) return
      console.error('Algolia search error:', error)
      renderHits([], trimmedQuery, page)
      renderPagination(0, 0)
      renderStats(0, 0, trimmedQuery)
    } finally {
      if (requestId === searchRequestId) {
        showLoading(false)
      }
    }
  }

  let searchTimeout
  const debouncedSearch = (query, delay = 300) => {
    clearTimeout(searchTimeout)
    // Empty query: clear results immediately without debounce delay
    if (!query.trim()) {
      performSearch(query)
      return
    }
    searchTimeout = setTimeout(() => performSearch(query), delay)
  }

  const initializeSearch = () => {
    showLoading(false)

    if ($searchInput) {
      $searchInput.addEventListener('input', e => {
        debouncedSearch(e.target.value)
      })
    }

    if ($searchForm) {
      $searchForm.addEventListener('submit', e => {
        e.preventDefault()
        performSearch($searchInput ? $searchInput.value : '')
      })
    }

    // Pagination event delegation
    $pagination.addEventListener('click', e => {
      e.preventDefault()
      const link = e.target.closest('a[data-page]')
      if (link) {
        const page = parseInt(link.dataset.page, 10)
        if (!isNaN(page) && currentQuery) {
          performSearch(currentQuery, page)
        }
      }
    })

    // Initial state
    toggleResultsVisibility(false)
  }

  initializeSearch()
  searchClickFn()
  searchFnOnce()

  window.addEventListener('pjax:complete', () => {
    if (!btf.isHidden($searchMask)) closeSearch()
    searchClickFn()
  })
})
