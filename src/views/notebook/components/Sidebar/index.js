import React from 'react'
import {
  SidebarWrapper,
  Header,
  CreateButton,
  Categories,
  Foot,
} from './style'

class Sidebar extends React.Component {
  constructor(props){
    super(props)
    this.state = {
      categories: [],
      activeId: 1,
    }
    this.handleCateItemClick = this.handleCateItemClick.bind(this)
  }

  handleCateItemClick(id) {
    this.setState({
      activeId: id
    })
  }

  render(){
    const { categories, activeId } = this.state
    return (
      <SidebarWrapper>
        <Header>Title</Header>
        <CreateButton>
          <span>+ new</span>
        </CreateButton>
        <Categories>
          {
            categories.map(item => {
              return (
                <li 
                  key={item.id} 
                  className={activeId === item.id ? 'active' : ''}
                  onClick={this.handleCateItemClick.bind(this, item.id)}
                >
                  <span>{item.title}</span>
                  <span className="handle-btn">
                    <span>edit</span>
                    <span>del</span>
                  </span>
                </li>
              )
            })
          }
        </Categories>
        <Foot>
          <div className="icon">U</div>
          <span className="username">user</span>
        </Foot>
      </SidebarWrapper>
    )
  }

  componentDidMount(){
    const categories = [
      {
        id: 1,
        title: 'cate1',
      },
      {
        id: 2,
        title: 'cate2',
      },
      {
        id: 3,
        title: 'cate3',
      },
    ]
    this.setState({
      categories
    })
  }
}

export default Sidebar
