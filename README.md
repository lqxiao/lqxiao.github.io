# lqxiao.github.io

Personal academic homepage + blog. Plain HTML/CSS/JS — no build step.

## Structure

```
index.html        # Homepage: about, news, research interests, publications
blog.html         # Blog index (reads posts/posts.json)
post.html         # Blog post page (renders posts/<slug>.md via marked.js)
posts/posts.json  # Blog post metadata (slug, title, date, tags)
posts/*.md        # Blog post content in Markdown
css/style.css     # All styles, light + dark theme
js/theme.js       # Dark mode toggle
js/blog.js        # Blog list / post rendering
```

## Editing content

- **Bio / links / publications**: edit `index.html` directly. Highlighted
  (yellow) text marks placeholders — replace the text and remove the
  `class="placeholder"` / `<span class="placeholder">` wrapper.
- **Profile photo**: currently uses your GitHub avatar; to use a custom photo,
  put it in `images/` and update the `<img>` in `index.html`.

## Writing a blog post

1. Create `posts/my-post.md` (Markdown; the first `# H1` is stripped since the
   page shows the title from metadata).
2. Append to `posts/posts.json`:
   ```json
   { "slug": "my-post", "title": "My Post", "date": "2026-10-10", "tags": ["research"] }
   ```
3. Commit and push.

## Preview locally

```sh
python3 -m http.server 8000
# open http://localhost:8000
```

(A local server is needed because the blog fetches JSON/Markdown files.)

## Deploy

Push to the `main` branch of `lqxiao/lqxiao.github.io` with GitHub Pages
enabled (Settings → Pages → Deploy from branch → main → /root).
