import React from 'react'
import debounce from 'lodash/debounce'
import { withRouter } from 'react-router-dom'
import { Editor } from '../notebook/components/index'
import Switch from '@/components/Switch'
import { getCategoryNote } from '@/api/notebook/note'
import 'highlight.js/styles/vs2015.css';
import { message } from '@/components/message'
import {
  PreviewWrapper,
  Previewer,
  TitleWrapper,
  ContentWrapper,
  SyncScrollToggle,
} from './style'

class Preview extends React.Component {
  constructor(props){
    super(props)
    this.state = {
      showPreviewer: false,
      activeNoteInfo: {},
      categoryNoteList: [],
      previewerTitle: undefined,
      previewerContent: undefined,
      scale: 0,
      currentTab: '',
      scrollMap: null,
      syncScrollStatus: true,
      $editor: null,
      $preview: null,
    }
    this.md = null
    this.editorRef = React.createRef()
    this.previewerRef = React.createRef()
    this.handleSyncTitle = this.handleSyncTitle.bind(this)
    this.handleSyncContent = this.handleSyncContent.bind(this)
    this.handleGetNote = this.handleGetNote.bind(this)
    this.handleClearNote = this.handleClearNote.bind(this)
    this.syncPreviewScroll = debounce(this.syncPreviewScroll.bind(this), 50, { maxWait: 50 })
    this.syncEditorScroll = debounce(this.syncEditorScroll.bind(this), 50, { maxWait: 50 })
    this.handleToggleSyncScroll = this.handleToggleSyncScroll.bind(this)
    this.syncScrollInit = this.syncScrollInit.bind(this)
    this.syncScrollDestroy = this.syncScrollDestroy.bind(this)
    this.editorMouseEnter = this.editorMouseEnter.bind(this)
    this.previewMouseEnter = this.previewMouseEnter.bind(this)
  }

  async handleInitMarkdown(){
    // Apply syntax highlighting to fenced code blocks with the highlight option:
    const hljs = await import('highlight.js') // https://highlightjs.org/

    this.md = require('markdown-it')({
      // html: true,
      // typographer: true,
      // linkify: true,
      // xhtmlOut: true, 
      breaks: true,
      highlight: (str, lang) => {
        if(lang && hljs.getLanguage(lang)){
          try{
            return '<pre class="hljs"><code>' +
                   hljs.highlight(str, { language: lang, ignoreIllegals: true }).value +
                   '</code></pre>'
          }catch(__){}
        }
    
        return '<pre class="hljs"><code>' + this.md.utils.escapeHtml(str) + '</code></pre>';
      }
    })

    // add target="_blank" to all links
    // Remember old renderer, if overridden, or proxy to default renderer
    const defaultRender = this.md.renderer.rules.link_open || function(tokens, idx, options, env, self){
      return self.renderToken(tokens, idx, options)
    }

    this.md.renderer.rules.link_open = function(tokens, idx, options, env, self){
      // If you are sure other plugins can't add `target` - drop check below
      const aIndex = tokens[idx].attrIndex('target')
    
      if(aIndex < 0){
        tokens[idx].attrPush(['target', '_blank']) // add new attribute
      }else{
        tokens[idx].attrs[aIndex][1] = '_blank' // replace value of existing attr
      }
      
      // pass token to default renderer.
      return defaultRender(tokens, idx, options, env, self)
    }

    // replace default image render rule
    this.md.renderer.rules.image = (tokens, idx, options, env, self) => {
      const token = tokens[idx]
      token.attrs[token.attrIndex('alt')][1] = self.renderInlineAsText(token.children, options, env)

      return '<div class="image-package"><img' + 
             '  src="' + token.attrs[token.attrIndex('src')][1] + '"' + 
             '  alt="' + token.attrs[token.attrIndex('alt')][1] + '"' +
             '  title="' + (token.attrs[token.attrIndex('title')] ? token.attrs[token.attrIndex('title')][1] : '') + '"' +
             '/></div>'
    }

    // Inject line numbers for sync scroll
    function injectLineNumbers(tokens, idx, options, env, self){
      if(tokens[idx].map && tokens[idx].level === 0){
        const line = tokens[idx].map[0]
        tokens[idx].attrJoin('class', 'line')
        tokens[idx].attrSet('data-line', String(line))
      }
      return self.renderToken(tokens, idx, options, env, self)
    }

    this.md.renderer.rules.paragraph_open = this.md.renderer.rules.heading_open = injectLineNumbers
  }

