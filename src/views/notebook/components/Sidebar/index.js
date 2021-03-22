import React from 'react'
import SvgIcon from '@/components/SvgIcon'
import Dropdown from '@/components/Dropdown'
import Menu from '@/components/Menu'
import Dialog from '@/components/Dialog'
import Button from '@/components/Button'
import Input from '@/components/Input'
import { message } from '@/components/message'
import { createCategory, getCategoryList, deleteCategory, updateCategory } from '@/api/notebook/category'
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
      categoryForm: {
        category_name: '',
        category_id: undefined,
      },
      dialogTitle: 'create',
    }
    this.handleItemClick = this.handleItemClick.bind(this)
    this.handleClose = this.handleClose.bind(this)
    this.handleValueChange = this.handleValueChange.bind(this)
    this.handleCreateCategory = this.handleCreateCategory.bind(this)
    this.handleDelete = this.handleDelete.bind(this)
    this.reset = this.reset.bind(this)
    this.handleSubmitForm = this.handleSubmitForm.bind(this)
  }

  handleItemClick(id) {
    this.setState({
      activeId: id
    })
  }

  handleClose(){
    this.setState({
      dialogVisible: false,
    })
  }

  handleValueChange(val){
    this.setState({
      categoryForm: Object.assign({}, this.state.categoryForm, { category_name: val })
    })
  }

  reset(){
    this.setState({
      categoryForm: {
        category_name: '',
        category_id: undefined,
      }
    })
  }

  handleCreateCategory(){
    this.reset()
    this.setState({
      dialogVisible: true,
      dialogTitle: '新建分类',
    })
  }

  handleGetCategoryList(){
    return getCategoryList().then(res => {
      const categories = res.data.category_list
      this.setState({ categories })
    })
  }

  handleDelete(){
    const data = { category_id: this.state.activeId }
    deleteCategory(data).then(() => {
      this.handleGetCategoryList().then(() => {
        const activeId = this.state.categories[0] && this.state.categories[0].category_id
        this.setState({ activeId })
      })
      message.success('删除成功！')
    })
  }

  handleUpdateCategory(item){
    this.reset()
    this.setState({
      categoryForm: {
        category_id: item.category_id,
        category_name: item.category_name,
      },
      dialogVisible: true,
      dialogTitle: '编辑分类',
    })
  }

  handleSubmitForm(){
    const { category_name, category_id } = this.state.categoryForm

    if(!category_name){
      this.handleClose()
      return
    }

    if(category_id){
      updateCategory(this.state.categoryForm).then(() => {
        this.handleGetCategoryList()
        this.handleClose()
      })
    }else{
      createCategory(this.state.categoryForm).then(res => {
        const activeId = res.data.category_id
        this.handleGetCategoryList().then(() => {
          this.setState({ activeId })
        })
        this.handleClose()
      })
    }
  }

  render(){
    const { dialogVisible, categories, activeId, categoryForm, dialogTitle } = this.state

    const menu = (item) => {
      return (
        <Menu>
          <Menu.Item onClick={() => this.handleUpdateCategory(item)}>
            <SvgIcon iconClass="edit" style={{ marginRight: '5px' }}></SvgIcon>
            <span>编辑分类</span>
          </Menu.Item>
          <Menu.Item onClick={this.handleDelete}>
            <SvgIcon iconClass="delete" style={{ marginRight: '5px' }}></SvgIcon>
            <span>删除分类</span>
          </Menu.Item>
        </Menu>
      )
    }

    const dialogFooter = (
      <div>
        <Button onClick={this.handleClose} style={{ marginRight: '10px' }}>取 消</Button>
        <Button type="success" onClick={this.handleSubmitForm}>确 定</Button>
      </div>
    )

    return (
      <SidebarWrapper>
        <Header>知行笔记</Header>
        <CreateButton onClick={this.handleCreateCategory}>
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
                  key={item.category_id} 
                  className={activeId === item.category_id ? 'active' : ''}
                  onClick={() => this.handleItemClick(item.category_id)}
                >
                  <div className="title">{item.category_name}</div>
                  <div className="handle-btn">
                    <Dropdown overlay={menu(item)}>
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

        <Dialog visible={dialogVisible} title={dialogTitle} footer={dialogFooter}>
          <Input onChange={this.handleValueChange} value={categoryForm.category_name} placeholder="请输入新分类名"></Input>
        </Dialog>
      </SidebarWrapper>
    )
  }

  componentDidMount(){
    this.handleGetCategoryList().then(() => {
      const activeId = this.state.categories[0].category_id
      this.setState({ activeId })
    })
  }
}

export default Sidebar
