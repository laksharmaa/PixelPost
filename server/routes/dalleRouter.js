import express from 'express';
import * as imageGenerationController from '../controllers/imageGenerationController.js';

const router = express.Router();

router.get('/', imageGenerationController.health);
router.post('/', imageGenerationController.generate);

export default router;