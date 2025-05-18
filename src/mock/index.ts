import Mock from 'mockjs'
import { userMock } from './user'

// 设置延迟时间
Mock.setup({
  timeout: '200-600'
})

// 注册所有mock
const mocks = [
  ...userMock
]

// 注册mock
mocks.forEach(route => {
  Mock.mock(new RegExp(route.url), route.type || 'get', route.response)
})

export default Mock 