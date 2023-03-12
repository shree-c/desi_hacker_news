function vote(e) {
  const url = new URL(e.href, location);
  if (e.classList.contains("up")) {
    e.classList.add("upd");
    e.classList.remove("up");
    new Image().src = e.href;
    url.searchParams.set("what", "unup");
    e.href = url.pathname + url.search;
    e.innerText = "▲";
  } else if (e.classList.contains("dw")) {
    e.classList.add("dwd");
    e.classList.remove("dw");
    new Image().src = e.href;
    url.searchParams.set("what", "undw");
    e.href = url.pathname + url.search;
    e.innerText = "▼";
  } else if (e.classList.contains("upd")) {
    e.classList.add("up");
    e.classList.remove("upd");
    new Image().src = e.href;
    url.searchParams.set("what", "up");
    e.href = url.pathname + url.search;
    e.innerText = "△";
  } else if (e.classList.contains("dwd")) {
    e.classList.add("dw");
    e.classList.remove("dwd");
    new Image().src = e.href;
    url.searchParams.set("what", "dw");
    e.href = url.pathname + url.search;
    e.innerText = "▽";
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
