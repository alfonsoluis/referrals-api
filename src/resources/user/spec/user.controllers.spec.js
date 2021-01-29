import controllers from '../user.controllers'
import { isFunction } from 'lodash'

describe('user controllers:', () => {
  test('has crud methods', () => {
    const crudMethods = [
      'getOne',
      'getMany',
      'createOne',
      'removeOne',
      'updateOne'
    ]

    crudMethods.forEach(name =>
      expect(isFunction(controllers[name])).toBe(true)
    )
  })
})