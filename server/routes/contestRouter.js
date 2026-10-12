import express from 'express';
import checkJwt from '../middleware/auth.js';
import * as contestController from '../controllers/contestController.js';

const router = express.Router();

router.get('/', contestController.refreshStatuses, contestController.listActive);
router.get('/all', contestController.refreshStatuses, contestController.listAll);
router.get('/user/entries', checkJwt, contestController.refreshStatuses, contestController.listUserEntries);
router.post('/update-statuses', contestController.updateStatuses);
router.get('/:id/leaderboard', contestController.leaderboard);
router.get('/:id', contestController.refreshStatuses, contestController.getById);
router.post('/:id/submit', checkJwt, contestController.submitEntry);
router.post('/:id/vote', checkJwt, contestController.vote);
router.delete('/:id/entries/:entryId', checkJwt, contestController.removeEntry);

export default router;