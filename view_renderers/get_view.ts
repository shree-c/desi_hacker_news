import { Request, Response } from "express";
import { control_ask, control_front, control_recent_comments, control_show, control_new, control_single_post, control_user_profile, control_main_posts } from '../controllers/main.js';
import env from 'env-var'
import { make_thread_html } from '../lib/thread.js';

function return_page_number(page: string): number {
  let page_number = parseInt(page)
  return isNaN(page_number) ? page_number : 1
}

import {
  add_relative_time,
  go_back,
  go_forward,
} from '../lib/time.js';

const ASK_EACH_PAGE_POSTS = env.get('ASK_EACH_PAGE_POSTS').required().asIntPositive();
const MAIN_EACH_PAGE_POSTS = env.get('MAIN_EACH_PAGE_POSTS').required().asIntPositive();
const THREAD_EACH_PAGE_POSTS = env.get('THREAD_EACH_PAGE_POSTS').required().asIntPositive();

export function view_ask
  (req: Request, res: Response): void {
  let page_number = return_page_number(req.query.p.toString());
  const total_offset = (page_number - 1) * ASK_EACH_PAGE_POSTS;
  const asks = control_ask(req.username, ASK_EACH_PAGE_POSTS, total_offset)
  res.render('index', {
    items: add_relative_time(asks),
    next_page_number: page_number + 1,
    offset: ASK_EACH_PAGE_POSTS,
    path: req.path,
    title: 'Desi Hacker News | ASK DN'
  })
}

export function view_comments
  (req: Request, res: Response): void {
  let page_number = return_page_number(req.query.p.toString());
  const total_offset = (page_number - 1) * ASK_EACH_PAGE_POSTS;
  const recent_comments = control_recent_comments(THREAD_EACH_PAGE_POSTS, total_offset);
  res.render('comments', {
    comments: recent_comments,
    path: req.path,
    offset: THREAD_EACH_PAGE_POSTS,
    next_page_number: page_number + 1,
    title: 'Desi Hacker News | RECENT COMMENTS'
  })
}

export function view_show
  (req: Request, res: Response): void {
  let page_number = return_page_number(req.query.p.toString());
  const total_offset = (page_number - 1) * ASK_EACH_PAGE_POSTS;
  const asks = control_show(req.username, ASK_EACH_PAGE_POSTS, total_offset)
  res.render('index', {
    items: add_relative_time(asks),
    next_page_number: page_number + 1,
    offset: ASK_EACH_PAGE_POSTS,
    path: req.path,
    title: 'Desi Hacker News | SHOW DN'
  })
}

export function view_front
  (req: Request, res: Response): void {
  let page_number = return_page_number(req.query.p.toString());
  const total_offset = (page_number - 1) * ASK_EACH_PAGE_POSTS;
  if (!req.query.day)
    req.query.day = ''
  if (typeof req.query.day !== 'string')
    req.query.day = ''
  const [posts, date_pointer] = control_front(
    req.username,
    MAIN_EACH_PAGE_POSTS,
    total_offset,
    req.query.day
  )
  //  console.log(posts)
  res.render('front', {
    items: posts,
    path: req.path,
    offset: MAIN_EACH_PAGE_POSTS,
    next_page_number: page_number + 1,
    title: `Desi Hacker News | Front ${req.query.date}`,
    go_back: go_back(date_pointer),
    go_forward: go_forward(date_pointer, new Date()),
    title_date: date_pointer.toUTCString()
  })
}

export function view_new
  (req: Request, res: Response): void {
  let page_number = return_page_number(req.query.p.toString());
  const total_offset = (page_number - 1) * ASK_EACH_PAGE_POSTS;
  const items = control_new(req.username, ASK_EACH_PAGE_POSTS, total_offset)
  res.render("index", {
    items,
    next_page_number: page_number + 1,
    path: req.path,
    offset: ASK_EACH_PAGE_POSTS
  });
}

export function view_threads
  (req: Request, res: Response): void {
  let page_number = return_page_number(req.query.p.toString());
  const offset = (page_number - 1) * THREAD_EACH_PAGE_POSTS;
  res.render('threads', {
    comments_html: make_thread_html(req.query.id.toString(), THREAD_EACH_PAGE_POSTS, offset)
  })
}

// need pagination
export function view_single_post(
  req: Request,
  res: Response
): void {
  const post_with_comments = control_single_post(req.query.id.toString(), req.username)
  res.render('single_post', post_with_comments)
}

export function view_user_profile(
  req: Request,
  res: Response
): void {
  const user = control_user_profile(req.query.id.toString())
  res.render('user', {
    user
  })
}

export function view_main_posts(
  req: Request,
  res: Response
): void {
  let page_number = return_page_number(req.query.p.toString());
  const offset = (page_number - 1) * MAIN_EACH_PAGE_POSTS;
  const posts = control_main_posts(req.username, MAIN_EACH_PAGE_POSTS, offset)
  res.render('index', {
    items: posts,
    next_page_number: page_number + 1,
    path: req.path,
    offset: 60
  })
}

export function view_submit(
  req: Request,
  res: Response,
): void {
  if (!req.username) {
    res.render("login", { message: "You have to be logged in to submit." });
  } else {
    res.render("submit", {});
  }
}

