import { faker } from '@faker-js/faker'
import Database from 'better-sqlite3'
import fs from 'fs'
import { generatePasswordHash, generateSalt } from './lib/auth/user.js'
import { get_duration_str } from './lib/time.js'

const db = new Database('./main.db')
const insert_user = db.prepare(`
insert into users (username, password, email, timestamp) values(@username, @password, @email, @timestamp)
`)
const insert_post_stat = db.prepare(`
insert into posts (url_str, title, description_str, username, timestamp) values(@url, @title, @description_str, @username, @timestamp)
`)

const users = []
const d = new Date()
d.setDate(d.getDate() - 100)

for (let i = 0; i < 15; i++) {
  users.push({
    username: faker.internet.userName(),
    email: faker.internet.email(),
    password: faker.internet.password(15, true),
    timestamp: faker.date.between(d, new Date()).getTime()
  })
  console.log(get_duration_str(users[i].timestamp))
  // insert_user.run({
  //   ...users[i],
  //   password: await generatePasswordHash(users[i].password, await generateSalt(16))
  // })
}

const posts = []

for (let i = 0; i < 30; i++) {
  posts.push({
    url: faker.internet.url(),
    title: faker.hacker.phrase(),
    description_str: faker.commerce.productDescription(),
    timestamp: (faker.date.recent()).getTime(),
    username: users[Math.floor(Math.random() * 15)].username
  })
  // insert_post_stat.run(posts[i])
}

const obj = {
  posts,
  users
}

// fs.writeFile('seeded.json', JSON.stringify(obj), {
//   encoding: 'utf-8'
// }, (err) => {
//   if (err)
//     throw err
//   console.log('written to json')
// })
