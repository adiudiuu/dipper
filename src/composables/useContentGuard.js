import { onBeforeUnmount, onMounted } from 'vue'

/** 3D 画布容器：仅在这些区域内禁右键 / 拖拽选中 */
const CANVAS_HOST_SELECTOR = '.orbit-host, .butian-sky'

function isEditableTarget(t) {
  return !!t?.matches?.('input, textarea, select, [contenteditable="true"]')
}

function isCanvasHostTarget(t) {
  return !!t?.closest?.(CANVAS_HOST_SELECTOR)
}

/**
 * 仅对 3D 画布容器禁右键菜单与拖拽选中，侧栏历法文字可正常选中复制。
 * 不拦截 Ctrl+C/V 等键盘快捷键。
 */
export function useContentGuard() {
  function onContextMenu(e) {
    if (!isCanvasHostTarget(e.target)) return
    e.preventDefault()
  }

  function onSelectStart(e) {
    if (!isCanvasHostTarget(e.target)) return
    e.preventDefault()
  }

  function onDragStart(e) {
    if (!isCanvasHostTarget(e.target)) return
    e.preventDefault()
  }

  onMounted(() => {
    document.addEventListener('contextmenu', onContextMenu)
    document.addEventListener('selectstart', onSelectStart)
    document.addEventListener('dragstart', onDragStart)
  })

  onBeforeUnmount(() => {
    document.removeEventListener('contextmenu', onContextMenu)
    document.removeEventListener('selectstart', onSelectStart)
    document.removeEventListener('dragstart', onDragStart)
  })
}

export { isEditableTarget, isCanvasHostTarget }
