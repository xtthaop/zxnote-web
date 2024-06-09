import { defineStore } from 'pinia'

export const useNoteStore = defineStore('note', {
  state: () => ({
    categoryList: null,
    categoryNoteMap: new Map(),
    noteContentMap: new Map(),
    undoStack: [],
    redoStack: [],
  }),
  actions: {
    recordFirstState(state) {
      this.undoStack = [state]
    },
    recordState(state) {
      this.undoStack.push(state)
    },
    undo() {
      if (this.undoStack.length < 2) return
      const state = this.undoStack.pop()
      if (!state) return
      this.redoStack.push(state)
      return this.undoStack[this.undoStack.length - 1]
    },
    redo() {
      if (this.undoStack.length < 1) return
      const state = this.redoStack.pop()
      if (!state) return
      this.undoStack.push(state)
      return state
    },
    resetStateStack() {
      this.undoStack = []
      this.redoStack = []
    },
  },
})
