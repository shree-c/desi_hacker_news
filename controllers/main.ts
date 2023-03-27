declare global {
  namespace Express {
    interface Request {
      username: string;
    }
  }
}

import {
  get_comment_section_html_for_a_post
} from "../lib/comment.js";

import { Request, Response, NextFunction } from "express";

import {
  db_add_post,
  db_create_record,
  db_add_comment,
  db_manage_vote,
  add_comment_and_vote_count,
  get_newest_posts,
  db_get_ask_posts,
  db_get_recent_comments,
  db_get_show_posts,
  db_get_posts_of_a_day,
  get_single_post,
  single_user, 
  get_main_posts
} from "../lib/sql_functions/transactions.js";
import {
  check_username_should_not_exist,
  check_username_rules,
  check_password_rule,
  check_pass_for_username,
  check_username_exists,
} from "../lib/check.js";
import { gen_cookie, get_username_from_auth_token } from "../lib/cookie.js";
import { generatePasswordHash, generateSalt } from "../lib/auth/user.js";
import controller_events from "../events/obj.js";
import { add_relative_time, get_duration_str, set_to_start_of_utc_day } from "../lib/time.js";
import db from '../db.js';
import { strict as assert } from 'node:assert';

export async function create_post(
  req: Request,
  res: Response,
): Promise<void> {
  req.body.timestamp = new Date().getTime();
  await db_add_post(req.body);
  res.redirect("/");
}

export function control_main_posts(username:string, limit:number, offset:number) {
  const posts = get_main_posts.all({limit, offset, username})
  return add_relative_time(posts)
}

export async function handle_login(
  req: Request,
  res: Response,
): Promise<void> {
  if (req.body.new) {
    check_username_rules(req.body.un);
    check_username_should_not_exist(req.body.un);
    check_password_rule(req.body.pass);
    db_create_record({
      un: req.body.un,
      pass: await generatePasswordHash(req.body.pass, await generateSalt(16)),
    });
    const d = new Date();
    d.setDate(d.getDate() + 10);
    res.cookie("auth", gen_cookie(req.body.un, d), {
      expires: d,
      httpOnly: true,
      sameSite: "strict",
    });
    res.redirect("/");
  } else {
    check_username_exists(req.body.un);
    await check_pass_for_username(req.body.un, req.body.pass);
    const d = new Date();
    d.setDate(d.getDate() + 10);
    res.cookie("auth", gen_cookie(req.body.un, d), {
      expires: d,
      httpOnly: true,
      sameSite: "strict",
    });
    res.redirect("/");
  }
}

export function check_login(req: Request, res: Response, next: NextFunction): void {
  if (req.cookies.auth) {
    req.username = get_username_from_auth_token(req.cookies.auth);
    res.locals.username = req.username
  } else {
    res.locals.username = false
  }
  res.locals.title = ''
  next();
}

export function handle_logout(req: Request, res: Response): void {
  res.clearCookie("auth");
  controller_events.emit("clearCookie", req.username);
  res.redirect("/");
}

export function control_user_profile(
  user_id: string
): object {
  if (!user_id)
    throw new Error('invalid request')
  const user = single_user.get(user_id)
  if (!user)
    throw new Error(`user doesn't exist`)
  return user
}

// need to handle posts that are not roots
export function control_single_post(
  post_id: string, username: string
): object {
  const numeric_post_id = parseInt(post_id)
  if (isNaN(numeric_post_id))
    throw new Error("Invalid post id");

  const post = get_single_post.get(numeric_post_id)
  if (!post)
    throw new Error("Post doesn't exist");
  return {
    post: add_relative_time([post])[0],
    comment_section: get_comment_section_html_for_a_post(numeric_post_id, username)
  }
}

export function handle_comment(
  req: Request,
  res: Response
): void {
  if (!req.username) {
    res.render("login",
      { message: "You have to be logged in to comment." });
  } else {
    if (typeof req.body.text !== "string"
      || req.body.text.length === 0) {
      throw new Error("comment cannot be empty");
    }
    db_add_comment(req.username, req.body.text, req.body.parent);
    res.redirect(req.body.goto);
  }
}

const votes = {
  up: 'up',
  unup: 'unup',
  dw: 'dw',
  undw: 'undw'
}

