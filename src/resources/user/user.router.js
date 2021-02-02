import { Router } from 'express'
import { user, updateUser } from './user.controllers'

const router = Router()

router.get('/:id', user)
router.put('/:id', updateUser)

export default router