import { onBeforeUnmount, onMounted } from 'vue'

function isEditableTarget(t) {
  return !!t?.matches?.('input, textarea, select, [contenteditable="true"]')
}

/**
 * 全局禁右键菜单 / 选区（保护 3D 场景内容）。
 * 不拦截 Ctrl+C/V 等键盘快捷键，避免干扰输入框的正常操作。
 */
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

  onMounted(() => {
    document.addEventListener('contextmenu', onContextMenu)
    document.addEventListener('copy', onCopyCut)
    document.addEventListener('cut', onCopyCut)
    document.addEventListener('selectstart', onSelectStart)
    document.addEventListener('dragstart', onDragStart)
  })

  onBeforeUnmount(() => {
    document.removeEventListener('contextmenu', onContextMenu)
    document.removeEventListener('copy', onCopyCut)
    document.removeEventListener('cut', onCopyCut)
    document.removeEventListener('selectstart', onSelectStart)
    document.removeEventListener('dragstart', onDragStart)
  })
}

export { isEditableTarget }
