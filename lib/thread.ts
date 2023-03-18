import db from '../db.js';
import { get_duration_str } from './time.js';

const comments_and_replies_for_an_user = db.prepare(`
WITH recursive ct as (
  select id,
    parent,
    description_str,
    timestamp,
    username,
    0 as depth
  from postsandcomments
  where username = ?
    AND parent is not NULL
  union
  select t.id,
    t.parent,
    t.description_str,
    t.timestamp,
    t.username,
    ct.depth + 1
  from postsandcomments as t
    join ct on t.parent = ct.id
)
select ct.id,
  ct.description_str,
  ct.timestamp,
  ct.username,
  ct.parent,
  ct.depth,
  case
    when ct.depth = 0 then (
      WITH RECURSIVE root as (
        SELECT id,
          parent,
          title
        from postsandcomments
        where id = ct.id
        UNION
        SELECT p.id,
          p.parent,
          p.title
        from postsandcomments as p
          join root on root.parent = p.id
      )
      select id
      from root
      where root.parent is NULL
    )
  end as root_id
from ct order by depth;
`)


function make_tree(items: any[]): any[] {
  const temp_hash_map = new Map()
  const depth_zero = [];
  for (let i = 0; i < items.length; i++) {
    temp_hash_map.set(items[i].id, items[i])
    if (items[i].depth == 0) {
      depth_zero.push(items[i])
    } else {
      const parent = temp_hash_map.get(items[i].parent)
      if (!parent)
        throw new Error(`parent doesn't exist`)
      if (parent.children) {
        parent.children.push(items[i])
      } else {
        parent.children = [items[i]]
      }
    }
  }
  return depth_zero
}

function add_context_link(e: any): string {
  if (e.depth == 0) {
    return `
    | <a href="/item?id=${e.root_id}">
      context
    </a> 
    `
  }
  return ''
}

function build_thread_html(tree: any[] = []): string {
  let str = ""
  tree.forEach((e) => {
    str += `
    <div class="comment" id=${e.id} >
      <div class="meta mild">
        <a class="" href="/item?id=${e.id}">
          ${get_duration_str(e.timestamp)}
        </a>
        by
        <a class="mild" href="/user?id=${e.username}">
          ${e.username}
        </a> |
        <a class="" href="/item?id=${e.parent}">
          parent
        </a>
        ${add_context_link(e)}

      </div>
      <p class="comtex">
        ${e.description_str}
      </p>
      <div class="children">
        ${build_thread_html(e.children)}
      </div>
    </div> 
    `
  })
  return str
}

export function make_thread_html(username: string): string {
  return build_thread_html(
    make_tree(
      comments_and_replies_for_an_user.all(username)
    )
  )
}
