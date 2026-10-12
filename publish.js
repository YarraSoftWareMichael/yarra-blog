// Pulls one InfoNode node, turns it into a blog post, builds the site, and
// drafts a LinkedIn post linking to it. Run: node publish.js <nodeId>
//
// Pipeline: InfoNode node (tag "blog") -> content/<slug>.json+.html -> build.js
//         -> git commit (push left to the owner) -> LinkedIn draft via InfoNode's
//            existing /linkedin route, pointed at the live URL.
import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';

const INFONODE_URL = process.env.INFONODE_URL || 'http://localhost:8082';
const BLOG_URL = process.env.BLOG_URL || 'https://blog.yarrasoftware.com';
const nodeId = process.argv[2];

if (!nodeId) {
  console.error('Usage: node publish.js <infonode-id>');
  process.exit(1);
}

function slugify(title) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function toHtml(content) {
  return content
    .split(/\n\s*\n/)
    .map(para => `<p>${para.trim().replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')}</p>`)
    .join('\n');
}

function excerptOf(content, max = 160) {
  const flat = content.replace(/\s+/g, ' ').trim();
  return flat.length > max ? flat.slice(0, max).trim() + '…' : flat;
}

const res = await fetch(`${INFONODE_URL}/api/nodes/${nodeId}`);
if (!res.ok) {
  console.error(`Could not fetch node ${nodeId}: ${res.status} ${res.statusText}`);
  process.exit(1);
}
const node = await res.json();

if (!node.tags?.includes('blog')) {
  console.error(`Node "${node.title}" is not tagged "blog" — add the tag in InfoNode first.`);
  process.exit(1);
}

const slug = slugify(node.title);
const date = (node.metadata?.createdAt || new Date().toISOString()).slice(0, 10);
const tags = node.tags.filter(t => t !== 'blog');

fs.writeFileSync(
  path.join('content', `${slug}.json`),
  JSON.stringify({ slug, title: node.title, date, excerpt: excerptOf(node.content), tags, nodeId: node.id }, null, 2)
);
fs.writeFileSync(path.join('content', `${slug}.html`), toHtml(node.content));

execSync('node build.js', { stdio: 'inherit' });

execSync('git add content');
execSync(`git commit -m "Publish: ${node.title}"`, { stdio: 'inherit' });
console.log('\nCommitted locally. Run `git push` to go live (Netlify auto-deploys on push).');

const liveUrl = `${BLOG_URL}/${slug}/`;
const li = await fetch(`${INFONODE_URL}/api/nodes/${node.id}/linkedin`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    customMessage: `New post: ${node.title}\n\nRead it here: ${liveUrl}`,
    authorName: 'Yarra Software',
    authorTitle: 'Healthcare software'
  })
});
if (li.ok) {
  const { linkedinPost } = await li.json();
  console.log(`LinkedIn draft saved: ${linkedinPost.savedTo}`);
  console.log('Edit it down (it currently repeats the full article below the link), then paste into LinkedIn manually — no auto-post exists.');
} else {
  console.warn(`LinkedIn draft generation failed: ${li.status} ${li.statusText} (is InfoNode's server running?)`);
}
