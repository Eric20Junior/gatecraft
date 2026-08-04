'use strict';

const fs = require('fs');
const path = require('path');

// Stack detection. The point is to pre-fill PROJECT_CONTEXT.md's technology section
// so the first thing an agent reads is true rather than `{{placeholder}}`.
//
// Detection is deliberately shallow: read manifest files, do not execute anything,
// do not install anything, do not hit the network. A wrong guess costs a line the
// user has to correct; running a build tool to find out would cost their trust.

const readJSON = (p) => {
  try {
    return JSON.parse(fs.readFileSync(p, 'utf8'));
  } catch {
    return null;
  }
};
const readText = (p) => {
  try {
    return fs.readFileSync(p, 'utf8');
  } catch {
    return '';
  }
};
const has = (root, f) => fs.existsSync(path.join(root, f));

// dependency name -> label. Ordered most-specific first: Next implies React, so
// reporting both is noise. First match in each group wins.
const JS_FRAMEWORKS = [
  ['next', 'Next.js'],
  ['nuxt', 'Nuxt'],
  ['@remix-run/react', 'Remix'],
  ['@angular/core', 'Angular'],
  ['@sveltejs/kit', 'SvelteKit'],
  ['svelte', 'Svelte'],
  ['astro', 'Astro'],
  ['solid-js', 'Solid'],
  ['react-native', 'React Native'],
  ['expo', 'Expo'],
  ['electron', 'Electron'],
  ['vue', 'Vue'],
  ['react', 'React'],
  ['@nestjs/core', 'NestJS'],
  ['fastify', 'Fastify'],
  ['koa', 'Koa'],
  ['hono', 'Hono'],
  ['express', 'Express'],
];

const JS_DATA = [
  ['prisma', 'Prisma'],
  ['drizzle-orm', 'Drizzle'],
  ['typeorm', 'TypeORM'],
  ['sequelize', 'Sequelize'],
  ['mongoose', 'MongoDB (Mongoose)'],
  ['knex', 'Knex'],
  ['pg', 'PostgreSQL'],
  ['mysql2', 'MySQL'],
  ['better-sqlite3', 'SQLite'],
  ['redis', 'Redis'],
  ['ioredis', 'Redis'],
];

const JS_TEST = [
  ['vitest', 'Vitest'],
  ['jest', 'Jest'],
  ['@playwright/test', 'Playwright'],
  ['cypress', 'Cypress'],
  ['mocha', 'Mocha'],
  ['ava', 'AVA'],
  ['node:test', 'node:test'],
];

const JS_AI = [
  ['@anthropic-ai/sdk', 'Anthropic SDK'],
  ['@anthropic-ai/claude-agent-sdk', 'Claude Agent SDK'],
  ['openai', 'OpenAI SDK'],
  ['langchain', 'LangChain'],
  ['@langchain/core', 'LangChain'],
  ['llamaindex', 'LlamaIndex'],
  ['ai', 'Vercel AI SDK'],
  ['@modelcontextprotocol/sdk', 'MCP SDK'],
];

const PY_FRAMEWORKS = [
  ['fastapi', 'FastAPI'],
  ['django', 'Django'],
  ['flask', 'Flask'],
  ['litestar', 'Litestar'],
  ['starlette', 'Starlette'],
  ['streamlit', 'Streamlit'],
];
const PY_AI = [
  ['anthropic', 'Anthropic SDK'],
  ['openai', 'OpenAI SDK'],
  ['langchain', 'LangChain'],
  ['llama-index', 'LlamaIndex'],
  ['transformers', 'Transformers'],
  ['torch', 'PyTorch'],
  ['tensorflow', 'TensorFlow'],
];
const PY_DATA = [
  ['sqlalchemy', 'SQLAlchemy'],
  ['psycopg', 'PostgreSQL'],
  ['psycopg2', 'PostgreSQL'],
  ['asyncpg', 'PostgreSQL'],
  ['pymongo', 'MongoDB'],
  ['redis', 'Redis'],
];
const PY_TEST = [
  ['pytest', 'pytest'],
  ['unittest2', 'unittest'],
  ['nose', 'nose'],
];

function pickFirst(pairs, present) {
  for (const [key, label] of pairs) if (present.has(key)) return label;
  return null;
}
function pickAll(pairs, present) {
  const out = [];
  for (const [key, label] of pairs) if (present.has(key) && !out.includes(label)) out.push(label);
  return out;
}

