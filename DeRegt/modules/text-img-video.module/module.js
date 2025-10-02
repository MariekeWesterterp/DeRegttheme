const getPageOrigin = () => {
  if (typeof window === 'undefined') {
    return ''
  }

  if (window.location && window.location.origin) {
    return window.location.origin
  }

  if (window.location) {
    return `${window.location.protocol}//${window.location.host}`
  }

  return ''
}

const youTubeApiState = {
  loading: false,
  ready: false,
  queue: [],
}

const youTubePlayers = new Map()

const formatDuration = (seconds) => {
  if (!Number.isFinite(seconds) || seconds <= 0) {
    return ''
  }

  const rounded = Math.round(seconds)
  const hrs = Math.floor(rounded / 3600)
  const mins = Math.floor((rounded % 3600) / 60)
  const secs = rounded % 60

  const pad = (value) => value.toString().padStart(2, '0')

  if (hrs > 0) {
    return `${hrs}:${pad(mins)}:${pad(secs)}`
  }

  return `${mins}:${pad(secs)}`
}

const setDurationText = (mediaWrapper, seconds) => {
  const durationTarget = mediaWrapper.querySelector('[data-video-duration]')
  if (!durationTarget) {
    return false
  }

  const label = formatDuration(seconds)
  if (!label) {
    return false
  }

  durationTarget.textContent = label
  durationTarget.classList.add('is-visible')

  const metaContainer = mediaWrapper.querySelector('[data-video-meta]')
  if (metaContainer && metaContainer.classList.contains('text-img-video__meta--hidden')) {
    metaContainer.classList.remove('text-img-video__meta--hidden')
  }

  mediaWrapper.dataset.durationResolved = 'true'
  return true
}

const ensureYouTubeApiReady = () => {
  if (youTubeApiState.ready || (window.YT && typeof window.YT.Player === 'function')) {
    youTubeApiState.ready = true
    while (youTubeApiState.queue.length) {
      const callback = youTubeApiState.queue.shift()
      if (typeof callback === 'function') {
        callback()
      }
    }
    return
  }

  if (!youTubeApiState.loading) {
    const script = document.createElement('script')
    script.src = 'https://www.youtube.com/iframe_api'
    script.async = true
    document.head.appendChild(script)
    youTubeApiState.loading = true
  }

  if (!window._textImgVideoYouTubeReadyHandler) {
    const previousReady = window.onYouTubeIframeAPIReady
    window.onYouTubeIframeAPIReady = () => {
      youTubeApiState.ready = true
      if (typeof previousReady === 'function') {
        try {
          previousReady()
        } catch (err) {
          // Ignore downstream errors from other handlers
        }
      }
      while (youTubeApiState.queue.length) {
        const callback = youTubeApiState.queue.shift()
        if (typeof callback === 'function') {
          callback()
        }
      }
    }
    window._textImgVideoYouTubeReadyHandler = true
  }
}

const whenYouTubeReady = (callback) => {
  if (youTubeApiState.ready || (window.YT && typeof window.YT.Player === 'function')) {
    youTubeApiState.ready = true
    callback()
    return
  }

  youTubeApiState.queue.push(callback)
  ensureYouTubeApiReady()
}

const requestDurationFromPlayer = (player, mediaWrapper, attempt = 0) => {
  if (!player || typeof player.getDuration !== 'function') {
    return
  }

  const seconds = player.getDuration()
  if (setDurationText(mediaWrapper, seconds)) {
    return
  }

  if (attempt < 12) {
    setTimeout(() => requestDurationFromPlayer(player, mediaWrapper, attempt + 1), 500)
  }
}

const prepareYouTubeIframe = (iframe) => {
  if (!iframe) {
    return
  }

  const src = iframe.getAttribute('src')
  if (!src || !/youtube\.com|youtu\.be/i.test(src)) {
    return
  }

  const origin = getPageOrigin()
  if (!origin) {
    return
  }

  try {
    const url = new URL(src, window.location.href)
    if (!url.searchParams.get('origin')) {
      url.searchParams.set('origin', origin)
      iframe.setAttribute('src', url.toString())
    }
  } catch (err) {
    const hasQuery = src.indexOf('?') !== -1
    const separator = hasQuery ? '&' : '?'
    const encodedOrigin = encodeURIComponent(origin)
    if (src.indexOf('origin=') === -1) {
      iframe.setAttribute('src', `${src}${separator}origin=${encodedOrigin}`)
    }
  }
}

