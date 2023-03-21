import { faker } from "@faker-js/faker";
import { assert } from "console";
import db from "./db.js";

function getRandomFromArr(arr: any[]): any {
  assert(arr.length > 0);
  return arr[Math.floor(Math.random() * arr.length)];
}
const insert_post = db.prepare(`
insert into postsandcomments (url_str, title, description_str, username, timestamp)
values(@url, @title, @description, @username, @timestamp)
`);

const get_all_entries_from_postsandcomments = db.prepare(`
select id, timestamp from postsandcomments
`);

const insert_comment = db.prepare(`
insert into postsandcomments (description_str, parent, username, timestamp)
values(@text, @parent, @username, @timestamp)
`);

const get_all_usernames = db.prepare(`
select username, timestamp from users
`);

const usernames = get_all_usernames.all();

console.log("adding posts");
// added posts
for (let i = 0; i < 200; i++) {
  const user = getRandomFromArr(usernames);
  insert_post.run({
    url: faker.internet.url(),
    title: faker.company.bs(),
    username: user.username,
    description: faker.random.words(20),
    timestamp: faker.date
      .between(parseInt(user.timestamp), new Date())
      .getTime(),
  });
}
// adding comments to those posts

let posts = get_all_entries_from_postsandcomments.all();

console.log("adding top level comments");
for (let i = 0; i < 300; i++) {
  const post = getRandomFromArr(posts);
  const user = getRandomFromArr(usernames);
  insert_comment.run({
    text: faker.hacker.phrase(),
    parent: post.id,
    username: user.username,
    timestamp: faker.date.recent().getTime(),
  });
}

// building comment tree
console.log("building comment tree");
for (let i = 0; i < 8; i++) {
  posts = get_all_entries_from_postsandcomments.all();
  for (let j = 0; j < 50; j++) {
    const post = getRandomFromArr(posts);
    const user = getRandomFromArr(usernames);
    insert_comment.run({
      text: faker.hacker.phrase(),
      parent: post.id,
      username: user.username,
      timestamp: faker.date
        .between(parseInt(user.timestamp), new Date())
        .getTime(),
    });
  }
}

console.log("suxxful seeding");
