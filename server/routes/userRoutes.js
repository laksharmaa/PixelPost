import express from 'express';
import * as userController from '../controllers/userController.js';

const router = express.Router();

router.post('/:userId', userController.upsert);
router.get('/:userId', userController.getProfile);
router.post('/:userId/follow', userController.follow);
router.post('/:userId/unfollow', userController.unfollow);

export default router;