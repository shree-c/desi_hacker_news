import { Router } from 'express';
import { create_post, get_posts_cn } from '../controllers/main.js';

const router = Router()

router.get('/', get_posts_cn)

router.get('/submit', (req, res) => {
  res.render('submit')
})

router.post('/submit-link', create_post)

export default router