const bindYouTubeDuration = (iframe, mediaWrapper) => {
  if (!iframe || iframe.dataset.durationBound === 'true') {
    return
  }

  prepareYouTubeIframe(iframe)

  const id = iframe.id || `text-img-video-player-${Math.random().toString(36).slice(2)}`
  iframe.id = id
  iframe.dataset.durationBound = 'true'

  whenYouTubeReady(() => {
    if (!(window.YT && typeof window.YT.Player === 'function')) {
      return
    }

    if (youTubePlayers.has(id)) {
      const existing = youTubePlayers.get(id)
      requestDurationFromPlayer(existing, mediaWrapper)
      return
    }

    try {
      const player = new YT.Player(id, {
        host: 'https://www.youtube.com',
        playerVars: {
          origin: getPageOrigin() || undefined,
          playsinline: 1,
          autoplay: 0,
        },
        events: {
          onReady: (event) => {
            if (!(event && event.target)) {
              return
            }

            requestDurationFromPlayer(event.target, mediaWrapper)
          },
          onStateChange: (event) => {
            if (!event || !event.target || mediaWrapper.dataset.durationResolved === 'true') {
              return
            }

            const playableStates = [1, 2, 3, 5]
            if (playableStates.includes(event.data)) {
              requestDurationFromPlayer(event.target, mediaWrapper)
            }
          },
        },
      })

      youTubePlayers.set(id, player)
    } catch (err) {
      // Ignore player instantiation errors
    }
  })
}

const updateDuration = (mediaWrapper) => {
  if (!mediaWrapper || mediaWrapper.dataset.durationResolved === 'true') {
    return
  }

  const widget = mediaWrapper.querySelector('.hs-video-widget')
  const widgetDuration = widget && widget.dataset ? widget.dataset.hsvDuration : null
  if (widgetDuration && setDurationText(mediaWrapper, Number(widgetDuration))) {
    return
  }

  const videoEl = mediaWrapper.querySelector('.text-img-video__video video')
  if (videoEl) {
    const applyDuration = () => {
      if (setDurationText(mediaWrapper, videoEl.duration)) {
        videoEl.removeEventListener('loadedmetadata', applyDuration)
      }
    }

    if (!setDurationText(mediaWrapper, videoEl.duration)) {
      videoEl.addEventListener('loadedmetadata', applyDuration)
    }
  }

  const iframe = mediaWrapper.querySelector('.text-img-video__video iframe')
  if (iframe && /youtube\.com|youtu\.be/i.test(iframe.src)) {
    bindYouTubeDuration(iframe, mediaWrapper)
  }
}

const enableVideoAutoplay = (mediaWrapper) => {
  if (!mediaWrapper) {
    return
  }

  const iframe = mediaWrapper.querySelector('.text-img-video__video iframe')
  if (iframe && !iframe.dataset.autoplayApplied) {
    prepareYouTubeIframe(iframe)
    const currentSrc = iframe.getAttribute('src') || ''
    if (currentSrc && !/autoplay=/i.test(currentSrc)) {
      const joiner = currentSrc.includes('?') ? '&' : '?'
      iframe.setAttribute('src', `${currentSrc}${joiner}autoplay=1`)
    }
    iframe.dataset.autoplayApplied = 'true'
  }

  const videoEl = mediaWrapper.querySelector('.text-img-video__video video')
  if (videoEl && typeof videoEl.play === 'function') {
    try {
      videoEl.play()
    } catch (err) {
      // Ignore errors from browsers blocking autoplay without user gesture
    }
  }

  updateDuration(mediaWrapper)
}

const initTextImgVideoModule = () => {
  const playButtons = document.querySelectorAll('.text-img-video__play')
  const mediaWrappers = document.querySelectorAll('.text-img-video__media-wrapper')

  mediaWrappers.forEach(updateDuration)

  playButtons.forEach((button) => {
    button.addEventListener('click', () => {
      const mediaWrapper = button.closest('.text-img-video__media-wrapper')

      if (!mediaWrapper) {
        return
      }

      mediaWrapper.classList.add('playing')
      enableVideoAutoplay(mediaWrapper)
    })
  })

  const autoPlayingWrappers = document.querySelectorAll(
    '.text-img-video__media-wrapper.playing'
  )

  autoPlayingWrappers.forEach((wrapper) => enableVideoAutoplay(wrapper))
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initTextImgVideoModule)
} else {
  initTextImgVideoModule()
}
