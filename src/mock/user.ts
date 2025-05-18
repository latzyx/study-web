import Mock from 'mockjs'

const Random = Mock.Random

// 生成用户列表数据
const generateUsers = (count: number) => {
  const users = []
  for (let i = 0; i < count; i++) {
    users.push({
      id: Random.id(),
      username: Random.cname(),
      email: Random.email(),
      avatar: Random.image('100x100'),
      createTime: Random.datetime()
    })
  }
  return users
}

// 模拟用户数据
const users = generateUsers(10)

export const userMock = [
  // 登录接口
  {
    url: '/api/users/login',
    type: 'post',
    response: (config: any) => {
      const { username, password } = JSON.parse(config.body)
      if (username === 'admin' && password === '123456') {
        return {
          code: 200,
          data: {
            token: Random.guid(),
            user: {
              id: 1,
              username: 'admin',
              email: 'admin@example.com'
            }
          },
          message: '登录成功'
        }
      }
      return {
        code: 401,
        data: null,
        message: '用户名或密码错误'
      }
    }
  },

  // 获取当前用户信息
  {
    url: '/api/users/me',
    type: 'get',
    response: () => {
      return {
        code: 200,
        data: {
          id: 1,
          username: 'admin',
          email: 'admin@example.com',
          avatar: Random.image('100x100'),
          roles: ['admin']
        },
        message: '获取成功'
      }
    }
  },

  // 获取用户列表
  {
    url: '/api/users',
    type: 'get',
    response: (config: any) => {
      const { page = 1, pageSize = 10 } = config.query
      const start = (page - 1) * pageSize
      const end = start + pageSize
      const pageUsers = users.slice(start, end)

      return {
        code: 200,
        data: {
          total: users.length,
          list: pageUsers
        },
        message: '获取成功'
      }
    }
  },

  // 更新用户信息
  {
    url: /\/api\/users\/\d+/,
    type: 'put',
    response: (config: any) => {
      const { id } = config.url.match(/\/api\/users\/(\d+)/)
      const userData = JSON.parse(config.body)
      
      return {
        code: 200,
        data: {
          id,
          ...userData
        },
        message: '更新成功'
      }
    }
  },

  // 删除用户
  {
    url: /\/api\/users\/\d+/,
    type: 'delete',
    response: () => {
      return {
        code: 200,
        data: null,
        message: '删除成功'
      }
    }
  }
] 