export function handle_vote(req: Request, res: Response): void {
  if (!req.username) {
    res.render("login",
      { message: "You have to be logged in to comment." });
  } else {
    if (typeof req.query.id !== 'string' || typeof req.query.what !== 'string' || !votes[req.query.what]) {
      res.status(404).send('bad request')
    } else {
      db_manage_vote(req.query.id, req.username, votes[req.query.what])
      console.log('voted')
      res.send('ok')
    }
  }
}

export function handle_reply_link_click
  (req: Request, res: Response): void {
  if (!req.username) {
    res.render("login",
      { message: "You have to be logged in to comment." });
  } else {
    if (typeof req.query.id === 'string' && typeof req.query.goto === 'string') {
      const post = get_single_post.get(req.query.id)
      const root_post = get_single_post.get(req.query.goto)
      res.render("reply", {
        comment: add_relative_time([post])[0],
        root_id: req.query.goto,
        short_root_post_title: (root_post.title.length < 50) ? root_post.title : root_post.title.slice(0, 51) + '...'
      })
    } else {
      res.send('bad request')
    }
  }
}

export function control_reply
  (req: Request, res: Response): void {
  if (!req.username) {
    res.render("login",
      { message: "You have to be logged in to comment." });
  } else {
    if (typeof req.query.id === 'string' && typeof req.query.goto === 'string') {
      const post = get_single_post.get(req.query.id)
      const root_post = get_single_post.get(req.query.goto)
      res.render("reply", {
        comment: add_relative_time([post])[0],
        root_id: req.query.goto,
        short_root_post_title: (root_post.title.length < 50) ? root_post.title : root_post.title.slice(0, 51) + '...'
      })
    } else {
      res.send('bad request')
    }
  }
}

export function control_new
  (username: string, limit: number, offset: number): any[] {
  const newest_posts = get_newest_posts.all({
    limit,
    offset
  })
  return add_relative_time(add_comment_and_vote_count(newest_posts, username))
}

export function control_ask(username: string, limit: number, offset: number): any[] {
  return add_comment_and_vote_count(
    db_get_ask_posts.all({
      limit,
      offset
    }), username)
}

export function control_show(username: string, limit: number, offset: number): any[] {
  return add_comment_and_vote_count(
    db_get_show_posts.all({
      limit,
      offset
    }), username)
}

export function control_recent_comments(limit: number, offset: number) {
  const comments = db_get_recent_comments.all({
    limit, offset
  })
  const ids_string = comments.reduce((pv, cv, i, arr) => {
    pv += cv.root_id + ((arr.length - 1 != i) ? ', ' : '')
    return pv
  }, '')
  const db_get_titles = db.prepare(`
select title, id from postsandcomments where id in (${ids_string})
  `)
  const titles = db_get_titles.all();
  const title_entries = {};
  titles.forEach((x) => {
    return title_entries[x.id.toString()] = x.title
  })
  const comments_with_added_context_and_relative_time = comments.map((e) => {
    e.context_title = title_entries[e.root_id.toString()]
    e.relative_time = get_duration_str(e.timestamp)
    return e
  })
  return comments_with_added_context_and_relative_time;
}

export function control_front(username: string, limit: number, offset: number, date: string): any[] {
  let final_date_obj: Date | null = null
  if (date === '') {
    final_date_obj = new Date()
    final_date_obj.setDate(final_date_obj.getDate() - 1)
    // set to previous day start
    final_date_obj = set_to_start_of_utc_day(final_date_obj)
  } else {
    //
    if (!date.match(/\d\d\d\d-\d\d-\d\d/)) {
      throw new Error('Invalid day.');
    }
    const date_strings = date.split('-');
    final_date_obj = new Date(Date.UTC(+date_strings[0], +date_strings[1] - 1, +date_strings[2], 0, 0, 0))
    if (final_date_obj > new Date()) {
      throw new Error('No time travelling')
    }
  }
  const start = final_date_obj.getTime()
  // forwarding 24 hours
  const end = start + (60 * 60 * 24 * 1000)
  const posts = (db_get_posts_of_a_day.all({
    start,
    end,
    username,
    limit,
    offset
  }))
  posts.forEach((e) => {
    assert(+e.timestamp <= end && +e.timestamp >= start)
  })
  return [add_relative_time(posts), final_date_obj]
}
