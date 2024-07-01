import { ref } from 'vue'

export default function useHistoryStack() {
  const undoStack = ref([])
  const redoStack = ref([])

  function recordFirstState(state) {
    undoStack.value.length = 0
    undoStack.value.push(state)
  }

  function recordState(state) {
    if (JSON.stringify(state) === JSON.stringify(undoStack.value[undoStack.value.length - 1]))
      return
    undoStack.value.push(state)
  }

  function resetStateStack() {
    undoStack.value.length = 0
    redoStack.value.length = 0
  }

  function undo() {
    if (undoStack.value.length < 2) return
    const state = undoStack.value.pop()
    if (!state) return
    redoStack.value.push(state)
    return undoStack.value[undoStack.value.length - 1]
  }

  function redo() {
    if (undoStack.value.length < 1) return
    const state = redoStack.value.pop()
    if (!state) return
    undoStack.value.push(state)
    return state
  }

  return {
    undoStack,
    redoStack,
    recordFirstState,
    recordState,
    resetStateStack,
    undo,
    redo,
  }
}
