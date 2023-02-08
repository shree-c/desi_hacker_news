import { Request, Response, NextFunction } from 'express'
import { add_post, get_posts } from '../lib/sql_functions/transactions.js'

export async function create_post(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    await add_post(req.body)
    res.send('done')
  } catch (err) {
    res.send(err.message)
  }
}

export function get_posts_cn(req: Request, res: Response, next: NextFunction): void {
  try {
    const posts = get_posts()
    console.log(posts)
    res.render('index', { posts })
  } catch (err) {
    res.send(err.message)
  }
}
