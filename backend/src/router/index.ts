import express from 'express';
import { users } from '../controller/UserController.ts';

const router = express.Router();

router.get('/users', users);

export default router;