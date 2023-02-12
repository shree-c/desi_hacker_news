import { Router } from 'express';
import { check_login, create_post, get_posts_cn, handle_login, handle_logout, handle_submit } from '../controllers/main.js';
import { async_handler } from '../utils/express.js';

const router = Router()

router.use(await async_handler(check_login))

router.get('/', get_posts_cn)

router.get('/submit', await async_handler(handle_submit))

router.post('/submit-link', await async_handler(create_post))

router.get('/login', (req, res) => {
  res.render('login', { message: '' })
})

router.post('/login', await async_handler(handle_login))

router.get('/logout', await async_handler(handle_logout))

export default router
