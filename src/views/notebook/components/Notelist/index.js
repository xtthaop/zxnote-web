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
      activeId: undefined,
      activeIndex: undefined,
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
    this.handleHashChange = this.handleHashChange.bind(this)
  }

  handleNoteItemClick(id, index) {
    this.setState({
      activeId: id,
      activeIndex: index,
    })
    const activeId = id
    const activeTitle = this.state.noteList[index].note_title
    this.props.active(activeId, activeTitle)
  }

  handleCreateNote(){
    const currentDate = moment().format('YYYY-MM-DD')
    let data = {
      note_title: currentDate,
      category_id: this.props.activeCategoryId
    }

    createNote(data).then(res => {
      const noteData = this.state.noteList
      noteData.unshift({
        note_id: res.data.note_id,
        note_title: currentDate,
        create_time: currentDate,
      })
      const activeIndex = 0
      this.setState({ 
        notelist: noteData,
        activeId: res.data.note_id,
        activeIndex
      })
      const activeId = res.data.note_id
      const activeTitle = currentDate
      this.props.active(activeId, activeTitle, true)
    })
  }

  handleDelete(index){
    messagebox.warning('提示', '确认删除笔记？').then(() => {
      const data = { note_id: this.state.activeId }
      deleteNote(data).then(() => {
        let noteList = this.state.noteList
        noteList.splice(index, 1)
        const activeIndex = 0
        const activeId = noteList[activeIndex] && noteList[activeIndex].note_id
        const activeTitle = noteList[activeIndex] && noteList[activeIndex].note_title
        this.setState({ noteList, activeId, activeIndex })
        this.props.active(activeId, activeTitle)
        message.success('删除成功！')
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
    this.setState({
      dialogVisible: false,
    })
  }

  changeActiveNoteTitle(title){
    const { noteList, activeIndex } = this.state
    noteList[activeIndex].note_title = title
    this.setState({ noteList })
  }

  handleSubmitForm(){
    const { moveCategoryId, activeId } = this.state

    if(!moveCategoryId || moveCategoryId === this.props.activeCategoryId){
      this.handleClose()
      return
    }

    const data = {
      category_id: moveCategoryId,
      note_id: activeId,
    }

    this.setState({ confirmLoading: true })
    moveNote(data).then(() => {
      let noteList = this.state.noteList
      noteList.splice(activeIndex, 1)
      const activeIndex = 0
      const activeId = noteList[activeIndex] && noteList[activeIndex].note_id
      const activeTitle = noteList[activeIndex] && noteList[activeIndex].note_title
      this.props.active(activeId, activeTitle)
      this.setState({ 
        confirmLoading: false,
        dialogVisible: false,
        noteList,
        activeId,
        activeIndex,
      })
    }).catch(() => {
      this.setState({ confirmLoading: false })
    })
  }

  handleSelectChange(val){
    this.setState({
      moveCategoryId: val
    })
  }

  getHashNoteId(){
    const hash = location.hash
    const hashArr = hash.split('/')
    return Number(hashArr[4]) ? Number(hashArr[4]) : undefined
  }

  handleHashChange(){
    const hashNoteId = this.getHashNoteId()
    if(hashNoteId === undefined) return
    if(hashNoteId !== this.state.activeId){
      const activeIndex = document.getElementById(`note_${hashNoteId}`) ? Number(document.getElementById(`note_${hashNoteId}`).getAttribute('data-index')) : undefined
      const activeTitle = this.state.noteList[activeIndex] && this.state.noteList[activeIndex].note_title
      this.setState({ activeId: hashNoteId, activeIndex })
      this.props.active(hashNoteId, activeTitle)
    }
  }

  handleGetCategoryNote(){
    const data = { category_id: this.props.activeCategoryId }
    const hashNoteId = this.getHashNoteId()
    let activeId, activeIndex

    this.setState({ listLoading: true, noteList: [] })

    getCategoryNote(data).then(res => {
      const noteList = res.data.category_note_list
      
      if(hashNoteId){
        activeId = hashNoteId
        activeIndex = undefined
      }else{
        activeIndex = 0
        activeId = noteList[activeIndex] && noteList[activeIndex].note_id
      }

      this.setState({ noteList, listLoading: false, activeId }, () => {
        if(activeIndex === undefined){
          activeIndex = document.getElementById(`note_${hashNoteId}`) ? Number(document.getElementById(`note_${hashNoteId}`).getAttribute('data-index')) : undefined
        }
        const activeTitle = noteList[activeIndex] && noteList[activeIndex].note_title
        this.setState({ activeIndex })
        this.props.active(activeId, activeTitle)
        this.props.changeNoteList(noteList)
      })
    }).catch(() => {
      activeId = hashNoteId
      activeIndex = undefined
      this.setState({ listLoading: false, activeId, activeIndex })
      this.props.active(activeId, undefined)
      this.props.changeNoteList([])
    })
  }

  componentDidUpdate(prevProp){
    if(prevProp.activeCategoryId !== this.props.activeCategoryId){
      if(!this.props.activeCategoryId){
        this.setState({ noteList: [], listLoading: false, activeId: undefined, activeIndex: undefined })
        this.props.active(undefined, undefined)
        this.props.changeNoteList([])
      }else{
        this.handleGetCategoryNote()
      }
    }
  }

  componentDidMount(){
    window.addEventListener('hashchange', this.handleHashChange)
  }

  componentWillUnmount(){
    window.removeEventListener('hashchange', this.handleHashChange)
  }

  render(){
    const { noteList, activeId, listLoading, dialogVisible, moveCategoryId, confirmLoading } = this.state

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
                  className={activeId === item.note_id ? 'active' : ''}
                  onClick={this.handleNoteItemClick.bind(this, item.note_id, index)}
                >
                  <div className="noteinfo">
                    <div id={`note_${item.note_id}`} data-index={index} className="title">{item.note_title}</div>
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
