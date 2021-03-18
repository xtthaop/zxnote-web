import React from 'react'
import SvgIcon from '@/components/SvgIcon'
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
      activeId: 1,
    }
    this.handleNoteItemClick = this.handleNoteItemClick.bind(this)
  }

  handleNoteItemClick(id) {
    this.setState({
      activeId: id
    })
  }

  render(){
    const { noteList, activeId } = this.state
    return (
      <NotelistWrapper>
        <UpCreateBtn>+ new</UpCreateBtn>
        <Notes>
          {
            noteList.map(item => {
              return (
                <li 
                  key={item.id} 
                  className={activeId === item.id ? 'active' : ''}
                  onClick={this.handleNoteItemClick.bind(this, item.id)}
                >
                  <div className="noteinfo">
                    <div className="title">{item.title}</div>
                    <div className="update-time">{item.update_time}</div>
                  </div>
                  <div className="handle-btn">
                    <SvgIcon iconClass="setting"></SvgIcon>
                  </div>
                </li>
              )
            })
          }
        </Notes>
      </NotelistWrapper>
    )
  }

  componentDidMount(){
    const noteList = [
      {
        id: 1,
        title: 'note13',
        update_time: '2020/08/01',
      },
      {
        id: 2,
        title: 'note2',
        update_time: '2020/08/02',
      },
      {
        id: 3,
        title: 'note3',
        update_time: '2020/08/03',
      },
    ]
    this.setState({
      noteList,
    })
  }
}

export default Notelist