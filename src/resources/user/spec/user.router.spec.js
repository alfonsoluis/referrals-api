import router from '../user.router'

describe('user router', () => {
  test('has crud routes', () => {
    const routes = [
      { path: '/:id', method: 'get' },
      { path: '/:id', method: 'put' }
    ]

    routes.forEach(route => {
      const match = router.stack.find(
        s => s.route.path === route.path && s.route.methods[route.method]
      )
      expect(match).toBeTruthy()
    })
  })
})