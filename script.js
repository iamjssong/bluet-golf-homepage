const supabaseUrl = "https://jnkvbyixtivlkpvrctms.supabase.co";
const supabaseKey = "sb_publishable_nSQmqEcMpe_y7ZciISLe0A_zN_2w3i4";
const supabase = window.supabase.createClient(supabaseUrl, supabaseKey);
const postList = document.querySelector("#post-list");
const emptyPosts = document.querySelector("#empty-posts");
const dialog = document.querySelector("#post-dialog");
const form = document.querySelector("#post-form");
const authDialog = document.querySelector("#auth-dialog");
const authForm = document.querySelector("#auth-form");
const authError = document.querySelector("#auth-error");
const adminLogin = document.querySelector("#admin-login");
const adminLogout = document.querySelector("#admin-logout");
const openPost = document.querySelector("#open-post");
const posts = async () => {
  const { data, error } = await supabase.from("news").select("title, content, published_at").eq("published", true).order("published_at", { ascending: false });
  if (error) throw error;
  return data;
};
const renderPosts = async () => {
  const items = await posts();
  postList.innerHTML = items.map((post, index) => `<article class="post"><span class="post-num">${String(index + 1).padStart(2, "0")}</span><div><h3>${escapeHtml(post.title)}</h3><p>${escapeHtml(post.content)}</p></div><time class="post-date">${new Intl.DateTimeFormat("ko-KR").format(new Date(post.published_at))}</time></article>`).join("");
  emptyPosts.hidden = items.length > 0;
};
const escapeHtml = (value) => value.replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" }[char]));
const updateAuthUi = (session) => {
  const authenticated = Boolean(session);
  adminLogin.hidden = authenticated;
  adminLogout.hidden = !authenticated;
  openPost.hidden = !authenticated;
};
const showAuthError = (message) => {
  authError.textContent = message;
  authError.hidden = false;
};
adminLogin.addEventListener("click", () => {
  authError.hidden = true;
  authDialog.showModal();
});
adminLogout.addEventListener("click", async () => {
  const { error } = await supabase.auth.signOut();
  if (error) showAuthError("로그아웃하지 못했습니다.");
});
openPost.addEventListener("click", () => dialog.showModal());
authForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const { error } = await supabase.auth.signInWithPassword({ email: authForm.elements.email.value.trim(), password: authForm.elements.password.value });
  if (error) {
    showAuthError("이메일 또는 비밀번호를 확인하세요.");
    return;
  }
  authForm.reset();
  authDialog.close();
});
form.addEventListener("submit", (event) => {
  event.preventDefault();
  const title = form.elements.title.value.trim();
  const content = form.elements.content.value.trim();
  if (!title || !content) return;
  supabase.auth.getSession().then(async ({ data: { session } }) => {
    if (!session) return;
    const { error } = await supabase.from("news").insert({ title, content, author_id: session.user.id });
    if (error) {
      showAuthError("공지 게시 권한이 없습니다.");
      return;
    }
    form.reset();
    dialog.close();
    renderPosts().catch(() => {});
  });
});
document.querySelector(".menu-toggle").addEventListener("click", (event) => {
  const button = event.currentTarget;
  const expanded = button.getAttribute("aria-expanded") === "true";
  button.setAttribute("aria-expanded", String(!expanded));
  document.querySelector(".desktop-nav").classList.toggle("mobile-open", !expanded);
});
supabase.auth.onAuthStateChange((_event, session) => updateAuthUi(session));
supabase.auth.getSession().then(({ data: { session } }) => updateAuthUi(session));
renderPosts().catch(() => {
  emptyPosts.hidden = false;
  emptyPosts.textContent = "소식을 불러오지 못했습니다.";
});
