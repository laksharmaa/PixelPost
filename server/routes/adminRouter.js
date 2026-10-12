import express from 'express';
import verifyAdminToken from '../middleware/adminAuth.js';
import * as adminController from '../controllers/adminController.js';

const router = express.Router();

router.post('/setup', adminController.setup);
router.post('/login', adminController.login);
router.post('/contests', verifyAdminToken, adminController.createContest);
router.get('/contests', verifyAdminToken, adminController.listContests);
router.get('/contests/:id', verifyAdminToken, adminController.getContest);
router.put('/contests/:id', verifyAdminToken, adminController.updateContest);
router.delete('/contests/:id', verifyAdminToken, adminController.deleteContest);
router.post('/contests/:id/calculate-winners', verifyAdminToken, adminController.calculateWinners);

export default router;