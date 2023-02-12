import db from '../../db.js'
import Database from 'better-sqlite3'
import * as yup from 'yup'

const insert_post_stat = db.prepare(`
insert into posts (url_str, title, description_str, username) values(@url, @title, @description, @username)
`)

const get_post_stat = db.prepare(`
select * from posts
`)

const insert_user = db.prepare(`
insert into users (username, password, email) values(@username, @password, @email)
`)

const single_user = db.prepare(`
select * from users where username = ?
`)

const insert_cookie = db.prepare(`
insert into session (username, timestamp, cookie_str) values(@username, @timestamp, @cookie_str)
`)

const get_user_from_auth_token = db.prepare(`
  select * from session where cookie_str = ?
`)

const remove_cookie = db.prepare(`
  delete from session where username = ?
`)

let post_schema = yup.object().shape({
  url: yup.string().url().required(),
  title: yup.string().min(3).required(),
  description: yup.string().min(3).required(),
  username: yup.string().min(2).max(20).required()
})

export async function db_add_post(post: yup.InferType<typeof post_schema>): Promise<Database.RunResult | Error> {
  console.log(post)
  if (await post_schema.isValid(post)) {
    return insert_post_stat.run(post)
  } else {
    throw Error('invalid post')
  }
}

export function db_get_posts(): any {
  return get_post_stat.all()
}

export function db_does_user_exist(un: string): boolean {
  return single_user.get(un)
}

export function db_create_record(req_obj) {
  try {
    insert_user.run({
      username: req_obj.un,
      password: req_obj.pass,
      email: ''
    })
  } catch (err) {
    throw new Error('E-6')
  }
}

export function db_fetch_user(un: string): any | undefined {
  return single_user.get(un)
}

export function db_store_cookie_for_username(un: string, expiry: string, cookie_str: string): void {
  insert_cookie.run({
    username: un,
    timestamp: expiry,
    cookie_str
  })
}
interface auth_object {
  username: string
}
export function db_get_user_from_auth_token(auth_token: string): auth_object {
  return get_user_from_auth_token.get(auth_token)
}

export function db_clear_cookie(un: string): void {
  remove_cookie.run(un)
}
