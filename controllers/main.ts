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
  db_get_posts,
  db_create_record,
  db_does_user_exist,
  db_get_single_post,
  db_add_comment,
  db_manage_vote,
  add_comment_and_vote_count
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
import { add_relative_time, get_duration_str } from "../lib/time.js";
import { assert } from 'node:console';
import { make_thread_html } from '../lib/thread.js';

export async function create_post(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  req.body.timestamp = new Date().getTime();
  await db_add_post(req.body);
  res.redirect("/");
}

export async function handle_submit(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  if (!req.username) {
    res.render("login", { message: "You have to be logged in to submit." });
  } else {
    res.render("submit", {});
  }
}

export async function get_posts(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  const posts = add_comment_and_vote_count(db_get_posts(), req.username);
  res.render("index", {
    posts: add_relative_time(posts),
  });
}

export async function handle_login(
  req: Request,
  res: Response,
  next: NextFunction
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

export function check_login(req: Request, res: Response, next: NextFunction) {
  if (req.cookies.auth) {
    req.username = get_username_from_auth_token(req.cookies.auth);
    res.locals.username = req.username
  } else {
    res.locals.username = false
  }
  next();
}

export function handle_logout(req: Request, res: Response, next: NextFunction) {
  res.clearCookie("auth");
  controller_events.emit("clearCookie", req.username);
  res.redirect("/");
}

export function get_user_profile(
  req: Request,
  res: Response,
  next: NextFunction
) {
  if (!req.query.id) {
    res.render("user", {
      error: "no such user",
    });
  } else {
    const user = db_does_user_exist(req.query.id + "");
    if (!user) {
      res.render("user", {
        error: "no such user",
      });
    } else {
      res.render("user", {
        error: null,
        user,
      });
    }
  }
}

export async function get_single_post(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const id = req.query.id;
  if (!id || typeof id !== "string") {
    res.status(404).render("404");
  } else {
    const post = db_get_single_post(id);
    if (post) {
      res.render("single_post", {
        post: {
          ...post,
          relative_time: get_duration_str(post.timestamp),
        },
        comment_section: get_comment_section_html_for_a_post(parseInt(id),
          req.username),
      });
    } else {
      res.status(404).render("404");
    }
  }
}

export function handle_comment(
  req: Request,
  res: Response,
  next: NextFunction
) {
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

export function handle_vote(req: Request, res: Response, next: NextFunction) {
  if (!req.username) {
    res.render("login",
      { message: "You have to be logged in to comment." });
  } else {
    if (typeof req.query.id !== 'string' || typeof req.query.what !== 'string' || !votes[req.query.what]) {
      res.status(404).send('bad request')
    } else {
      db_manage_vote(req.query.id, req.username, votes[req.query.what])
      res.send('ok')
    }
  }
}

export function handle_reply_link_click
  (req: Request, res: Response, next: NextFunction) {
  if (!req.username) {
    res.render("login",
      { message: "You have to be logged in to comment." });
  } else {
    if (typeof req.query.id === 'string' && typeof req.query.goto === 'string') {
      const post = db_get_single_post(req.query.id)
      const root_post = db_get_single_post(req.query.goto)
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

export function handle_threads
  (req: Request, res: Response, next: NextFunction) {
  if (typeof req.query.id == 'string') {
    res.render('threads', {
      comments_html: make_thread_html(req.query.id)
    })
  } else {
    res.status(400).send('bad request')
  }
}
