const $ = function (x) {
  return document.getElementById(x);
};

const byCSS = function (css) {
  return document.querySelector(css);
};

function removeDownvote(e, url) {
  e.classList.add("dw");
  e.classList.remove("dwd");
  new Image().src = e.href;
  url.searchParams.set("what", "dw");
  e.href = url.pathname + url.search;
  e.innerText = "▽";
}

function removeUpvote(e, url) {
  e.classList.add("up");
  e.classList.remove("upd");
  new Image().src = e.href;
  url.searchParams.set("what", "up");
  e.href = url.pathname + url.search;
  e.innerText = "△";
}

function vote(e) {
  const url = new URL(e.href, location);
  if (e.classList.contains("up")) {
    e.classList.add("upd");
    e.classList.remove("up");
    new Image().src = e.href;
    url.searchParams.set("what", "unup");
    e.href = url.pathname + url.search;
    e.innerText = "▲";
    if (e.nextElementSibling.classList.contains("dwd")) {
      removeDownvote(e.nextElementSibling, url);
    }
  } else if (e.classList.contains("dw")) {
    e.classList.add("dwd");
    e.classList.remove("dw");
    new Image().src = e.href;
    url.searchParams.set("what", "undw");
    e.href = url.pathname + url.search;
    e.innerText = "▼";
    if (e.previousElementSibling.classList.contains("upd")) {
      removeUpvote(e.previousElementSibling, url);
    }
  } else if (e.classList.contains("upd")) {
    removeUpvote(e, url);
  } else if (e.classList.contains("dwd")) {
    removeDownvote(e, url);
  }
}

document.addEventListener("click", (e) => {
  if (e.target.classList.contains("clicky")) {
    e.preventDefault();
    e.stopImmediatePropagation();
    e.stopPropagation();
    vote(e.target);
  }
});
