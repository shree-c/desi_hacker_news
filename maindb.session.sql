-- i am trying to find my parent
-- I am somebody's parent
WITH recursive ct as (
  select id,
    parent,
    description_str,
    timestamp,
    username,
    0 as depth
  from postsandcomments
  where username = 'Fleta_Kerluke'
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
      where root.parent == NULL
    )
  end as root_id
from ct;
-- select id,
--   url_str,
--   parent,
--   description_str,
--   timestamp,
--   username,
--   0 as depth
-- from postsandcomments
-- where username = 'Fleta_Kerluke'
--   AND parent is not NULL;
-- SELECT t.id,
--   (
--     SELECT description_str
--     from postsandcomments
--     WHERE t.id = parent
--   ) as childstitle
-- from postsandcomments as t
