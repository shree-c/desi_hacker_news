import { Router } from "express";
import {
  check_login,
  create_post,
  get_posts_cn,
  handle_login,
  handle_logout,
  handle_submit,
  get_user_profile,
  get_single_post,
  handle_comment,
  handle_vote,
} from "../controllers/main.js";
import { async_handler } from "../utils/express.js";

const router = Router();

router.use(await async_handler(check_login));

router.get("/", get_posts_cn);

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

export default router;
