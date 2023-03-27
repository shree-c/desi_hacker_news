import { Router } from "express";
import {
  check_login,
  create_post,
  handle_login,
  handle_logout,
  handle_comment,
  handle_vote,
  handle_reply_link_click,
} from "../controllers/main.js";

import {
  view_ask, view_comments, view_show, view_front, view_new, view_threads, view_single_post, view_user_profile, view_main_posts, view_submit
} from '../view_renderers/get_view.js'
import { async_handler } from "../utils/express.js";

const router = Router();

router.use(await async_handler(check_login));

router.get("/", view_main_posts);

router.get("/submit", await async_handler(view_submit));

router.post("/submit-link", await async_handler(create_post));

router.get("/login", (_, res) => {
  res.render("login", { message: "" });
});

router.post("/login", await async_handler(handle_login));

router.get("/logout", await async_handler(handle_logout));

router.get("/user", await async_handler(view_user_profile));

router.get("/item", await async_handler(view_single_post));

router.post("/comment", await async_handler(handle_comment));

router.get("/vote", await async_handler(handle_vote));

router.get("/reply", await async_handler(handle_reply_link_click))

router.get("/threads", await async_handler(view_threads))

router.get("/new", await async_handler(view_new))

router.get("/ask", await async_handler(view_ask))

router.get("/show", await async_handler(view_show))

router.get("/newcomments", await async_handler(view_comments))

router.get("/front", await async_handler(view_front))

export default router;
