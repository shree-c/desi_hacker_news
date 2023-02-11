import { Router } from 'express';
import { create_post, get_posts_cn, handle_login } from '../controllers/main.js';
import { async_handler } from '../utils/express.js';

const router = Router()

router.get('/', get_posts_cn)

router.get('/submit', (req, res) => {
  res.render('submit')
})

router.post('/submit-link', await async_handler(create_post))

router.get('/login', (req, res) => {
  res.render('login')
})

router.post('/login', await async_handler(handle_login))

export default router
