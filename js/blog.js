// Blog engine: reads posts/posts.json for the index, renders posts/<slug>.md
// client-side with marked.js (loaded on demand on the post page only).
(function () {
  const scriptTag = document.currentScript;
  const mode = scriptTag ? scriptTag.dataset.mode : 'list';

  function fmtDate(iso) {
    const d = new Date(iso + 'T00:00:00');
    return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  }

  function fetchPosts() {
    return fetch('posts/posts.json')
      .then(function (r) { return r.json(); })
      .then(function (posts) {
        return posts.sort(function (a, b) { return b.date.localeCompare(a.date); });
      });
  }

  function renderList(posts, container) {
    container.innerHTML = posts.map(function (p) {
      const tags = (p.tags || []).map(function (t) {
        return '<span class="tag">' + t + '</span>';
      }).join('');
      return '<div class="post-item">' +
        '<span class="post-date">' + fmtDate(p.date) + '</span>' +
        '<a class="post-title-link" href="post.html?p=' + encodeURIComponent(p.slug) + '">' + p.title + '</a>' +
        '<span class="post-tags">' + tags + '</span>' +
        '</div>';
    }).join('');
  }

  function loadMarked() {
    return new Promise(function (resolve, reject) {
      if (window.marked) return resolve();
      const s = document.createElement('script');
      s.src = 'https://cdn.jsdelivr.net/npm/marked@12/marked.min.js';
      s.onload = resolve;
      s.onerror = reject;
      document.head.appendChild(s);
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    if (mode === 'recent') {
      const el = document.getElementById('recent-posts-list');
      if (!el) return;
      fetchPosts().then(function (posts) { renderList(posts.slice(0, 3), el); });

    } else if (mode === 'list') {
      const el = document.getElementById('post-list');
      if (!el) return;
      fetchPosts().then(function (posts) { renderList(posts, el); });

    } else if (mode === 'post') {
      const slug = new URLSearchParams(location.search).get('p');
      const titleEl = document.getElementById('post-title');
      const metaEl = document.getElementById('post-meta');
      const bodyEl = document.getElementById('post-body');
      if (!slug || !bodyEl) return;

      Promise.all([fetchPosts(), loadMarked()]).then(function (results) {
        const meta = results[0].find(function (p) { return p.slug === slug; });
        if (!meta) {
          bodyEl.innerHTML = '<p>Post not found. <a href="blog.html">Back to all posts</a>.</p>';
          return;
        }
        document.title = meta.title + ' — Liqiang Xiao';
        var desc = document.querySelector('meta[name="description"]') ||
          document.head.appendChild(Object.assign(document.createElement('meta'), { name: 'description' }));
        desc.setAttribute('content', meta.title + ' — a blog post by Liqiang Xiao on ' +
          ((meta.tags || []).join(', ') || 'machine learning') + '.');
        titleEl.textContent = meta.title;
        metaEl.textContent = fmtDate(meta.date) +
          ((meta.tags && meta.tags.length) ? ' · ' + meta.tags.join(', ') : '');

        return fetch('posts/' + slug + '.md')
          .then(function (r) {
            if (!r.ok) throw new Error('not found');
            return r.text();
          })
          .then(function (md) {
            // Strip the first H1 — the page already shows the title.
            md = md.replace(/^#\s.*\n/, '');
            bodyEl.innerHTML = marked.parse(md);
            bodyEl.querySelectorAll('img').forEach(function (img) {
              img.loading = 'lazy';
              img.decoding = 'async';
            });
            if (window.MathJax && MathJax.typesetPromise) {
              MathJax.typesetPromise([bodyEl]);
            }
          });
      }).catch(function () {
        bodyEl.innerHTML = '<p>Failed to load this post. <a href="blog.html">Back to all posts</a>.</p>';
      });
    }
  });
})();
