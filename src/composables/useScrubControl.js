/**
 * 拨日交互控制 composable
 * 桌面：Shift+左键拖动；触屏：长按后横拖
 */
import * as THREE from 'three'

const PX_PER_DAY = 5
const SCRUB_LONG_PRESS_MS = 420
const SCRUB_MOVE_CANCEL_PX = 10
const CLICK_MOVE_PX = 8

function isCoarsePointer() {
  return typeof matchMedia === 'function' && matchMedia('(pointer: coarse)').matches
}

/**
 * @param {import('vue').Ref<HTMLElement|null>} hostRef
 * @param {(event: { mode: string, days?: number, velocity?: number }) => void} emit
 * @param {object} options
 * @param {import('three').Camera|null} [options.camera]
 * @param {import('three/examples/jsm/renderers/CSS2DRenderer').CSS2DRenderer|null} [options.labelRenderer]
 * @param {import('three').Object3D[]} [options.culturePickMeshes]
 * @param {(constellation: object) => void} [options.onCulturePick]
 * @param {{ enabled: boolean }} [options.controls]
 */
export function useScrubControl(hostRef, emit, options = {}) {
  let scrubDrag = null
  let scrubTimer = null
  let pendingScrubPointer = null
  let pendingScrubStart = null
  let scrubHintTimer = null
  let pointerDown = null

  function clearScrubHintTimer() {
    if (scrubHintTimer != null) {
      clearTimeout(scrubHintTimer)
      scrubHintTimer = null
    }
  }

  function clearScrubHint() {
    clearScrubHintTimer()
    hostRef.value?.classList.remove('scrub-engaged')
  }

  function showScrubEngaged() {
    clearScrubHintTimer()
    hostRef.value?.classList.add('scrub-engaged')
    scrubHintTimer = setTimeout(() => {
      scrubHintTimer = null
      hostRef.value?.classList.remove('scrub-engaged')
    }, 900)
    navigator.vibrate?.(10)
  }

  function beginScrub(e, fromLongPress = false) {
    if (options.controls) options.controls.enabled = false
    hostRef.value?.setPointerCapture(e.pointerId)
    hostRef.value?.classList.add('is-scrubbing')
    if (fromLongPress) showScrubEngaged()
    scrubDrag = {
      x: e.clientX,
      lastX: e.clientX,
      lastT: performance.now(),
      vx: 0,
      days: 0
    }
    emit({ mode: 'start' })
  }

  function clearScrubTimer() {
    if (scrubTimer != null) {
      clearTimeout(scrubTimer)
      scrubTimer = null
    }
    pendingScrubPointer = null
    pendingScrubStart = null
  }

  function tryPickCulture(e) {
    const labelsEl = options.labelRenderer?.domElement
    if (labelsEl?.contains(e.target)) return
    if (!options.camera || !hostRef.value || !options.culturePickMeshes?.length) return
    const rect = hostRef.value.getBoundingClientRect()
    const ndc = new THREE.Vector2(
      ((e.clientX - rect.left) / rect.width) * 2 - 1,
      -((e.clientY - rect.top) / rect.height) * 2 + 1
    )
    const raycaster = new THREE.Raycaster()
    raycaster.setFromCamera(ndc, options.camera)
    const hits = raycaster.intersectObjects(options.culturePickMeshes, false)
    if (!hits.length) return
    const c = hits[0].object.userData.constellation
    if (c?.culture) options.onCulturePick?.(c)
  }

  /** Shift+左键拨日（桌面）；触屏长按后横拖拨日 */
  function onPointerDownCapture(e) {
    if (!hostRef.value || e.button !== 0) return
    pointerDown = { x: e.clientX, y: e.clientY, pointerId: e.pointerId }

    if (e.shiftKey) {
      clearScrubTimer()
      if (options.controls) options.controls.enabled = false
      beginScrub(e)
      return
    }

    if (isCoarsePointer() && e.pointerType === 'touch' && !scrubDrag) {
      clearScrubTimer()
      pendingScrubPointer = e.pointerId
      pendingScrubStart = { x: e.clientX, y: e.clientY, pointerId: e.pointerId }
      const pendingId = e.pointerId
      scrubTimer = setTimeout(() => {
        scrubTimer = null
        if (pendingScrubPointer !== pendingId || !pendingScrubStart) return
        beginScrub(
          {
            pointerId: pendingScrubStart.pointerId,
            clientX: pendingScrubStart.x,
            clientY: pendingScrubStart.y,
            button: 0
          },
          true
        )
      }, SCRUB_LONG_PRESS_MS)
    }
  }

  function onPointerMove(e) {
    if (pendingScrubPointer === e.pointerId && pendingScrubStart && !scrubDrag) {
      const dx = Math.abs(e.clientX - pendingScrubStart.x)
      const dy = Math.abs(e.clientY - pendingScrubStart.y)
      if (dx > SCRUB_MOVE_CANCEL_PX || dy > SCRUB_MOVE_CANCEL_PX) {
        clearScrubTimer()
      }
    }

    if (!scrubDrag) return
    const dx = e.clientX - scrubDrag.x
    const now = performance.now()
    const dt = Math.max(1, now - scrubDrag.lastT)
    scrubDrag.vx = ((e.clientX - scrubDrag.lastX) / dt) * 1000
    scrubDrag.lastX = e.clientX
    scrubDrag.lastT = now
    scrubDrag.days = dx / PX_PER_DAY
    emit({ mode: 'drag', days: scrubDrag.days })
  }

  function onPointerUp(e) {
    if (pendingScrubPointer === e.pointerId) {
      clearScrubTimer()
    }

    if (
      !scrubDrag &&
      pointerDown?.pointerId === e.pointerId &&
      hostRef.value
    ) {
      const dx = Math.abs(e.clientX - pointerDown.x)
      const dy = Math.abs(e.clientY - pointerDown.y)
      if (dx < CLICK_MOVE_PX && dy < CLICK_MOVE_PX) {
        tryPickCulture(e)
      }
    }
    pointerDown = null

    if (!scrubDrag) return
    emit({
      mode: 'end',
      days: scrubDrag.days || 0,
      velocity: scrubDrag.vx / PX_PER_DAY
    })
    scrubDrag = null
    hostRef.value?.classList.remove('is-scrubbing')
    clearScrubHint()
    try {
      hostRef.value?.releasePointerCapture(e.pointerId)
    } catch {
      /* not captured */
    }
    if (options.controls) options.controls.enabled = true
  }

  function onContextMenu(e) {
    e.preventDefault()
  }

  /** 清理所有定时器与状态（用于组件卸载） */
  function cleanup() {
    clearScrubTimer()
    clearScrubHint()
  }

  return {
    eventHandlers: {
      onPointerDownCapture,
      onPointerMove,
      onPointerUp,
      onContextMenu
    },
    getPointerDown: () => pointerDown,
    cleanup
  }
}