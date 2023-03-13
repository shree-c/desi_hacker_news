import db from "../db.js";
import { get_duration_str } from "./time.js";

const db_get_all_comments = db.prepare(`
with recursive comment_tree as (
  select id, parent, description_str, username, timestamp, 0 as depth
  from postsandcomments
  where parent is null and id = @id
  union all
  select t.id, t.parent, t.description_str, t.username, t.timestamp, comment_tree.depth + 1
  from postsandcomments as t
  join
  comment_tree on t.parent = comment_tree.id
)
select ct.id, ct.description_str, ct.username, ct.timestamp, ct.depth, ct.parent
,
(
select value from vote where vote.id = ct.id and vote.user = @username 
) as vote

from comment_tree ct order by depth, id
`)

export const number_of_comments = db.prepare(`
with recursive comment_tree as (
  select id, parent, description_str, username, timestamp, 0 as depth
  from postsandcomments
  where parent is null and id = ?
  union all
  select t.id, t.parent, t.description_str, t.username, t.timestamp, comment_tree.depth + 1
  from postsandcomments as t
  join
  comment_tree on t.parent = comment_tree.id
)
 select count(id) - 1 as count from comment_tree
`)


function make_comment_tree(sql_result_array: any[]): any[] {
  const temp_hash_map = new Map()
  const depth_1_array = []
  for (let i = 1; i < sql_result_array.length; i++) {
    temp_hash_map.set(sql_result_array[i].id, sql_result_array[i])
    if (sql_result_array[i].depth === 1) {
      depth_1_array.push(sql_result_array[i])
    } else {
      const parent = temp_hash_map.get(sql_result_array[i].parent)
      if (parent.children) {
        parent.children.push(sql_result_array[i])
      } else {
        parent.children = [sql_result_array[i]]
      }
    }
  }
  return depth_1_array
}

function build_html_form_comment_tree(tree: any[] = [], logged_in: boolean): string {
  let str = "";
  tree.forEach((e) => {
    str += `
    <div class="comment" id=${e.id} >
      <span> 
      <a href="/vote?id=${e.id}&what=${(e.vote === 1) ? 'unup' : 'up'}" 
      class="${logged_in ? 'clicky' : ''} ${(e.vote === 1) ? 'upd' : 'up'}">
      ${(e.vote === 1) ? '▲' : '△'}
      </a>
      <a href="/vote?id=${e.id}&what=${(e.vote === -1) ? 'undw' : 'dw'}" 
      class="${logged_in ? 'clicky' : ''} ${(e.vote === -1) ? 'dwd' : 'dw'}">
      ${(e.vote === -1) ? '▼' : '▽'}
      </a>
      </span>
      <p class="comtex">
        ${e.description_str}
      </p>
      <div class="meta">
        <a href="/item?id=${e.id}" class="mild">${get_duration_str(
      e.timestamp
    )} </a>
        <a href="/user?id=${e.username}" class="mild">${e.username} </a>
      </div>
      <div class="children">
        ${build_html_form_comment_tree(e.children, logged_in)}
      </div>
    </div> 
    `;
  });
  return str;
}

interface comment_section {
  comment_html: string,
  comment_count: number
}

export function get_comment_section_html_for_a_post(id: number, username: string): comment_section {
  const comments_flat = db_get_all_comments.all({
    id,
    username: username || ''
  })
  const comment_html = build_html_form_comment_tree
    (
      make_comment_tree(comments_flat), (username) ? true : false
    )
  return {
    comment_count: comments_flat.length,
    comment_html
  }
}
