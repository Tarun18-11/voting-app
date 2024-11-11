import express from 'express';
import {
  register,
  login,
  createElection,
  addCandidate,
  voteCandidate,
  endElection,
  getResults,
  getElections,
} from '../controllers/controllers.js';
import { authMiddleware, adminMiddleware } from '../middlewares/middlewares.js';

const router = express.Router();

// User routes
router.post('/register', register);
router.post('/login', login);
router.get('/elections', authMiddleware, getElections); 
router.post('/election/vote', authMiddleware, voteCandidate);
router.get('/results', authMiddleware, getResults);

// Admin routes
router.post('/election', authMiddleware, adminMiddleware, createElection);
router.post('/election/candidate', authMiddleware, adminMiddleware, addCandidate);
router.put('/election/:id/end', authMiddleware, adminMiddleware, endElection);

export default router;
