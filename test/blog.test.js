import test from 'node:test';
import assert from 'node:assert/strict';
import { getPublicBlogPost, listPublicBlogPosts } from '../src/blog.js';

test('public blog reads only published public posts', async () => {
  const calls = [];
  const db = { prepare(sql) { calls.push(sql); return { bind() { return this; }, async all() { return { results: [{ id: 'id', title: 'Title', slug: 'title', subtitle: 'Subtitle', publish_at: '2026-10-30T00:00:00.000Z', thumbnail_data_url: '' }] }; }, async first() { return { id: 'id', title: 'Title', slug: 'title', subtitle: 'Subtitle', publish_at: '2026-10-30T00:00:00.000Z', thumbnail_data_url: '', content_markdown: '# Hello' }; } }; } };
  const list = await listPublicBlogPosts(db);
  assert.equal(list[0].slug, 'title');
  const post = await getPublicBlogPost(db, 'TITLE');
  assert.equal(post.contentMarkdown, '# Hello');
  assert.ok(calls.every((sql) => sql.includes("status = 'published'") && sql.includes('is_public = 1')));
});