  handleSyncTitle(title){
    this.setState({ previewerTitle: title })
  }

  handleSyncContent(content){
    if(content === false){
      this.setState({ 
        showPreviewer: false,
        previewerContent: '',
      })
    }else{
      this.setState({ 
        showPreviewer: true,
        previewerContent: { __html: this.md.render(content) }
      }, () => {
        const $editor = this.editorRef.current.contentRef.current
        const $preview = this.previewerRef.current
        this.setState({ $editor, $preview }, () => {
          if(this.state.syncScrollStatus){
            this.syncScrollInit()
          }
        })
      })
    }
  }

  syncScrollInit(){
    const { $editor, $preview } = this.state

    const scrollMap = this.buildScrollMap()
    this.setState({ scrollMap })
    $editor.addEventListener('mouseenter', this.editorMouseEnter)
    $preview.addEventListener('mouseenter', this.previewMouseEnter)

    const imgPackage = $preview.getElementsByClassName('image-package')
    let completeNum = 0
    for(let i = 0; i < imgPackage.length; i++){
      imgPackage[i].getElementsByTagName('img')[0].onload = () => {
        completeNum++
        if(completeNum === imgPackage.length){
          const scrollMap = this.buildScrollMap()
          this.setState({ scrollMap })
        }
      }
    }
  }

  editorMouseEnter(){
    const { $editor, $preview } = this.state
    $preview.removeEventListener('scroll', this.syncEditorScroll)
    $editor.addEventListener('scroll', this.syncPreviewScroll)
  }

  previewMouseEnter(){
    const { $editor, $preview } = this.state
    $editor.removeEventListener('scroll', this.syncPreviewScroll)
    $preview.addEventListener('scroll', this.syncEditorScroll)
  }

  syncScrollDestroy(){
    const scrollMap = null
    this.setState({ scrollMap })

    const { $editor, $preview } = this.state
    $editor.removeEventListener('mouseenter', this.editorMouseEnter)
    $preview.removeEventListener('mouseenter', this.previewMouseEnter)
    $preview.removeEventListener('scroll', this.syncEditorScroll)
    $editor.removeEventListener('scroll', this.syncPreviewScroll)
  }

  handleToggleSyncScroll(val){
    this.setState({ syncScrollStatus: val }, () => {
      if(val){
        this.previewMouseEnter()
        this.syncScrollInit()
      }else{
        this.syncScrollDestroy()
      }
    })
  }

  syncEditorScroll(){
    if(!this.state.scrollMap) return
    const { $editor, $preview } = this.state
    const scrollTop = $preview.scrollTop
    const lineHeight = parseFloat(getComputedStyle($editor).lineHeight)

    const lines = Object.keys(this.state.scrollMap)
    if(lines.length < 1) return
    let line = lines[0]
    for(let i = 0; i < lines.length; i++){
      if(this.state.scrollMap[lines[i]] < scrollTop){
        line = lines[i]
        continue
      }

      break
    }

    $editor.scrollTop = lineHeight * line
  }

  syncPreviewScroll(){
    if(!this.state.scrollMap) return
    const { $editor, $preview } = this.state
    const lineHeight = parseFloat(getComputedStyle($editor).lineHeight)

    const lineNo = Math.floor($editor.scrollTop / lineHeight)
    const posTo = this.state.scrollMap[lineNo]
    $preview.scrollTop = posTo
  }

