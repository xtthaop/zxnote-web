import React from 'react'
import { withRouter } from 'react-router-dom'
import moment from 'moment'
import { createNote, getCategoryNote, deleteNote, moveNote } from '@/api/notebook/note'
import SvgIcon from '@/components/SvgIcon'
import Dropdown from '@/components/Dropdown'
import Menu from '@/components/Menu'
import Loading from '@/components/Loading'
import Dialog from '@/components/Dialog'
import Select from '@/components/Select'
import Button from '@/components/Button'
import { message } from '@/components/message'
import { messagebox } from '@/components/messagebox'
import {
  NotelistWrapper,
  UpCreateBtn,
  Notes,
} from './style'

const { Option } = Select

class Notelist extends React.Component {
  constructor(props){
    super(props)
    this.state = {
      noteList: [],
      activeCategoryId: undefined,
      activeNoteId: undefined,
      activeNoteIndex: undefined,
      listLoading: false,
      dialogVisible: false,
      moveCategoryId: undefined,
      confirmLoading: false,
    }
    this.handleNoteItemClick = this.handleNoteItemClick.bind(this)
    this.handleCreateNote = this.handleCreateNote.bind(this)
    this.handleGetCategoryNote = this.handleGetCategoryNote.bind(this)
    this.handleSelectChange = this.handleSelectChange.bind(this)
    this.handleClose = this.handleClose.bind(this)
    this.handleSubmitForm = this.handleSubmitForm.bind(this)
    this.handleMoveNote = this.handleMoveNote.bind(this)
  }

  handleNoteItemClick(id, index){
    if(this.state.activeNoteId !== id){
      this.setState({
        activeNoteId: id,
        activeNoteIndex: index,
      })

      const activeTitle = this.state.noteList[index].note_title
      this.props.active(id, activeTitle)
      this.props.history.push(`/category/${this.state.activeCategoryId}/note/${id}`)
    }
  }

  handleCreateNote(){
    const currentDate = moment().format('YYYY-MM-DD')
    let data = {
      note_title: currentDate,
      category_id: this.state.activeCategoryId
    }

    createNote(data).then(res => {
      const noteData = this.state.noteList
      const activeId = res.data.note_id

      noteData.unshift({
        note_id: activeId,
        note_title: currentDate,
        create_time: currentDate,
      })

      const activeIndex = 0
      this.setState({ 
        notelist: noteData,
        activeNoteId: activeId,
        activeNoteIndex: activeIndex
      })

      const activeTitle = currentDate
      this.props.active(activeId, activeTitle, true)
      this.props.history.push(`/category/${this.state.activeCategoryId}/note/${activeId}`)
    })
  }

  handleDelete(index){
    messagebox.warning('提示', '确认删除笔记？').then(() => {
      const data = { note_id: this.state.activeNoteId }
      deleteNote(data).then(() => {
        let noteList = this.state.noteList
        noteList.splice(index, 1)

        const activeIndex = 0
        const activeId = noteList[activeIndex] && noteList[activeIndex].note_id
        const activeTitle = noteList[activeIndex] && noteList[activeIndex].note_title

        this.setState({ noteList, activeNoteId: activeId, activeNoteIndex: activeIndex })
        this.props.active(activeId, activeTitle)
        message.success('删除成功！')
        if(!!activeId){
          this.props.history.push(`/category/${this.state.activeCategoryId}/note/${activeId}`)
        }else{
          this.props.history.push(`/category/${this.state.activeCategoryId}`)
        }
      })
    }).catch(() => {})
  }

  handleMoveNote(){
    this.setState({
      dialogVisible: true,
      moveCategoryId: undefined,
      confirmLoading: false,
    })
  }

  handleClose(){
    this.setState({ dialogVisible: false })
  }

  changeActiveNoteTitle(title){
    const { noteList, activeNoteIndex } = this.state
    noteList[activeNoteIndex].note_title = title
    this.setState({ noteList })
  }

  handleSubmitForm(){
    const { moveCategoryId, activeNoteId, activeNoteIndex } = this.state

    if(!moveCategoryId || moveCategoryId === this.state.activeCategoryId){
      this.handleClose()
      return
    }

    const data = {
      category_id: moveCategoryId,
      note_id: activeNoteId,
    }

    this.setState({ confirmLoading: true })
    moveNote(data).then(() => {
      const noteList = this.state.noteList
      noteList.splice(activeNoteIndex, 1)

      const activeIndex = 0
      const activeId = noteList[activeIndex] && noteList[activeIndex].note_id
      const activeTitle = noteList[activeIndex] && noteList[activeIndex].note_title

      this.setState({ 
        confirmLoading: false,
        dialogVisible: false,
        noteList,
        activeNoteId: activeId,
        activeNoteIndex: activeIndex,
      })
      this.props.active(activeId, activeTitle)
      if(!!activeId){
        this.props.history.push(`/category/${this.state.activeCategoryId}/note/${activeId}`)
      }else{
        this.props.history.push(`/category/${this.state.activeCategoryId}`)
      }
    }).catch(() => {
      this.setState({ confirmLoading: false })
    })
  }

