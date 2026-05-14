import express from 'express';
import { 
  create, 
  update, 
  getAll, 
  getById, 
  deleteById, 
  checkUniqueness 
} from './milk_collection.controller.js';

const router = express.Router();

// 1. Static/Utility routes first
// This ensures "check" isn't caught by the "/:id" logic
router.get('/check', checkUniqueness); 

// 2. General collection routes
router.get('/', getAll);
router.post('/', create);

// 3. Parameter-based routes last
// Express will only reach these if the above didn't match
router.get('/:id', getById);
router.patch('/:id', update);
router.delete('/:id', deleteById);

export default router;