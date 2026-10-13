import fs from 'node:fs';
import path from 'node:path';
import { postPage, indexPage } from './template.js';

const CONTENT_DIR = './content';
const DIST_DIR = './docs'; // GitHub Pages serves main:/docs

fs.rmSync(DIST_DIR, { recursive: true, force: true });
fs.mkdirSync(DIST_DIR, { recursive: true });

const posts = fs.readdirSync(CONTENT_DIR)
  .filter(f => f.endsWith('.json'))
  .map(f => {
    const meta = JSON.parse(fs.readFileSync(path.join(CONTENT_DIR, f), 'utf8'));
    const htmlFile = path.join(CONTENT_DIR, `${meta.slug}.html`);
    meta.bodyHtml = fs.readFileSync(htmlFile, 'utf8');
    return meta;
  })
  .sort((a, b) => b.date.localeCompare(a.date));

for (const post of posts) {
  const dir = path.join(DIST_DIR, post.slug);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, 'index.html'), postPage(post));
}

fs.writeFileSync(path.join(DIST_DIR, 'index.html'), indexPage(posts));
fs.writeFileSync(path.join(DIST_DIR, 'CNAME'), 'blog.yarrasoftware.com\n');
fs.writeFileSync(path.join(DIST_DIR, '.nojekyll'), '');

console.log(`Built ${posts.length} post(s) -> ${DIST_DIR}/`);
