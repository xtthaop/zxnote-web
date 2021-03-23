import React from 'react'
import SvgIcon from '@/components/SvgIcon'
import Dropdown from '@/components/Dropdown'
import Menu from '@/components/Menu'
import Dialog from '@/components/Dialog'
import Button from '@/components/Button'
import Input from '@/components/Input'
import Loading from '@/components/Loading'
import { message } from '@/components/message'
import { messagebox } from '@/components/messagebox'
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
      dialogTitle: '',
      confirmLoading: false,
      listLoading: false,
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
    this.setState({ listLoading: true })
    return getCategoryList().then(res => {
      this.setState({ listLoading: false })
      const categories = res.data.category_list
      this.setState({ categories })
    })
  }

  handleDelete(index){
    messagebox.warning('提示', '即将删除分类及分类下所有笔记，是否继续？').then(() => {
      const data = { category_id: this.state.activeId }
      deleteCategory(data).then(() => {
        let categories = this.state.categories
        categories.splice(index, 1)
        const activeId = categories[0] && categories[0].category_id
        this.setState({ categories, activeId })
        message.success('删除成功！')
      })
    }).catch(() => {})
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

    this.setState({ confirmLoading: true })

    if(category_id){
      updateCategory(this.state.categoryForm).then(() => {
        this.handleGetCategoryList()
        this.handleClose()
      })
    }else{
      createCategory(this.state.categoryForm).then(res => {
        const activeId = res.data.category_id
        const categories = this.state.categories
        categories.push({ category_id: activeId, category_name: category_name })
        this.setState({ activeId, categories, confirmLoading: false })
        this.handleClose()
      })
    }
  }

  render(){
    const { dialogVisible, categories, activeId, categoryForm, dialogTitle, confirmLoading, listLoading } = this.state

    const menu = (item, index) => {
      return (
        <Menu>
          <Menu.Item onClick={() => this.handleUpdateCategory(item)}>
            <SvgIcon iconClass="edit" style={{ marginRight: '5px' }}></SvgIcon>
            <span>编辑分类</span>
          </Menu.Item>
          <Menu.Item onClick={() => this.handleDelete(index)}>
            <SvgIcon iconClass="delete" style={{ marginRight: '5px' }}></SvgIcon>
            <span>删除分类</span>
          </Menu.Item>
        </Menu>
      )
    }

    const dialogFooter = (
      <div>
        <Button onClick={this.handleClose} style={{ marginRight: '10px' }}>取 消</Button>
        <Button type="success" onClick={this.handleSubmitForm} data-loading={confirmLoading}>确 定</Button>
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
          <Loading data-loading={listLoading}></Loading>
          {
            categories.map((item, index) => {
              return (
                <li 
                  key={item.category_id} 
                  className={activeId === item.category_id ? 'active' : ''}
                  onClick={() => this.handleItemClick(item.category_id)}
                >
                  <div className="title">{item.category_name}</div>
                  <div className="handle-btn">
                    <Dropdown overlay={menu(item, index)}>
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
      const activeId = this.state.categories[0] && this.state.categories[0].category_id
      this.setState({ activeId })
    })
  }
}

export default Sidebar
