import { Router } from "express";
import {
  check_login,
  create_post,
  get_posts,
  handle_login,
  handle_logout,
  handle_submit,
  get_user_profile,
  get_single_post,
  handle_comment,
  handle_vote,
  handle_reply_link_click,
  handle_threads,
  newest,
} from "../controllers/main.js";

import {
  view_ask, view_comments, view_show, view_front
} from '../view_renderers/get_view.js'
import { async_handler } from "../utils/express.js";

const router = Router();

router.use(await async_handler(check_login));

router.get("/", get_posts);

router.get("/submit", await async_handler(handle_submit));

router.post("/submit-link", await async_handler(create_post));

router.get("/login", (req, res) => {
  res.render("login", { message: "" });
});

router.post("/login", await async_handler(handle_login));

router.get("/logout", await async_handler(handle_logout));

router.get("/user", await async_handler(get_user_profile));

router.get("/item", await async_handler(get_single_post));

router.post("/comment", await async_handler(handle_comment));

router.get("/vote", await async_handler(handle_vote));

router.get("/reply", await async_handler(handle_reply_link_click))

router.get("/threads", await async_handler(handle_threads))

router.get("/new", await async_handler(newest))

router.get("/ask", await async_handler(view_ask))

router.get("/show", await async_handler(view_show))

router.get("/newcomments", await async_handler(view_comments))

router.get("/front", await async_handler(view_front))

export default router;
