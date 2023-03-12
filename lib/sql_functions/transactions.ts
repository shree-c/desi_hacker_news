import db from "../../db.js";
import Database from "better-sqlite3";
import * as yup from "yup";

const insert_single_post = db.prepare(`
insert into postsandcomments 
(url_str, title, description_str, username, timestamp) 
values(@url, @title, @description, @username, @timestamp)
`);

const get_all_posts = db.prepare(`
select * from postsandcomments where parent ISNULL
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
let post_schema = yup.object().shape({
  url: yup.string().url().required(),
  title: yup.string().min(3).required(),
  description: yup.string().min(3).required(),
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

export function db_get_posts(): any {
  return get_all_posts.all();
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
  console.log(vote)
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
      if (vote === 'up' || vote === 'undw') {
        return
      } else if (vote === 'unup') {
        final_vote_value = 0
      } else if (vote === 'dw') {
        final_vote_value = -1
      }
    } else if (existing_vote.value === -1) {
      if (vote === 'dw' || vote === 'unup') {
        return
      } else if (vote === 'undw') {
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
