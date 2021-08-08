import express from 'express';

import {getPostsBySearch , likePosts, RecommendedPost,  deleteComment,  getPostdetails, createPost,  getPosts,  updatePost, likePost, commentPost, deletePost } from '../controllers/post.js';
const router = express.Router();
import auth from "../middleware/auth.js";

router.get('/search', getPostsBySearch);
router.post('/:id/recommended', RecommendedPost);

router.get('/:id', getPostdetails);
//router.get('/', getPosts);

router.post('/', auth,  createPost);
router.patch('/:id', auth, updatePost);
router.delete('/:id', auth, deletePost);
router.delete('/:id/comment', auth, deleteComment);
router.patch('/:id/likePost', auth, likePost);
router.patch('/:id/likePosts', auth, likePosts);
router.post('/:id/commentPost', auth , commentPost);

export default router;