  handleSelectChange(val){
    this.setState({ moveCategoryId: val })
  }

  handleGetCategoryNote(){
    const categoryId = this.state.activeCategoryId
    const data = { category_id: categoryId }
    let activeNoteIndex, activeNoteId

    this.setState({ listLoading: true, noteList: [] })
    getCategoryNote(data).then(res => {
      const noteList = res.data.category_note_list

      if(this.props.match.params.noteId){
        activeNoteId = parseInt(this.props.match.params.noteId) ? parseInt(this.props.match.params.noteId) : this.props.match.params.noteId
        activeNoteIndex = noteList.findIndex(item => item.note_id === activeNoteId)
      }else{
        activeNoteIndex = 0
        activeNoteId = noteList[activeNoteIndex] && noteList[activeNoteIndex].note_id
      }

      const activeTitle = noteList[activeNoteIndex] && noteList[activeNoteIndex].note_title
      this.setState({ noteList, listLoading: false, activeNoteId, activeNoteIndex })
      this.props.active(activeNoteId, activeTitle)
      if(!!activeNoteId){
        this.props.history.push(`/category/${categoryId}/note/${activeNoteId}`)
      }
    }).catch(() => {
      this.setState({ listLoading: false })
      this.props.active()
    })
  }

  componentDidUpdate(prevProps){
    if(this.props.match.params.categoryId !== this.state.activeCategoryId){
      this.setState({ activeCategoryId: this.props.match.params.categoryId }, () => {
        if(this.state.activeCategoryId){
          this.handleGetCategoryNote()
        }else{
          this.setState({ listLoading: false, noteList: [] })
          this.props.active()
        }
      })
      return
    }

    if(prevProps.match.params.noteId !== this.props.match.params.noteId && this.props.match.params.noteId !== this.state.activeNoteId.toString()){
      if(this.props.match.params.noteId){
        const activeNoteId = parseInt(this.props.match.params.noteId) ? parseInt(this.props.match.params.noteId) : this.props.match.params.noteId
        const activeNoteIndex = this.state.noteList.findIndex(item => item.note_id === activeNoteId)
        this.setState({ activeNoteId, activeNoteIndex })
        const activeNoteTitle = this.state.noteList[activeNoteIndex] && this.state.noteList[activeNoteIndex].note_title
        this.props.active(activeNoteId, activeNoteTitle)
      }else{
        this.handleGetCategoryNote()
      }
    }
  }

  render(){
    const { noteList, activeNoteId, listLoading, dialogVisible, moveCategoryId, confirmLoading } = this.state

    const menu = (item, index) => (
      <Menu>
        <Menu.Item onClick={this.handleMoveNote}>
          <SvgIcon iconClass="folder" style={{ marginRight: '5px' }}></SvgIcon>
          <span>移动笔记</span>
        </Menu.Item>
        <Menu.Item onClick={() => this.handleDelete(index)}>
          <SvgIcon iconClass="delete" style={{ marginRight: '5px' }}></SvgIcon>
          <span>删除笔记</span>
        </Menu.Item>
      </Menu>
    )

    const dialogFooter = (
      <div>
        <Button onClick={this.handleClose} style={{ marginRight: '10px' }}>取 消</Button>
        <Button type="success" onClick={this.handleSubmitForm} data-loading={confirmLoading}>确 定</Button>
      </div>
    )

    return (
      <NotelistWrapper>
        <UpCreateBtn onClick={this.handleCreateNote}>
          <span>
            <SvgIcon iconClass="plus"></SvgIcon>
            <span>新建笔记</span>
          </span>
        </UpCreateBtn>
        <Notes>
          <Loading data-loading={listLoading}></Loading>
          {
            noteList.map((item, index) => {
              return (
                <li 
                  key={item.note_id} 
                  className={activeNoteId == item.note_id ? 'active' : ''}
                  onClick={this.handleNoteItemClick.bind(this, item.note_id, index)}
                >
                  <div className="noteinfo">
                    <div className="title">{item.note_title}</div>
                    <div className="update-time">{moment(item.update_time).format('YYYY-MM-DD')}</div>
                  </div>
                  <div className="handle-btn">
                    <Dropdown overlay={menu(item, index)}>
                      <SvgIcon iconClass="setting"></SvgIcon>
                    </Dropdown>
                  </div>
                </li>
              )
            })
          }
        </Notes>

        <Dialog visible={dialogVisible} title="移动文章" footer={dialogFooter}>
          <Select placeholder="请选择分类" value={moveCategoryId} change={this.handleSelectChange}>
            {
              this.props.categoryList.map(item => (
                <Option key={item.category_id} value={item.category_id}>{item.category_name}</Option>
              ))
            }
          </Select>
        </Dialog>
      </NotelistWrapper>
    )
  }
}

export default withRouter(Notelist)