  buildScrollMap(){
    const { $editor, $preview } = this.state

    const textareaStyle = getComputedStyle($editor)
    const sourceLikeDiv = document.createElement('div')
    sourceLikeDiv.style.cssText = `
      position:absolute;
      visibility:hidden;
      height:auto;
      width:${$editor.clientWidth}px;
      font-size:${textareaStyle.fontSize};
      font-family:${textareaStyle.fontFamily};
      line-height:${textareaStyle.lineHeight};
      white-space:${textareaStyle.whiteSpace};
    `
    document.body.append(sourceLikeDiv)

    const lineHeightMap = []

    let acc = 0
    const textValueArr = $editor.value.split('\n')
    textValueArr.forEach(item => {
      let h, lh

      lineHeightMap.push(acc)

      if(item.length === 0){
        acc++
        return
      }

      sourceLikeDiv.innerText = item
      const sourceLikeDivStyle = getComputedStyle(sourceLikeDiv)
      h = parseFloat(sourceLikeDivStyle.height)
      lh = parseFloat(sourceLikeDivStyle.lineHeight)
      acc += Math.round(h / lh)
    })
    document.body.removeChild(sourceLikeDiv)
    lineHeightMap.push(acc)

    const linesCount = acc
    const _scrollMap = []
    const nonEmptyList = []
    const offset = -$preview.offsetTop - 65

    for(let i = 0; i < linesCount; i++){
      _scrollMap.push(-1)
    }

    nonEmptyList.push(0)
    _scrollMap[0] = 0

    const $line = $preview.getElementsByClassName('line')
    for(let n = 0; n < $line.length; n++){
      const $el = $line[n]
      let t = $el.dataset.line
      if(t === '') return
      t = lineHeightMap[t]
      if(t !== 0) nonEmptyList.push(t)
      _scrollMap[t] = Math.round($el.offsetTop + offset)
    }

    nonEmptyList.push(linesCount)
    _scrollMap[linesCount] = $preview.scrollHeight

    let pos = 0
    for(let j = 1; j < linesCount; j++){
      if(_scrollMap[j] !== -1){
        pos++
        continue
      }

      const a = nonEmptyList[pos]
      const b = nonEmptyList[pos + 1]
      _scrollMap[j] = Math.round((_scrollMap[b] * (j - a) + _scrollMap[a] * (b - j)) / (b - a))
    }

    return _scrollMap
  }

  handleClearNote(){
    this.setState({
      showPreviewer: false,
      activeNoteInfo: {},
      previewerTitle: '',
      categoryNoteList: [],
    })
  }

  handleGetNote(){
    this.editorRef.current.setState({ contentLoading: true, showEditor: false })
    this.setState({ showPreviewer: false })

    const data = {
      category_id: parseInt(this.props.match.params.categoryId)
    }

    getCategoryNote(data).then(res => {
      const notes = res.data.category_note_list
      const noteId = parseInt(this.props.match.params.noteId)
      const noteIndex = notes.findIndex(item => item.note_id === noteId)
      this.setState({
        categoryNoteList: notes,
        activeNoteInfo: notes[noteIndex],
        previewerTitle: notes[noteIndex] && notes[noteIndex].note_title,
      })
      
      if(!notes[noteIndex]){
        message.error('记录不存在')
        this.editorRef.current.setState({ contentLoading: false })
      }
    }).catch(() => {
      this.handleClearNote()
      this.editorRef.current.setState({ contentLoading: false })
    })
  }

  componentDidUpdate(prevProps){
    if(prevProps.match.params.noteId !== this.props.match.params.noteId || prevProps.match.params.categoryId !== this.props.match.params.categoryId){
      this.handleGetNote()
    }
  }

  async componentDidMount(){
    await this.handleInitMarkdown()
    this.handleGetNote()
  }

  render(){
    const { 
      activeNoteInfo, 
      previewerTitle, 
      previewerContent, 
      showPreviewer, 
      syncScrollStatus,
      categoryNoteList
    } = this.state

    return (
      <PreviewWrapper>
        <Editor 
          wrappedComponentRef={this.editorRef}
          isPreviewMode={true}
          categoryNoteList={categoryNoteList}
          activeNoteInfo={activeNoteInfo}
          handleSyncContent={this.handleSyncContent}
          handleSyncTitle={this.handleSyncTitle}
        ></Editor>
        {
          showPreviewer ?
          <Previewer ref={this.previewerRef}>
            <TitleWrapper>{previewerTitle}</TitleWrapper>
            <SyncScrollToggle>
              <span>同步滚动：</span>
              <Switch onChange={this.handleToggleSyncScroll} checked={syncScrollStatus}></Switch>
            </SyncScrollToggle>
            <ContentWrapper dangerouslySetInnerHTML={previewerContent}></ContentWrapper>
          </Previewer> : null
        }
      </PreviewWrapper>
    )
  }
}

export default withRouter(Preview)
