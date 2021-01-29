import { Router } from 'express'
import controllers from './referral.controllers'

const router = Router()

// /api/referrals
router
  .route('/')
  .get(controllers.getOne)
  .post(controllers.createOne)

// /api/referrals/:id
router
  .route('/:id')
  .get(controllers.getOne)
  .put(controllers.updateOne)
  .delete(controllers.removeOne)

export default router