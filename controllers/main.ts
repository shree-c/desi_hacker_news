import { Request, Response, NextFunction } from 'express'
import { db_add_post, db_get_posts, db_create_record } from '../lib/sql_functions/transactions.js'
import { check_username_should_not_exist, check_username_rules, check_password_rule, check_pass_for_username, check_username_exists } from '../lib/check.js'

import { generatePasswordHash, generateSalt } from '../lib/auth/user.js'

export async function create_post(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    await db_add_post(req.body)
    res.send('done')
  } catch (err) {
    res.send(err.message)
  }
}

export async function get_posts_cn(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const posts = db_get_posts()
    res.render('index', { posts })
  } catch (err) {
    res.send(err.message)
  }
}

export async function handle_login(req: Request, res: Response, next: NextFunction): Promise<void> {
  if (req.body.new) {
    check_username_rules(req.body.un)
    check_username_should_not_exist(req.body.un)
    check_password_rule(req.body.pass)
    db_create_record({
      un: req.body.un,
      pass: await generatePasswordHash(req.body.pass, await generateSalt(16))
    })
    res.render('index', { posts: db_get_posts() })
  } else {
    check_username_exists(req.body.un)
    await check_pass_for_username(req.body.un, req.body.pass)
    res.render('index', { posts: db_get_posts() })
  }
}
