import { Request, Response, NextFunction } from "express";
import { control_ask, control_front, control_recent_comments, control_show } from '../controllers/main.js';
import env from 'env-var'
import {
  add_relative_time,
  go_back,
  date_hyphen_to_date_obj,
  date_format_hyphen_seperated,
  go_forward,
  set_to_start_of_utc_day
} from '../lib/time.js';
const ASK_EACH_PAGE_POSTS = env.get('ASK_EACH_PAGE_POSTS').required().asIntPositive();
const MAIN_EACH_PAGE_POSTS = env.get('MAIN_EACH_PAGE_POSTS').required().asIntPositive();
const THREAD_EACH_PAGE_POSTS = env.get('THREAD_EACH_PAGE_POSTS').required().asIntPositive();
const NEW_EACH_PAGE_POSTS = env.get('THREAD_EACH_PAGE_POSTS').required().asIntPositive();
const monthNames = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export function view_ask
  (req: Request, res: Response, next: NextFunction) {
  const page_number = (req.query.p && typeof req.query.p === 'string')
    ? parseInt(req.query.p)
    : 1;
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
  (req: Request, res: Response, next: NextFunction) {
  const page_number = (req.query.p && typeof req.query.p === 'string')
    ? parseInt(req.query.p)
    : 1;
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
  (req: Request, res: Response, next: NextFunction) {
  const page_number = (req.query.p && typeof req.query.p === 'string')
    ? parseInt(req.query.p)
    : 1;
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
  (req: Request, res: Response, next: NextFunction) {
  const page_number = (req.query.p && typeof req.query.p === 'string')
    ? parseInt(req.query.p)
    : 1;
  const total_offset = (page_number - 1) * ASK_EACH_PAGE_POSTS;
  if (!req.query.day)
    req.query.day = ''
  const [posts, date_pointer] = control_front(
    req.username,
    MAIN_EACH_PAGE_POSTS,
    total_offset,
    req.query.day+''
  )
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
