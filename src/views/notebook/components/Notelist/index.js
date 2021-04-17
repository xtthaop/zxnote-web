import React from 'react'
import moment from 'moment'
import { createNote, getCategoryNote, deleteNote } from '@/api/notebook/note'
import SvgIcon from '@/components/SvgIcon'
import Dropdown from '@/components/Dropdown'
import Menu from '@/components/Menu'
import Loading from '@/components/Loading'
import { message } from '@/components/message'
import { messagebox } from '@/components/messagebox'
import {
  NotelistWrapper,
  UpCreateBtn,
  Notes,
} from './style'

class Notelist extends React.Component {
  constructor(props){
    super(props)
    this.state = {
      noteList: [],
      activeId: 0,
      listLoading: false,
    }
    this.handleNoteItemClick = this.handleNoteItemClick.bind(this)
    this.handleCreateNote = this.handleCreateNote.bind(this)
    this.handleGetCategoryNote = this.handleGetCategoryNote.bind(this)
  }

  handleNoteItemClick(id) {
    this.setState({
      activeId: id
    })
  }

  handleCreateNote(){
    let data = {
      note_title: moment().format('YYYY-MM-DD'),
      category_id: this.props.activeCategoryId
    }

    createNote(data).then(res => {
      console.log(res)
    })
  }

  handleGetCategoryNote(){
    const data = {
      category_id: this.props.activeCategoryId
    }

    this.setState({ listLoading: true })
    return getCategoryNote(data).then(res => {
      this.setState({
        noteList: res.data.category_note_list,
        listLoading: false,
      })
    }).catch(() => {
      this.setState({ listLoading: false })
    })
  }

  handleDelete(index){
    messagebox.warning('提示', '确认删除笔记？').then(() => {
      const data = { note_id: this.state.activeId }
      deleteNote(data).then(() => {
        let noteList = this.state.noteList
        noteList.splice(index, 1)
        const activeId = noteList[0] && noteList[0].category_id
        this.setState({ noteList, activeId })
        message.success('删除成功！')
      })
    }).catch(() => {})
  }

  componentDidUpdate(prevProp){
    if(prevProp.activeCategoryId !== this.props.activeCategoryId){
      if(!this.props.activeCategoryId){
        this.setState({ noteList: [] })
        return
      }
      
      this.handleGetCategoryNote().then(() => {
        const activeId = this.state.noteList[0] && this.state.noteList[0].note_id
        this.setState({ activeId })
      })
    }
  }

  render(){
    const { noteList, activeId, listLoading } = this.state

    const menu = (item, index) => (
      <Menu>
        <Menu.Item>move</Menu.Item>
        <Menu.Item>history</Menu.Item>
        <Menu.Item onClick={() => this.handleDelete(index)}>
          <SvgIcon iconClass="delete" style={{ marginRight: '5px' }}></SvgIcon>
          <span>删除分类</span>
        </Menu.Item>
      </Menu>
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
                  onClick={this.handleNoteItemClick.bind(this, item.note_id)}
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
      </NotelistWrapper>
    )
  }
}

export default Notelist