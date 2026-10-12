const STYLE = `
:root { --navy:#30357A; --green:#00826B; --ink:#1d2033; --muted:#5b6075; --bg:#f6f7fb; --line:#e3e5ee; }
* { box-sizing:border-box; margin:0; padding:0; }
body { font:16px/1.6 system-ui,-apple-system,"Segoe UI",Roboto,sans-serif; color:var(--ink); background:#fff; }
a { color:var(--green); }
.wrap { max-width:760px; margin:0 auto; padding:0 20px; }
header { position:sticky; top:0; background:#fff; border-bottom:1px solid var(--line); z-index:10; }
header .wrap { max-width:1100px; display:flex; align-items:center; justify-content:space-between; height:64px; }
.logo { font-weight:800; font-size:22px; color:var(--navy); text-decoration:none; letter-spacing:-.5px; }
.logo span { color:var(--green); }
nav a { margin-left:22px; color:var(--ink); text-decoration:none; font-weight:500; }
nav a:hover { color:var(--green); }
main { padding:56px 0; }
h1 { font-size:36px; color:var(--navy); line-height:1.2; margin-bottom:10px; }
.meta { color:var(--muted); font-size:14px; margin-bottom:32px; }
.post-body h2 { font-size:24px; color:var(--navy); margin:32px 0 12px; }
.post-body p { margin-bottom:18px; }
.post-body ul, .post-body ol { margin:0 0 18px 24px; }
.tags { margin-top:40px; }
.tag { display:inline-block; background:var(--bg); border:1px solid var(--line); color:var(--muted); font-size:13px; padding:4px 10px; border-radius:20px; margin-right:6px; }
.list .wrap { max-width:1100px; }
.list h1 { margin-bottom:8px; }
.list .lead { color:var(--muted); font-size:18px; margin-bottom:36px; }
.cards { display:grid; grid-template-columns:repeat(auto-fill,minmax(300px,1fr)); gap:20px; }
.card { background:#fff; border:1px solid var(--line); border-top:4px solid var(--green); border-radius:8px; padding:24px; }
.card h3 { color:var(--navy); margin-bottom:8px; }
.card h3 a { text-decoration:none; color:inherit; }
.card p { color:var(--muted); font-size:15px; }
.card .meta { margin-top:10px; margin-bottom:0; }
footer { background:var(--ink); color:#aab; padding:30px 0; font-size:14px; }
footer a { color:#fff; }
@media (max-width:760px) { nav { display:none; } }
`;

const HEADER = `
<header>
  <div class="wrap">
    <a class="logo" href="https://new.yarrasoftware.com/">Yarra<span>Software</span></a>
    <nav>
      <a href="https://new.yarrasoftware.com/#products">Products</a>
      <a href="https://new.yarrasoftware.com/#services">Services</a>
      <a href="/">Blog</a>
      <a href="https://new.yarrasoftware.com/#contact">Contact</a>
    </nav>
  </div>
</header>`;

const FOOTER = `
<footer>
  <div class="wrap">© ${new Date().getFullYear()} Yarra Software Ltd · <a href="https://new.yarrasoftware.com/">yarrasoftware.com</a></div>
</footer>`;

function shell({ title, description, bodyClass, body }) {
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${title}</title>
<meta name="description" content="${description}">
<style>${STYLE}</style>
</head>
<body class="${bodyClass || ''}">
${HEADER}
${body}
${FOOTER}
</body>
</html>`;
}

export function postPage(post) {
  const tags = (post.tags || []).map(t => `<span class="tag">${t}</span>`).join('');
  const body = `
<main>
  <div class="wrap">
    <h1>${post.title}</h1>
    <div class="meta">${post.date}</div>
    <div class="post-body">${post.bodyHtml}</div>
    <div class="tags">${tags}</div>
  </div>
</main>`;
  return shell({ title: `${post.title} | Yarra Software Blog`, description: post.excerpt, body });
}

export function indexPage(posts) {
  const cards = posts.map(p => `
      <div class="card">
        <h3><a href="/${p.slug}/">${p.title}</a></h3>
        <p>${p.excerpt}</p>
        <p class="meta">${p.date}</p>
      </div>`).join('');
  const body = `
<main class="list">
  <div class="wrap">
    <h1>Blog</h1>
    <p class="lead">Notes on healthcare software, NHS digital transformation, and what we're building.</p>
    <div class="cards">${cards}</div>
  </div>
</main>`;
  return shell({ title: 'Yarra Software Blog', description: 'Healthcare software and NHS digital transformation, from the Yarra Software team.', body });
}
