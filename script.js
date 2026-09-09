const seedPosts = [
  { title: "BlueT Golf Company 웹사이트 오픈", content: "골프 Physical AI 상용화를 위한 BlueT의 새로운 여정을 시작합니다.", date: "2026.09.09" },
  { title: "골프장 파트너십 및 파일럿 문의 안내", content: "카트 도입과 AI 모빌리티 협업에 관심 있는 골프장 관계자분들의 문의를 기다립니다.", date: "2026.09.09" }
];
const storageKey = "bluet-golf-posts";
const postList = document.querySelector("#post-list");
const emptyPosts = document.querySelector("#empty-posts");
const dialog = document.querySelector("#post-dialog");
const form = document.querySelector("#post-form");
const posts = () => JSON.parse(localStorage.getItem(storageKey) || JSON.stringify(seedPosts));
const renderPosts = () => {
  const items = posts();
  postList.innerHTML = items.map((post, index) => `<article class="post"><span class="post-num">${String(index + 1).padStart(2, "0")}</span><div><h3>${escapeHtml(post.title)}</h3><p>${escapeHtml(post.content)}</p></div><time class="post-date">${post.date}</time></article>`).join("");
  emptyPosts.hidden = items.length > 0;
};
const escapeHtml = (value) => value.replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" }[char]));
document.querySelector("#open-post").addEventListener("click", () => dialog.showModal());
form.addEventListener("submit", (event) => {
  event.preventDefault();
  const title = form.elements.title.value.trim();
  const content = form.elements.content.value.trim();
  if (!title || !content) return;
  const date = new Intl.DateTimeFormat("ko-KR", { year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date()).replaceAll(" ", "").replaceAll(".", ".").replace(/\.$/, "");
  localStorage.setItem(storageKey, JSON.stringify([{ title, content, date }, ...posts()]));
  form.reset();
  dialog.close();
  renderPosts();
});
document.querySelector(".menu-toggle").addEventListener("click", (event) => {
  const button = event.currentTarget;
  const expanded = button.getAttribute("aria-expanded") === "true";
  button.setAttribute("aria-expanded", String(!expanded));
  document.querySelector(".desktop-nav").classList.toggle("mobile-open", !expanded);
});
renderPosts();
