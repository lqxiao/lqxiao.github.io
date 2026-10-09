# Hello, World — Relaunching My Homepage

I've rebuilt my personal homepage from scratch. It's a plain static site —
no build step, no framework — hosted on GitHub Pages.

## Why no framework?

For a personal academic page that changes a few times a year, the simplest
stack wins:

- **Zero build step** — edit a file, push, done.
- **Zero dependencies to rot** — plain HTML/CSS/JS doesn't break in five years.
- **Markdown blogging** — posts live in `posts/*.md` and render in the browser.

## How to write a new post

1. Create `posts/my-new-post.md` and write in Markdown.
2. Add an entry to `posts/posts.json`:

```json
{
  "slug": "my-new-post",
  "title": "My New Post",
  "date": "2026-10-10",
  "tags": ["research"]
}
```

3. Commit and push. That's it.

> Tip: entries in `posts.json` are sorted by date automatically — just append.
