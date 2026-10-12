import express from 'express';
import * as postController from '../controllers/postController.js';

const router = express.Router();

router.post('/', postController.create);
router.get('/', postController.list);
router.get('/user/:userId', postController.listForUser);
router.get('/bookmarks/:userId', postController.bookmarksForUser);
router.get('/:id/similar', postController.similar);
router.post('/:id/like', postController.like);
router.post('/:id/unlike', postController.unlike);
router.post('/:id/comment', postController.comment);
router.post('/:id/bookmark', postController.bookmark);
router.post('/:id/unbookmark', postController.unbookmark);
router.post('/:id/view', postController.view);
router.post('/:id/react', postController.react);
router.delete('/:id', postController.remove);
router.get('/:id', postController.getById);

export default router;