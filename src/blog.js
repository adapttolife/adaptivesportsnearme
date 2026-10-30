const POST_LIMIT = 100;

function cleanSlug(value) {
  return String(value || "")
    .trim()
    .toLowerCase();
}

function publicRow(row) {
  return {
    id: row.id,
    title: row.title,
    slug: row.slug,
    subtitle: row.subtitle || "",
    publishAt: row.publish_at || null,
    thumbnailDataUrl: row.thumbnail_data_url || "",
    contentMarkdown: row.content_markdown || "",
  };
}

export async function listPublicBlogPosts(db) {
  const rows = await db
    .prepare(
      `SELECT id, title, slug, subtitle, publish_at, thumbnail_data_url
    FROM blog_posts
    WHERE status = 'published' AND is_public = 1 AND (publish_at IS NULL OR publish_at <= ?)
    ORDER BY publish_at DESC, created_at DESC
    LIMIT ?`,
    )
    .bind(new Date().toISOString(), POST_LIMIT)
    .all();
  return (rows.results || []).map((row) => ({
    id: row.id,
    title: row.title,
    slug: row.slug,
    subtitle: row.subtitle || "",
    publishAt: row.publish_at || null,
    thumbnailDataUrl: row.thumbnail_data_url || "",
  }));
}

export async function getPublicBlogPost(db, slug) {
  const row = await db
    .prepare(
      `SELECT id, title, slug, subtitle, publish_at, thumbnail_data_url, content_markdown
    FROM blog_posts
    WHERE slug = ? COLLATE NOCASE AND status = 'published' AND is_public = 1
      AND (publish_at IS NULL OR publish_at <= ?)
    LIMIT 1`,
    )
    .bind(cleanSlug(slug), new Date().toISOString())
    .first();
  return row ? publicRow(row) : null;
}
