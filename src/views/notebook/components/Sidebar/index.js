import React from 'react'
import {
  SidebarWrapper,
  Header,
  CreateButton,
  Categories,
} from './style'

class Sidebar extends React.Component {
  constructor(props){
    super(props)
    this.state = {
      categories: [],
    }
  }

  render(){
    const { categories } = this.state
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
                <li key={item.id}>{ item.title }</li>
              )
            })
          }
        </Categories>
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
