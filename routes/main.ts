import { Router } from 'express';
import { create_post } from '../controllers/main.js';

const router = Router()

router.get('/', (req, res) => {
  res.render('index')
})

router.get('/submit', (req, res) => {
  res.render('submit')
})

router.post('/submit-link', create_post)

export default router
