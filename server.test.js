import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createApp } from './server.js';

const tables = {
  plan_mps: [{ id: 1, plato: 'Pique', total_porciones: 40 }],
  recetas: [{ id: 1, ingrediente: 'Papa holandesa', cantidad_por_plato_kg: 0.9 }],
  requerimientos_mrp: [{ id: 1, plan_mps_id: 1, receta_id: 1, necesidad_bruta_kg: 36, disponible_kg: 6, compra_propuesta_kg: 30 }]
};

async function run(t, fetchImpl) {
  const server = createApp({ supabaseUrl: 'https://example.supabase.co', supabaseKey: 'test', fetchImpl });
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  t.after(() => new Promise(resolve => server.close(resolve)));
  return `http://127.0.0.1:${server.address().port}`;
}

test('consulta las tres tablas y relaciona correctamente el resumen', async t => {
  const root = await run(t, async url => {
    const table = url.pathname.split('/').pop();
    return Response.json(tables[table]);
  });
  for (const route of ['mps', 'recetas', 'mrp']) {
    const response = await fetch(`${root}/api/${route}`);
    assert.equal(response.status, 200);
    assert.equal((await response.json()).registros, 1);
  }
  const summary = await (await fetch(`${root}/api/resumen`)).json();
  assert.equal(summary.datos[0].compra_propuesta_kg, 30);
  assert.equal(summary.datos[0].calculo_correcto, true);
  assert.equal((await fetch(`${root}/api/mps`, { method: 'POST' })).status, 405);
  assert.equal((await fetch(`${root}/inexistente`)).status, 404);
  const docs = await fetch(`${root}/docs`);
  assert.equal(docs.status, 200);
  assert.match(docs.headers.get('content-type'), /text\/html/);
  assert.match(await docs.text(), /SwaggerUIBundle/);
  const spec = await (await fetch(`${root}/openapi.json`)).json();
  assert.equal(spec.openapi, '3.0.3');
  for (const route of ['/', '/health', '/api/mps', '/api/recetas', '/api/mrp', '/api/resumen']) {
    assert.ok(spec.paths[route].get.responses['200']);
  }
});

test('health detecta un fallo real de base de datos y no revela detalles', async t => {
  const root = await run(t, async () => new Response('private database error', { status: 401 }));
  const response = await fetch(`${root}/health`);
  assert.equal(response.status, 502);
  assert.deepEqual(await response.json(), { error: 'No se pudo consultar Supabase' });
});
