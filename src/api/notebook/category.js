import request from '@/utils/request'

// 新增分类
export function addCategory(data) {
  return request({
    url: '/restful/category',
    method: 'post',
    data,
  })
}

// 获取分类列表
export function getCategoryList() {
  return request({
    url: '/restful/category',
    method: 'get',
  })
}

// 删除分类
export function deleteCategory(data) {
  return request({
    url: '/restful/category',
    method: 'delete',
    data,
  })
}

// 编辑分类
export function updateCategory(data) {
  return request({
    url: '/restful/category',
    method: 'put',
    data,
  })
}
