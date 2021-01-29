import { Router } from 'express'
import { user, updateUser } from './user.controllers'

const router = Router()

router.get('/', user)
router.put('/', updateUser)

export default router