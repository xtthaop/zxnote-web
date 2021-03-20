import React from 'react'
import SvgIcon from '@/components/SvgIcon'
import Dropdown from '@/components/Dropdown'
import Menu from '@/components/Menu'
import Dialog from '@/components/Dialog'
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
      dialogVisible: false,
    }
    this.handleCateItemClick = this.handleCateItemClick.bind(this)
    this.handleClose = this.handleClose.bind(this)
    this.handleOpen = this.handleOpen.bind(this)
  }

  handleCateItemClick(id) {
    this.setState({
      activeId: id
    })
  }

  handleClose(){
    this.setState({
      dialogVisible: false,
    })
  }

  handleOpen(){
    this.setState({
      dialogVisible: true,
    })
  }

  render(){
    const { dialogVisible, categories, activeId } = this.state

    const menu = (
      <Menu>
        <Menu.Item>edit</Menu.Item>
        <Menu.Item>del</Menu.Item>
      </Menu>
    )

    const dialogFooter = (
      <div onClick={this.handleClose}>取 消</div>
    )

    return (
      <SidebarWrapper>
        <Header>知行笔记</Header>
        <CreateButton onClick={this.handleOpen}>
          <span>
            <SvgIcon iconClass="plus"></SvgIcon>
            <span>新建分类</span>
          </span>
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
                  <div className="title">{item.title}</div>
                  <div className="handle-btn">
                    <Dropdown overlay={menu}>
                      <SvgIcon iconClass="setting"></SvgIcon>
                    </Dropdown>
                  </div>
                </li>
              )
            })
          }
        </Categories>
        <Foot>
          <div className="icon">U</div>
          <span className="username">user</span>
        </Foot>

        <Dialog visible={dialogVisible} title="新建分类" footer={dialogFooter}>
          <span>新建分类</span>
        </Dialog>
      </SidebarWrapper>
    )
  }

  componentDidMount(){
    const categories = [
      {
        id: 1,
        title: 'cate9',
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
