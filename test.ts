import db from './db.js'

const x = db.prepare(
  `
select * from postsandcomments where id in (${arr.map(() => '?').join(', ')})
`
)


console.log(x.all('1713, 471'))

const arr = [1, 2, 3];
const stmt = db.prepare(`SELECT * FROM mytable WHERE x IN (${arr.map(() => '?').join(', ')})`);
const results = stmt.all(...arr);
