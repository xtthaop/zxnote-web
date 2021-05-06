import React from 'react'
import { withRouter } from 'react-router-dom'
import { Editor } from '../notebook/components/index'
import { getCategoryList } from '@/api/notebook/category'
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
      activeNoteId: undefined,
      activeNoteTitle: undefined,
      previewerTitle: undefined,
      previewerContent: undefined,
    }
    this.handleInitMarkdown()
    this.handleSyncTitle = this.handleSyncTitle.bind(this)
    this.handleSyncContent = this.handleSyncContent.bind(this)
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
    this.setState({ previewerContent: { __html: this.md.render(content) } })
  }

  componentDidMount(){
    getCategoryList().then(res => {
      const categories = res.data.category_list
      const categoryIndex = categories.findIndex(item => item.category_id.toString() === this.props.match.params.categoryId)
      if(categoryIndex >= 0){
        const data = {
          category_id: parseInt(this.props.match.params.categoryId)
        }
        getCategoryNote(data).then(res => {
          const notes = res.data.category_note_list
          const noteIndex = notes.findIndex(item => item.note_id.toString() === this.props.match.params.noteId)
          if(noteIndex >= 0){
            this.setState({
              activeNoteId: parseInt(this.props.match.params.noteId),
              activeNoteTitle: notes[noteIndex].note_title,
              previewerTitle: notes[noteIndex].note_title,
            })
          }
        })
      }
    }).catch(() => {
      this.setState({
        activeNoteId: undefined,
        activeNoteTitle: undefined,
      })
    })
  }

  render(){
    const { activeNoteId, activeNoteTitle, previewerTitle, previewerContent } = this.state
    return (
      <PreviewWrapper>
        <Editor 
          isPreviewMode={true}
          activeNoteId={activeNoteId} 
          activeNoteTitle={activeNoteTitle}
          handleSyncContent={this.handleSyncContent}
          handleSyncTitle={this.handleSyncTitle}
        ></Editor>
        <Previewer>
          <TitleWrapper>{previewerTitle}</TitleWrapper>
          <ContentWrapper dangerouslySetInnerHTML={previewerContent}></ContentWrapper>
        </Previewer>
      </PreviewWrapper>
    )
  }
}

export default withRouter(Preview)
