import express from 'express';
import { create, update, getAll, getById, deleteById, getNextCode } from './customer.controller.js';

const router = express.Router();


router.get('/next-code', getNextCode);
router.post('/', create);
router.patch('/:id', update);
router.get('/', getAll);
router.get('/:id', getById);
router.delete('/:id', deleteById);

export default router;