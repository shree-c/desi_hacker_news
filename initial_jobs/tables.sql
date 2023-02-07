CREATE TABLE if NOT EXISTS posts(
  id INTEGER PRIMARY KEY ASC AUTOINCREMENT,
  url_str char(30) NOT NULL,
  title char(200) NOT NULL,
  description_str char(1000) NOT NULL
);
