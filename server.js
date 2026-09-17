// Servidor local sem dependências para executar módulos ES em localhost.
const { createReadStream, existsSync, statSync } = require('node:fs');
const { createServer } = require('node:http');
const { extname, normalize, resolve, sep } = require('node:path');

const root = resolve(process.cwd());
const port = Number(process.env.PORT || 8080);
const mimeTypes = {
  '.css': 'text/css; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.svg': 'image/svg+xml'
};

createServer((request, response) => {
  const rawPath = decodeURIComponent((request.url || '/').split('?')[0]);
  const relativePath = rawPath === '/' ? 'index.html' : rawPath.replace(/^[/\\]+/, '');
  const filePath = resolve(root, normalize(relativePath));

  if (!filePath.startsWith(root + sep) || !existsSync(filePath) || !statSync(filePath).isFile()) {
    response.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
    response.end('Arquivo não encontrado.');
    return;
  }

  response.writeHead(200, {
    'Content-Type': mimeTypes[extname(filePath)] || 'application/octet-stream',
    'Cache-Control': 'no-store'
  });
  createReadStream(filePath).pipe(response);
}).listen(port, '127.0.0.1', () => {
  console.log(`Grand Fantasia disponível em http://localhost:${port}`);
});
