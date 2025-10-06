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
const lastActiveTriggers = new WeakMap()
let activePopupWrapper = null
let keydownListenerBound = false

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

const toggleBodyScroll = (shouldLock) => {
  if (typeof document === 'undefined') {
    return
  }

  const body = document.body
  if (!body) {
    return
  }

  const className = 'text-img-video--no-scroll'
  if (shouldLock) {
    body.classList.add(className)
    return
  }

  const anyVisiblePopup = document.querySelector('.text-img-video__popup.is-visible')
  if (!anyVisiblePopup) {
    body.classList.remove(className)
  }
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

const playYouTubeIframe = (iframe) => {
  if (!iframe) {
    return
  }

  const id = iframe.id || `text-img-video-player-${Math.random().toString(36).slice(2)}`
  iframe.id = id

  const attemptPlay = () => {
    const player = youTubePlayers.get(id)
    if (player && typeof player.playVideo === 'function') {
      try {
        player.playVideo()
      } catch (err) {
        // Ignore playback errors (e.g., user gesture requirements)
      }
    }
  }

  attemptPlay()
  whenYouTubeReady(attemptPlay)
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

  updateDuration(mediaWrapper)

  const iframe = mediaWrapper.querySelector('.text-img-video__video iframe')
  if (iframe) {
    prepareYouTubeIframe(iframe)
    const currentSrc = iframe.getAttribute('src') || ''
    if (!iframe.dataset.autoplayApplied) {
      if (currentSrc && !/autoplay=/i.test(currentSrc)) {
        const joiner = currentSrc.includes('?') ? '&' : '?'
        iframe.setAttribute('src', `${currentSrc}${joiner}autoplay=1`)
      }
      iframe.dataset.autoplayApplied = 'true'
    }
    playYouTubeIframe(iframe)
  }

  const videoEl = mediaWrapper.querySelector('.text-img-video__video video')
  if (videoEl && typeof videoEl.play === 'function') {
    try {
      videoEl.play()
    } catch (err) {
      // Ignore errors from browsers blocking autoplay without user gesture
    }
  }
}

const stopVideoPlayback = (mediaWrapper) => {
  if (!mediaWrapper) {
    return
  }

  const iframe = mediaWrapper.querySelector('.text-img-video__video iframe')
  if (iframe) {
    const id = iframe.id
    const player = id ? youTubePlayers.get(id) : null
    if (player && typeof player.stopVideo === 'function') {
      try {
        player.stopVideo()
      } catch (err) {
        // Ignore player stop errors
      }
    } else {
      try {
        const message = JSON.stringify({ event: 'command', func: 'stopVideo', args: [] })
        if (iframe.contentWindow && typeof iframe.contentWindow.postMessage === 'function') {
          iframe.contentWindow.postMessage(message, '*')
        }
      } catch (err) {
        // Ignore postMessage failures
      }
    }
  }

  const videoEl = mediaWrapper.querySelector('.text-img-video__video video')
  if (videoEl) {
    try {
      if (typeof videoEl.pause === 'function') {
        videoEl.pause()
      }
      if (typeof videoEl.currentTime === 'number' && isFinite(videoEl.currentTime)) {
        videoEl.currentTime = 0
      }
    } catch (err) {
      // Ignore errors while resetting native video playback
    }
  }
}

const closePopup = (mediaWrapper) => {
  if (!mediaWrapper) {
    return
  }

  const popup = mediaWrapper.querySelector('[data-video-popup]')
  if (popup && popup.classList.contains('is-visible')) {
    popup.classList.remove('is-visible')
    popup.setAttribute('aria-hidden', 'true')
  }

  stopVideoPlayback(mediaWrapper)

  const trigger = lastActiveTriggers.get(mediaWrapper)
  if (trigger) {
    trigger.setAttribute('aria-expanded', 'false')
    if (typeof trigger.focus === 'function') {
      trigger.focus()
    }
    lastActiveTriggers.delete(mediaWrapper)
  }

  if (activePopupWrapper === mediaWrapper) {
    activePopupWrapper = null
  }

  toggleBodyScroll(false)
}

const openPopup = (mediaWrapper, trigger) => {
  if (!mediaWrapper) {
    return
  }

  const popup = mediaWrapper.querySelector('[data-video-popup]')
  if (!popup) {
    mediaWrapper.classList.add('playing')
    enableVideoAutoplay(mediaWrapper)
    return
  }

  if (popup.classList.contains('is-visible')) {
    return
  }

  if (activePopupWrapper && activePopupWrapper !== mediaWrapper) {
    closePopup(activePopupWrapper)
  }

  popup.classList.add('is-visible')
  popup.setAttribute('aria-hidden', 'false')

  if (trigger) {
    trigger.setAttribute('aria-expanded', 'true')
    lastActiveTriggers.set(mediaWrapper, trigger)
  }

  activePopupWrapper = mediaWrapper
  toggleBodyScroll(true)
  enableVideoAutoplay(mediaWrapper)

  const popupContent = popup.querySelector('.text-img-video__popup-content')
  if (popupContent && typeof popupContent.focus === 'function') {
    popupContent.focus()
  }
}

const handleKeydown = (event) => {
  if (!event) {
    return
  }

  const key = event.key || event.code
  if ((key !== 'Escape' && key !== 'Esc') || !activePopupWrapper) {
    return
  }

  closePopup(activePopupWrapper)
  event.preventDefault()
}

const initTextImgVideoModule = () => {
  const mediaWrappers = document.querySelectorAll('.text-img-video__media-wrapper')

  mediaWrappers.forEach((wrapper) => {
    updateDuration(wrapper)

    const playButton = wrapper.querySelector('.text-img-video__play')
    if (playButton) {
      playButton.addEventListener('click', () => openPopup(wrapper, playButton))
    }

    const closeElements = wrapper.querySelectorAll('[data-video-popup-close]')
    closeElements.forEach((element) => {
      element.addEventListener('click', (event) => {
        event.preventDefault()
        closePopup(wrapper)
      })
    })
  })

  const autoPlayingWrappers = document.querySelectorAll(
    '.text-img-video__media-wrapper.playing'
  )

  autoPlayingWrappers.forEach((wrapper) => enableVideoAutoplay(wrapper))

  if (!keydownListenerBound) {
    document.addEventListener('keydown', handleKeydown)
    keydownListenerBound = true
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initTextImgVideoModule)
} else {
  initTextImgVideoModule()
}