function detectNode(root, f) {
  const pkg = readJSON(path.join(root, 'package.json'));
  if (!pkg) return;

  const deps = new Set([
    ...Object.keys(pkg.dependencies || {}),
    ...Object.keys(pkg.devDependencies || {}),
    ...Object.keys(pkg.peerDependencies || {}),
  ]);

  const ts = deps.has('typescript') || has(root, 'tsconfig.json');
  f.languages.push(ts ? 'TypeScript' : 'JavaScript');

  const framework = pickFirst(JS_FRAMEWORKS, deps);
  if (framework) f.frameworks.push(framework);
  f.datastores.push(...pickAll(JS_DATA, deps));
  f.testing.push(...pickAll(JS_TEST, deps));
  f.ai.push(...pickAll(JS_AI, deps));

  if (has(root, 'pnpm-lock.yaml')) f.packageManagers.push('pnpm');
  else if (has(root, 'yarn.lock')) f.packageManagers.push('yarn');
  else if (has(root, 'bun.lockb') || has(root, 'bun.lock')) f.packageManagers.push('bun');
  else if (has(root, 'package-lock.json')) f.packageManagers.push('npm');

  if (pkg.workspaces || has(root, 'pnpm-workspace.yaml') || has(root, 'turbo.json')) {
    f.notes.push('monorepo');
  }
  if (pkg.name) f.name = pkg.name;
  if (pkg.description) f.description = pkg.description;
}

function detectPython(root, f) {
  const files = ['pyproject.toml', 'requirements.txt', 'setup.py', 'setup.cfg', 'Pipfile'];
  const blob = files
    .map((x) => readText(path.join(root, x)))
    .join('\n')
    .toLowerCase();
  if (!blob.trim()) return;

  f.languages.push('Python');
  // Substring matching against the manifest blob: coarse, but a dependency name
  // appearing anywhere in a requirements file is a reliable enough signal, and it
  // avoids writing a TOML and a requirements parser for a hint.
  const present = new Set();
  for (const [key] of [...PY_FRAMEWORKS, ...PY_AI, ...PY_DATA, ...PY_TEST]) {
    if (blob.includes(key)) present.add(key);
  }
  const fw = pickFirst(PY_FRAMEWORKS, present);
  if (fw) f.frameworks.push(fw);
  f.ai.push(...pickAll(PY_AI, present));
  f.datastores.push(...pickAll(PY_DATA, present));
  f.testing.push(...pickAll(PY_TEST, present));

  if (has(root, 'poetry.lock')) f.packageManagers.push('Poetry');
  else if (has(root, 'uv.lock')) f.packageManagers.push('uv');
  else if (has(root, 'Pipfile.lock')) f.packageManagers.push('pipenv');
}

function detectOthers(root, f) {
  if (has(root, 'go.mod')) {
    f.languages.push('Go');
    const mod = readText(path.join(root, 'go.mod'));
    if (mod.includes('gin-gonic')) f.frameworks.push('Gin');
    else if (mod.includes('labstack/echo')) f.frameworks.push('Echo');
    else if (mod.includes('gofiber')) f.frameworks.push('Fiber');
  }
  if (has(root, 'Cargo.toml')) {
    f.languages.push('Rust');
    const c = readText(path.join(root, 'Cargo.toml'));
    if (c.includes('axum')) f.frameworks.push('Axum');
    else if (c.includes('actix-web')) f.frameworks.push('Actix Web');
    else if (c.includes('rocket')) f.frameworks.push('Rocket');
    if (c.includes('tokio')) f.notes.push('async runtime: Tokio');
  }
  if (has(root, 'pom.xml') || has(root, 'build.gradle') || has(root, 'build.gradle.kts')) {
    const kt = has(root, 'build.gradle.kts');
    f.languages.push(kt ? 'Kotlin/JVM' : 'Java');
    const b = readText(path.join(root, 'pom.xml')) + readText(path.join(root, 'build.gradle'));
    if (b.includes('spring-boot')) f.frameworks.push('Spring Boot');
  }
  if (has(root, 'Gemfile')) {
    f.languages.push('Ruby');
    if (readText(path.join(root, 'Gemfile')).includes('rails')) f.frameworks.push('Rails');
  }
  if (has(root, 'composer.json')) {
    f.languages.push('PHP');
    const c = readText(path.join(root, 'composer.json'));
    if (c.includes('laravel/framework')) f.frameworks.push('Laravel');
    else if (c.includes('symfony/')) f.frameworks.push('Symfony');
  }
  if (has(root, 'mix.exs')) {
    f.languages.push('Elixir');
    if (readText(path.join(root, 'mix.exs')).includes(':phoenix')) f.frameworks.push('Phoenix');
  }
  if (has(root, 'pubspec.yaml')) {
    f.languages.push('Dart');
    if (readText(path.join(root, 'pubspec.yaml')).includes('flutter:')) f.frameworks.push('Flutter');
  }
  if (has(root, 'Package.swift') || has(root, 'Podfile')) f.languages.push('Swift');
  if (has(root, 'CMakeLists.txt')) f.languages.push('C/C++');
}

