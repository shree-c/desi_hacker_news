import db from "../../db.js";
import Database from "better-sqlite3";
import * as yup from "yup";
import { number_of_comments } from '../comment.js';

const insert_single_post = db.prepare(`
insert into postsandcomments 
(url_str, title, description_str, username, timestamp) 
values(@url, @title, @description, @username, @timestamp)
`);

const get_main_posts = db.prepare(`
select * from postsandcomments where parent is null
and title NOT like 'Ask HN:%'
and title NOT like 'Show HN:%'
ORDER BY timestamp desc
LIMIT @limit OFFSET @offset
`);

const insert_user = db.prepare(`
insert into users (username, password, email, timestamp)
 values(@username, @password, @email, @timestamp)
`);

const single_user = db.prepare(`
select * from users where username = ?
`);

const insert_cookie = db.prepare(`
insert into session (username, timestamp, cookie_str)
 values(@username, @timestamp, @cookie_str)
`);

const get_user_from_auth_token = db.prepare(`
  select * from session where cookie_str = ?
`);

const remove_cookie = db.prepare(`
  delete from session where username = ?
`);

const get_single_post = db.prepare(`
  select * from postsandcomments where id = ?
`);

const insert_comment = db.prepare(`
insert into postsandcomments (description_str, parent, username, timestamp)
values(@text, @parent, @username, @timestamp)
`);

const get_vote = db.prepare(`
select value from vote where id = @id and user = @username
`)

const insert_vote = db.prepare(`
insert into vote (id, user, timestamp, value)
values(@id, @username, @timestamp, @value)
`)

const delete_vote = db.prepare(`
delete from vote where id = @id and user = @username
`)

const update_vote = db.prepare(`
update vote set 
value = @value, timestamp = @timestamp where id = @id and user = @username
`)

const get_vote_count = db.prepare(`
  select sum(value) as vote_count from vote where id = ? group by id
`)

export const get_newest_posts = db.prepare(`
select * from postsandcomments where parent is null
order by timestamp desc
limit @limit offset @offset
`)

export const get_comments = db.prepare(`
select * from postsandcomments where parent is not null
order by timestamp desc
limit @limit offset @offset
`)

export const db_get_ask_posts = db.prepare(`
select * from postsandcomments where parent is null and title like 'Ask HN:%'
order by timestamp desc
limit @limit offset @offset
`)

export const db_get_recent_comments = db.prepare(`
select ct.id,
  ct.description_str,
  ct.timestamp,
  ct.username,
  ct.parent,
      (WITH RECURSIVE root as (
        SELECT id,
          parent,
          title
        from postsandcomments
        where id = ct.id
        UNION
        SELECT p.id,
          p.parent,
          p.title
        from postsandcomments as p
          join root on root.parent = p.id
      )
      select id
      from root
      where root.parent is NULL
    )
  as root_id
from postsandcomments as ct
where ct.parent is not null
order by timestamp desc
limit @limit offset @offset
`)

export const db_get_titles = db.prepare(`
select title, id from postsandcomments where id in (@ids_string)
`)

let post_schema = yup.object().shape({
  url: yup.string().url(),
  title: yup.string().min(3).required(),
  description: yup.string(),
  username: yup.string().min(2).max(20).required(),
});

export async function db_add_post(
  post: yup.InferType<typeof post_schema>
): Promise<Database.RunResult | Error> {
  if (await post_schema.isValid(post)) {
    return insert_single_post.run(post);
  } else {
    throw Error("invalid post");
  }
}

export function db_get_main_posts(offset: number, limit = 60): any {
  return get_main_posts.all({
    offset,
    limit
  });
}

export function db_does_user_exist(un: string): any {
  return single_user.get(un);
}

export function db_create_record(req_obj) {
  try {
    insert_user.run({
      username: req_obj.un,
      password: req_obj.pass,
      email: "",
      timestamp: new Date().getTime() + "",
    });
  } catch (err) {
    console.error(err);
    throw new Error("E-6");
  }
}

export function db_fetch_user(un: string): any | undefined {
  return single_user.get(un);
}

export function db_store_cookie_for_username(
  un: string,
  expiry: string,
  cookie_str: string
): void {
  insert_cookie.run({
    username: un,
    timestamp: expiry,
    cookie_str,
  });
}
interface auth_object {
  username: string;
}
export function db_get_user_from_auth_token(auth_token: string): auth_object {
  return get_user_from_auth_token.get(auth_token);
}

export function db_clear_cookie(un: string): void {
  remove_cookie.run(un);
}

export function db_get_single_post(
  post_id: string
): yup.InferType<typeof post_schema> {
  return get_single_post.get(post_id);
}

export function db_add_comment(
  username: string,
  text: string,
  parent: string
): void {
  insert_comment.run({
    username,
    text,
    parent: parseInt(parent),
    timestamp: new Date().getTime(),
  });
}
const vote_vals = {
  up: 1,
  unup: -1,
  dw: -1,
  undw: 1
}

export function db_manage_vote(
  id: string,
  username: string,
  vote: string
): void {
  const existing_vote = get_vote.get({
    id,
    username
  })
  if (!existing_vote || existing_vote.value === 0) {
    insert_vote.run({
      id,
      username,
      timestamp: (new Date()).getTime(),
      value: vote_vals[vote]
    })
  } else {
    let final_vote_value = existing_vote.value
    if (existing_vote.value === 1) {
      if (vote === 'unup') {
        final_vote_value = 0
      } else if (vote === 'dw') {
        final_vote_value = -1
      }
    } else if (existing_vote.value === -1) {
      if (vote === 'undw') {
        final_vote_value = 0
      } else if (vote === 'up') {
        final_vote_value = 1
      }
    }
    if (final_vote_value === 0) {
      delete_vote.run({
        id,
        username
      })
      return
    }
    update_vote.run({
      id,
      username,
      timestamp: (new Date()).getTime(),
      value: final_vote_value
    })
  }
}

export function add_comment_and_vote_count(posts: any[], username: string | undefined): any[] {
  return posts.map((e) => {
    e.vote_count = get_vote_count.get(e.id)?.vote_count || 0
    e.comment_count = number_of_comments.get(e.id)?.count || 0
    if (username) {
      e.vote = get_vote.get({
        id: e.id,
        username
      })?.value
    }
    return e
  })
}
