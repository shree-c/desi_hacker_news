import express from "express";
import main_router from "./routes/main.js";
import env from "env-var";
import error_map from "./lib/error_map.js";
import cookieParser from "cookie-parser";
import {Response} from "express"
import controller_events from "./events/obj.js";
import { handle_controller_events } from "./events/event_handlers.js";

handle_controller_events(controller_events);

const PORT = env.get("PORT").required().asPortNumber();

const app = express();

app.set("view engine", "ejs");

app.use(express.static("public"));

app.use(express.json());

app.use(cookieParser());

app.use(express.urlencoded({ extended: true }));

app.use((req, res, next) => {
  const start = new Date();
  if (process.env.NODE_ENV === "development") {
    console.log(req.path, req.query);
    res.on('finish', () => {
      console.log(`status: ${res.statusCode}, took ${((new Date().getTime()) - start.getTime())}ms`)
    })
  }
  next();
});

app.use("/", main_router);

app.use((_, res:Response) => {
  res.status(404).render('404', {
    title: 'Desi Hacker News | NOT FOUND'
  })
})

app.use((err, _, res:Response, next) => {
  console.error(err);
  res.send(err.message || error_map[err.message] || "internal server error");
});
app.listen(PORT, () => console.log(`listining at ${PORT}`));
