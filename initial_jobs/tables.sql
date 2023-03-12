CREATE TABLE if NOT EXISTS users(
  username text primary key not null,
  password text not null,
  email text not null,
  timestamp not null
);
CREATE TABLE if NOT EXISTS posts(
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  url_str TEXT NOT NULL,
  title TEXT NOT NULL,
  description_str TEXT,
  username text not null,
  timestamp text not null,
  foreign key(username) references users (username)
);
CREATE TABLE if not exists session (
  username text not null,
  timestamp text not null,
  cookie_str text not null,
  foreign key(username) references users (username)
);