function detectOps(root, f) {
  if (has(root, 'Dockerfile') || has(root, 'docker-compose.yml') || has(root, 'compose.yaml')) {
    f.infra.push('Docker');
  }
  if (has(root, '.github/workflows')) f.ci.push('GitHub Actions');
  if (has(root, '.gitlab-ci.yml')) f.ci.push('GitLab CI');
  if (has(root, 'Jenkinsfile')) f.ci.push('Jenkins');
  if (has(root, '.circleci')) f.ci.push('CircleCI');

  for (const [file, label] of [
    ['vercel.json', 'Vercel'],
    ['netlify.toml', 'Netlify'],
    ['fly.toml', 'Fly.io'],
    ['render.yaml', 'Render'],
    ['app.yaml', 'Google App Engine'],
    ['serverless.yml', 'Serverless Framework'],
    ['wrangler.toml', 'Cloudflare Workers'],
    ['railway.json', 'Railway'],
  ]) {
    if (has(root, file)) f.infra.push(label);
  }
  if (has(root, 'terraform') || has(root, 'main.tf')) f.infra.push('Terraform');
  if (has(root, 'k8s') || has(root, 'kubernetes') || has(root, 'helm')) f.infra.push('Kubernetes');
  if (has(root, '.ai') === false && has(root, 'CLAUDE.md')) f.notes.push('has CLAUDE.md');
}

/** Which AI coding tools this repo is already configured for. */
function detectAgents(root) {
  const found = [];
  for (const [p, label] of [
    ['AGENTS.md', 'AGENTS.md'],
    ['CLAUDE.md', 'Claude Code'],
    ['.claude', 'Claude Code'],
    ['.cursorrules', 'Cursor'],
    ['.cursor', 'Cursor'],
    ['.windsurfrules', 'Windsurf'],
    ['.github/copilot-instructions.md', 'GitHub Copilot'],
    ['.aider.conf.yml', 'Aider'],
    ['.continue', 'Continue'],
    ['GEMINI.md', 'Gemini CLI'],
  ]) {
    if (has(root, p) && !found.includes(label)) found.push(label);
  }
  return found;
}

function detect(root) {
  const f = {
    name: path.basename(root),
    description: null,
    languages: [],
    frameworks: [],
    datastores: [],
    testing: [],
    ai: [],
    infra: [],
    ci: [],
    packageManagers: [],
    notes: [],
    agents: detectAgents(root),
    vcs: has(root, '.git') ? 'git' : has(root, '.hg') ? 'mercurial' : null,
  };

  detectNode(root, f);
  detectPython(root, f);
  detectOthers(root, f);
  detectOps(root, f);

  for (const k of Object.keys(f)) {
    if (Array.isArray(f[k])) f[k] = [...new Set(f[k])];
  }
  f.empty =
    f.languages.length === 0 && f.frameworks.length === 0 && f.infra.length === 0;
  return f;
}

/** One-line summary for the installer output. */
function summary(f) {
  const parts = [
    ...f.languages,
    ...f.frameworks,
    ...f.datastores.slice(0, 2),
    ...f.testing.slice(0, 1),
    ...f.ai.slice(0, 1),
    ...f.infra.slice(0, 2),
  ];
  return parts.length ? parts.join(', ') : 'nothing recognizable yet';
}

module.exports = { detect, summary, detectAgents };
