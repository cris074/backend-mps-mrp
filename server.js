import { createServer } from 'node:http';
import { pathToFileURL } from 'node:url';

const routes = new Map([
  ['/api/mps', 'plan_mps'],
  ['/api/recetas', 'recetas'],
  ['/api/mrp', 'requerimientos_mrp']
]);

export function createApp({ supabaseUrl, supabaseKey, fetchImpl = fetch }) {
  async function readTable(table) {
    const url = new URL(`/rest/v1/${table}`, supabaseUrl);
    url.search = new URLSearchParams({ select: '*', order: 'id.asc', limit: '100' });
    const response = await fetchImpl(url, {
      headers: { apikey: supabaseKey },
      signal: AbortSignal.timeout(10000)
    });
    if (!response.ok) throw new Error(`Supabase responded ${response.status}`);
    const rows = await response.json();
    if (!Array.isArray(rows)) throw new Error('Unexpected database response');
    return rows;
  }

  return createServer(async (request, response) => {
    response.setHeader('Content-Type', 'application/json; charset=utf-8');
    response.setHeader('Cache-Control', 'no-store');
    response.setHeader('X-Content-Type-Options', 'nosniff');
    const send = (status, data) => {
      response.writeHead(status);
      response.end(JSON.stringify(data, null, 2));
    };
    if (request.method !== 'GET') {
      response.setHeader('Allow', 'GET');
      return send(405, { error: 'Solo se permiten consultas GET' });
    }
    const path = new URL(request.url, 'http://localhost').pathname;
    try {
      if (path === '/') return send(200, {
        servicio: 'Backend MPS y MRP',
        descripcion: 'API de lectura del ejemplo academico en Supabase',
        rutas: ['/health', ...routes.keys(), '/api/resumen']
      });
      if (path === '/health') {
        await readTable('plan_mps');
        return send(200, { estado: 'ok', base_de_datos: 'Supabase conectada' });
      }
      if (routes.has(path)) {
        const datos = await readTable(routes.get(path));
        return send(200, { tabla: routes.get(path), registros: datos.length, datos });
      }
      if (path === '/api/resumen') {
        const [planes, recetas, mrp] = await Promise.all(
          [...routes.values()].map(readTable)
        );
        const datos = mrp.map(row => {
          const plan = planes.find(p => String(p.id) === String(row.plan_mps_id));
          const receta = recetas.find(r => String(r.id) === String(row.receta_id));
          if (!plan || !receta) throw new Error('Missing related record');
          const esperado = Number(plan.total_porciones) * Number(receta.cantidad_por_plato_kg);
          return {
            plato: plan.plato,
            ingrediente: receta.ingrediente,
            porciones: plan.total_porciones,
            necesidad_bruta_kg: row.necesidad_bruta_kg,
            disponible_kg: row.disponible_kg,
            compra_propuesta_kg: row.compra_propuesta_kg,
            calculo_correcto: Math.abs(Number(row.necesidad_bruta_kg) - esperado) < 0.0005
          };
        });
        return send(200, { registros: datos.length, datos });
      }
      return send(404, { error: 'Ruta no encontrada' });
    } catch (error) {
      console.error('Error de consulta:', error.name);
      return send(502, { error: 'No se pudo consultar Supabase' });
    }
  });
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  const { SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY } = process.env;
  if (!SUPABASE_URL || !SUPABASE_PUBLISHABLE_KEY) {
    throw new Error('Configura SUPABASE_URL y SUPABASE_PUBLISHABLE_KEY');
  }
  const app = createApp({ supabaseUrl: SUPABASE_URL, supabaseKey: SUPABASE_PUBLISHABLE_KEY });
  app.listen(Number(process.env.PORT || 3000), '0.0.0.0', () => {
    console.log('Backend MPS y MRP listo');
  });
}
