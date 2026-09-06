// routes/keywordRoutes.js
import express from 'express';
import {
  generateKeyword,
  getAllKeywords,
  deleteKeyword,
  getKeywordBySlug
} from '../controllers/keywordController.js';

const router = express.Router();

// Public routes — no adminAuth
router.post('/generate', generateKeyword);
router.get('/', getAllKeywords);
router.delete('/:id', deleteKeyword);
router.get('/:slug', getKeywordBySlug);

export default router;
