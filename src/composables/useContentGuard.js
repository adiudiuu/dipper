import { onBeforeUnmount, onMounted } from 'vue'

function isEditableTarget(t) {
  return !!t?.matches?.('input, textarea, select, [contenteditable="true"]')
}

/** 全局禁右键菜单 / 复制选区；不拦截 OrbitControls 指针平移 */
export function useContentGuard() {
  function onContextMenu(e) {
    e.preventDefault()
  }

  function onCopyCut(e) {
    if (isEditableTarget(e.target)) return
    e.preventDefault()
  }

  function onSelectStart(e) {
    if (isEditableTarget(e.target)) return
    e.preventDefault()
  }

  function onDragStart(e) {
    if (isEditableTarget(e.target)) return
    e.preventDefault()
  }

  function onKeydown(e) {
    if (isEditableTarget(e.target)) return
    if (!(e.ctrlKey || e.metaKey)) return
    const k = e.key?.toLowerCase()
    if (k === 'c' || k === 'x' || k === 'a' || k === 'v' || k === 's' || k === 'p') {
      e.preventDefault()
    }
  }

  onMounted(() => {
    document.addEventListener('contextmenu', onContextMenu)
    document.addEventListener('copy', onCopyCut)
    document.addEventListener('cut', onCopyCut)
    document.addEventListener('selectstart', onSelectStart)
    document.addEventListener('dragstart', onDragStart)
    window.addEventListener('keydown', onKeydown)
  })

  onBeforeUnmount(() => {
    document.removeEventListener('contextmenu', onContextMenu)
    document.removeEventListener('copy', onCopyCut)
    document.removeEventListener('cut', onCopyCut)
    document.removeEventListener('selectstart', onSelectStart)
    document.removeEventListener('dragstart', onDragStart)
    window.removeEventListener('keydown', onKeydown)
  })
}

export { isEditableTarget }
