declare global {
  namespace Express {
    interface Request {
      username: string
    }
  }
}
import { Request, Response, NextFunction } from 'express'
import { db_add_post, db_get_posts, db_create_record } from '../lib/sql_functions/transactions.js'
import { check_username_should_not_exist, check_username_rules, check_password_rule, check_pass_for_username, check_username_exists } from '../lib/check.js'
import { gen_cookie, get_username_from_auth_token } from '../lib/cookie.js'
import { generatePasswordHash, generateSalt } from '../lib/auth/user.js'
import controller_events from '../events/obj.js'

export async function create_post(req: Request, res: Response, next: NextFunction): Promise<void> {
  await db_add_post(req.body)
  res.redirect('/')
}

export async function handle_submit(req: Request, res: Response, next: NextFunction): Promise<void> {
  if (!req.username) {
    res.render('login', { message: 'You have to be logged in to submit.' })
  } else {
    res.render('submit', { username: req.username })
  }
}

export async function get_posts_cn(req: Request, res: Response, next: NextFunction): Promise<void> {
  const posts = db_get_posts()
  res.render('index', { posts, username: req.username })
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
    const d = new Date()
    d.setDate(d.getDate() + 10)
    res.cookie('auth', gen_cookie(req.body.un, d), {
      expires: d,
      httpOnly: true,
      sameSite: 'strict'
    })
    res.redirect('/')
  } else {
    check_username_exists(req.body.un)
    await check_pass_for_username(req.body.un, req.body.pass)
    const d = new Date()
    d.setDate(d.getDate() + 10)
    res.cookie('auth', gen_cookie(req.body.un, d), {
      expires: d,
      httpOnly: true,
      sameSite: 'strict'
    })
    res.redirect('/')
  }
}

export function check_login(req: Request, res: Response, next: NextFunction) {
  if (req.cookies.auth) {
    req.username = get_username_from_auth_token(req.cookies.auth)
  }
  next()
}

export function handle_logout(req: Request, res: Response, next: NextFunction) {
  res.clearCookie('auth')
  controller_events.emit('clearCookie', req.username)
  res.redirect('/')
}
