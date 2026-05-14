import express from 'express';
import { create, update, getAll, getById, deleteById } from './customer.controller.js';

const router = express.Router();

router.post('/', create);
router.patch('/:id', update);
router.get('/', getAll);
router.get('/:id', getById);
router.delete('/:id', deleteById);

export default router;