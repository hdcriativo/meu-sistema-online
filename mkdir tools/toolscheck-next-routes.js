/* File: tools/check-next-routes.js
   Instalar: npm i node-fetch@2 fast-glob
   Uso: node tools/check-next-routes.js --structure ./estrutura_projeto.txt --host http://localhost:3000
   Saída: ./route-check-report.json (detalhes de status por rota)
*/

const fs = require('fs');
const path = require('path');
const fetch = require('node-fetch'); // node-fetch v2
const argv = require('minimist')(process.argv.slice(2));

const structurePath = argv.structure || './estrutura_projeto.txt';
const host = argv.host || 'http://localhost:3000';
const out = argv.out || './route-check-report.json';

if (!fs.existsSync(structurePath)) {
  console.error('Erro: arquivo de estrutura não encontrado em', structurePath);
  process.exit(1);
}

const text = fs.readFileSync(structurePath, 'utf8');

// --- 1) Extrair caminhos a partir de linhas com app/<segmentos>/page.tsx ou app/<segmentos>/[param]/page.tsx
const lines = text.split(/\r?\n/).map(l => l.trim()).filter(Boolean);

// normalizar separadores Windows
const normalized = lines.map(l => l.replace(/\\/g, '/'));

const appPrefix = '/app/';
const routesSet = new Set();

for (const line of normalized) {
  const idx = line.indexOf(appPrefix);
  if (idx === -1) continue;
  const relative = line.slice(idx + appPrefix.length); // ex: 'agendamentos/page.tsx'
  // buscamos apenas entradas com page.tsx (rotas)
  if (/\/page\.tsx$/.test(relative)) {
    const routePart = relative.replace(/\/page\.tsx$/, ''); // ex 'agendamentos' or 'activate/[token]'
    // converter segment dynamic [token] -> :token for human friendly, and into actual URL pattern we will test:
    // We'll produce two forms: path with bracket removed and path with placeholder 'sample'
    const routePath = '/' + routePart;
    routesSet.add(routePath);
  }
}

// Adicional: incluir root '/' se houver app/page.tsx
if (normalized.some(l => /\/app\/page\.tsx$/.test(l) || /^app\/page\.tsx$/.test(l) )) {
  routesSet.add('/');
}

// Convert set to list and create test URLs
const routes = Array.from(routesSet).map(r => {
  // handle dynamic segment: replace [param] with 'sample' placeholder
  const urlForTest = r.replace(/\[([^\]]+)\]/g, (_, name) => {
    // heurística: if name includes 'id' or 'token' choose sample values
    if (/token/i.test(name)) return 'SAMPLE_TOKEN';
    if (/id/i.test(name)) return '1';
    return 'sample';
  });
  return { route: r, testPath: urlForTest };
});

if (routes.length === 0) {
  console.error('Nenhuma rota extraída do arquivo de estrutura. Verifique se o arquivo contém caminhos para app/<rota>/page.tsx');
  process.exit(1);
}

console.log('Rotas agrupadas para teste:', routes.length);

// --- 2) Função que testa cada rota com timeout
const timeoutMs = argv.timeout ? parseInt(argv.timeout,10) : 10000;

async function testRoute(routeObj) {
  const url = host.replace(/\/$/, '') + routeObj.testPath;
  const start = Date.now();
  let status = null;
  let ok = false;
  let bodySnippet = '';
  try {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeoutMs);
    const res = await fetch(url, { method: 'GET', signal: controller.signal });
    clearTimeout(id);
    status = res.status;
    ok = res.ok;
    // tenta extrair pequeno snippet do body para depuração (texto)
    const text = (await res.text()).slice(0, 2000);
    bodySnippet = text.replace(/\s+/g, ' ').slice(0, 800);
  } catch (err) {
    bodySnippet = String(err.message || err);
  } finally {
    const elapsed = Date.now() - start;
    return { route: routeObj.route, testPath: routeObj.testPath, url, status, ok, bodySnippet, elapsed };
  }
}

(async () => {
  const results = [];
  for (const r of routes) {
    process.stdout.write(`Testando ${r.testPath} ... `);
    // eslint-disable-next-line no-await-in-loop
    const res = await testRoute(r);
    results.push(res);
    console.log(`${res.status || 'ERR'} (${res.elapsed}ms)`);
  }
  fs.writeFileSync(out, JSON.stringify({ host, generatedAt: new Date().toISOString(), results }, null, 2), 'utf8');
  console.log('Relatório salvo em', out);
  // exibir resumo
  const failed = results.filter(x => !x.ok);
  console.log(`Total: ${results.length} — Falhas: ${failed.length}`);
  if (failed.length > 0) {
    console.log('Rotas com problemas:');
    failed.forEach(f => console.log(` - ${f.testPath} -> ${f.status || 'ERR'}  (${f.bodySnippet.slice(0,120).replace(/\n/g,' ')})`));
  }
})();

