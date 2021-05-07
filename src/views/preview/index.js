import React from 'react'
import { withRouter } from 'react-router-dom'
import { Editor } from '../notebook/components/index'
import { getCategoryNote } from '@/api/notebook/note'
import 'highlight.js/styles/atom-one-dark.css';
import {
  PreviewWrapper,
  Previewer,
  TitleWrapper,
  ContentWrapper,
} from './style'

class Preview extends React.Component {
  constructor(props){
    super(props)
    this.state = {
      showPreviewer: false,
      activeNoteInfo: {},
      previewerTitle: undefined,
      previewerContent: undefined,
    }
    this.handleInitMarkdown()
    this.editorRef = React.createRef()
    this.handleSyncTitle = this.handleSyncTitle.bind(this)
    this.handleSyncContent = this.handleSyncContent.bind(this)
    this.handleGetNote = this.handleGetNote.bind(this)
    this.handleClearNote = this.handleClearNote.bind(this)
  }

  handleInitMarkdown(){
    // Apply syntax highlighting to fenced code blocks with the highlight option:
    const hljs = require('highlight.js') // https://highlightjs.org/

    this.md = require('markdown-it')({
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
    this.md.renderer.rules.image = function(tokens, idx, options, env, self){
      const token = tokens[idx]

      token.attrs[token.attrIndex('alt')][1] = self.renderInlineAsText(token.children, options, env)

      return `<div class="image-package">
                <img 
                  src="${token.attrs[token.attrIndex('src')][1]}" 
                  alt="${token.attrs[token.attrIndex('alt')][1]}"
                  title="${token.attrs[token.attrIndex('title')][1]}"
                />
             </div>`
    }
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
        previewerContent: { __html: this.md.render(content) },
      })
    }
  }

  handleClearNote(){
    this.setState({
      showPreviewer: false,
      activeNoteInfo: {},
      previewerTitle: '',
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
      const noteId = parseInt(this.props.match.params.noteId) ? parseInt(this.props.match.params.noteId) : this.props.match.params.noteId
      const noteIndex = notes.findIndex(item => item.note_id === noteId)
      this.setState({
        activeNoteInfo: notes[noteIndex] ? notes[noteIndex] : { note_id: noteId },
        previewerTitle: notes[noteIndex] && notes[noteIndex].note_title,
      })
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

  componentDidMount(){
    this.handleGetNote()
  }

  render(){
    const { activeNoteInfo, previewerTitle, previewerContent, showPreviewer } = this.state
    return (
      <PreviewWrapper>
        <Editor 
          wrappedComponentRef={this.editorRef}
          isPreviewMode={true}
          activeNoteInfo={activeNoteInfo}
          handleSyncContent={this.handleSyncContent}
          handleSyncTitle={this.handleSyncTitle}
        ></Editor>
        {
          showPreviewer ?
          <Previewer>
            <TitleWrapper>{previewerTitle}</TitleWrapper>
            <ContentWrapper dangerouslySetInnerHTML={previewerContent}></ContentWrapper>
          </Previewer> : null
        }
      </PreviewWrapper>
    )
  }
}

export default withRouter(Preview)
