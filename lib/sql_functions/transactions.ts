import db from '../../db.js'
import Database from 'better-sqlite3'
import * as yup from 'yup'

const insert_post_stat = db.prepare(`
insert into posts (url_str, title, description_str) values(@url, @title, @description)
`)

const get_post_stat = db.prepare(`
select * from posts
`)

let post_schema = yup.object().shape({
  url: yup.string().url().required(),
  title: yup.string().min(3).required(),
  description: yup.string().min(3).required()
})
interface post_obj {
  url: string,
  title: string,
  description: string
}

export async function add_post(post: post_obj): Promise<Database.RunResult | Error> {
  if (await post_schema.isValid(post)) {
    return insert_post_stat.run(post)
  } else {
    throw Error('invalid post')
  }
}

export function get_posts(): any {
  return get_post_stat.all()
}
