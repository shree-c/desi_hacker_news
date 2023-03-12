import db from "../db.js";
import { get_duration_str } from "./time.js";

const get_comment_for_a_parent = db.prepare(`
  select * from postsandcomments where parent = ?
`);


export function fetch_comments_tree(post_id: string): any[] {
  const comments = get_comment_for_a_parent.all(post_id);
  comments.forEach((e) => {
    e.children = fetch_comments_tree(e.id);
  });
  return comments;
}

export function build_html_form_comment_tree(tree: any[]): string {
  let str = "";
  tree.forEach((e) => {
    str += `
    <div class="comment" id=${e.id} >
      <span> 
      <a href="/vote?id=${e.id}&what=up" class="clicky up">△</a>
      <a href="/vote?id=${e.id}&what=dw" class="clicky dw">▽</a>
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
        ${build_html_form_comment_tree(e.children)}
      </div>
    </div> 
    `;
  });
  return str;
}

// console.log(build_html_form_comment_tree(fetch_comments(602)));
