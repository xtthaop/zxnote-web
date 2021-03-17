import React from 'react'
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
    }
  }

  render(){
    const { noteList } = this.state
    return (
      <NotelistWrapper>
        <UpCreateBtn>+ new</UpCreateBtn>
        <Notes>
          {
            noteList.map(item => {
              return (
                <li key={item.id}>
                  <div className="title">{item.title}</div>
                  <div className="update-time">{item.update_time}</div>
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
        title: 'note1',
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