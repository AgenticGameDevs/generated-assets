import fs from 'node:fs';
import path from 'node:path';
import MarkdownIt from 'markdown-it';
const pages = [
  ['README.md', 'about.html', 'About'],
  ['workflows/README.md', 'workflows.html', 'Workflows'],
  ['LICENSE.md', 'licenses.html', 'Licenses'],
  ['CONTRIBUTING.md', 'contribute.html', 'Contribute'],
  ['GOVERNANCE.md', 'governance.html', 'Community'],
  ['AGENTS.md', 'agents.html', 'For agents'],
  ['docs/GUIDE.md', 'guide.html', 'Use the library'],
  ['docs/CATALOG.md', 'catalog-api.html', 'Catalog API'],
  ['docs/MAINTAINING.md', 'maintaining.html', 'Maintain the library'],
  ['CHANGELOG.md', 'changelog.html', 'Changelog'],
  ['learn/README.md', 'learn.html', 'Learn and contribute'],
  ['learn/ORGANIZE.md', 'organizing.html', 'Organize an asset library'],
  ['learn/TEXTURES.md', 'texture-guide.html', 'Build a texture set'],
  ['learn/MODELS.md', 'model-guide.html', 'Make a reusable prop'],
  ['learn/SOUNDS.md', 'sound-guide.html', 'Make a sound effect'],
  ['learn/RECIPE_TEMPLATE.md', 'recipe-template.html', 'Share a recipe'],
];
const destinations = new Map(pages.map(([source, target]) => [source, target]));
for (const [source, target, title] of pages) {
  // Raw HTML is disabled; markdown-it also rejects unsafe link protocols.
  const md = new MarkdownIt({ html: false, linkify: true });
  const original =
    md.renderer.rules.link_open ??
    ((tokens, index, options, env, self) => self.renderToken(tokens, index, options));
  md.renderer.rules.link_open = (tokens, index, options, env, self) => {
    const token = tokens[index],
      href = token.attrGet('href');
    if (href && !/^(https?:|mailto:|#)/i.test(href)) {
      const [file, fragment] = href.split('#'),
        resolved = path.posix.normalize(path.posix.join(path.posix.dirname(source), file));
      token.attrSet(
        'href',
        (destinations.get(resolved) ?? resolved) + (fragment ? '#' + fragment : ''),
      );
    }
    return original(tokens, index, options, env, self);
  };
  const body = md.render(fs.readFileSync(source, 'utf8'));
  fs.writeFileSync(
    target,
    `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${title} — Generated Assets</title><link rel="stylesheet" href="gallery.css"><link rel="stylesheet" href="docs.css"></head><body><header><a class="wordmark" href="./">GA<span> / OPEN ASSET LIBRARY</span></a><nav><a href="./">Gallery</a><a href="guide.html">Start here</a><a href="learn.html">Learn</a><a href="contribute.html">Contribute</a><a href="agents.html">For agents</a></nav></header><main class="documentation"><aside aria-label="Documentation"><a href="guide.html">Using assets</a><a href="catalog-api.html">Catalog API</a><a href="organizing.html">Organizing assets</a><a href="learn.html">Learn to create</a><a href="workflows.html">Workflow case studies</a><a href="contribute.html">Contributing</a><a href="governance.html">Community</a><a href="maintaining.html">Maintaining</a><a href="licenses.html">Licenses</a><a href="changelog.html">Changelog</a></aside><article>${body}<p class="edit-link"><a href="https://github.com/jonathanwmaddison/generated-assets/blob/main/${source}">View or improve this document on GitHub ↗</a></p></article></main></body></html>`,
  );
}
