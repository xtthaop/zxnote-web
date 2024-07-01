import { defineStore } from 'pinia'

export const useNoteStore = defineStore('note', {
  state: () => ({
    categoryList: null,
    categoryNoteMap: new Map(),
    noteContentMap: new Map(),
  }),
})
