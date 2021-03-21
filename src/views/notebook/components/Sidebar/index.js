import React from 'react'
import SvgIcon from '@/components/SvgIcon'
import Dropdown from '@/components/Dropdown'
import Menu from '@/components/Menu'
import Dialog from '@/components/Dialog'
import Button from '@/components/Button'
import Input from '@/components/Input'
import { getCategoryList } from '@/api/notebook/category'
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
      categoryName: '',
    }
    this.handleCateItemClick = this.handleCateItemClick.bind(this)
    this.handleClose = this.handleClose.bind(this)
    this.handleOpen = this.handleOpen.bind(this)
    this.handleValueChange = this.handleValueChange.bind(this)
    this.handleCreateCategory = this.handleCreateCategory.bind(this)
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

  handleValueChange(val){
    this.setState({
      categoryName: val
    })
  }

  handleCreateCategory(){
    const { categoryName } = this.state

    if(!categoryName){
      this.handleClose()
      return
    }

    const data = {
      category_name: categoryName
    }

    getCategoryList(data).then(res => {
      this.handleClose()
    })
  }

  render(){
    const { dialogVisible, categories, activeId, categoryName } = this.state

    const menu = (
      <Menu>
        <Menu.Item>edit</Menu.Item>
        <Menu.Item>del</Menu.Item>
      </Menu>
    )

    const dialogFooter = (
      <div>
        <Button onClick={this.handleClose} style={{ marginRight: '10px' }}>取 消</Button>
        <Button type="success" onClick={this.handleCreateCategory}>确 定</Button>
      </div>
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
          <Input onChange={this.handleValueChange} value={categoryName} placeholder="请输入新分类名"></Input>
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
