import db from '../../db.js'
import Database from 'better-sqlite3'
const insert_post = db.prepare(`
insert into posts (url_str, title, description_str) values(@url, @title, @description)
`)

interface post_obj {
  url: string,
  title: string,
  des: string
}

function check_str_and_length(str: string, length: number): boolean {
  return (typeof str === 'string' && str.length >= length)
}


function check_post_obj(post: post_obj): boolean {
  return (check_str_and_length(post.des, 1) && check_str_and_length(post.title, 1))
}

export function add_post(post: post_obj): Database.RunResult {
  if (check_post_obj(post)) {
    return insert_post.run(post)
  } else {
    throw Error('invalid post')
  }
}
