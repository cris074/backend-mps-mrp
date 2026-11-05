const endpoints = [
  ['/', 'Informacion', 'Consultar la informacion y las rutas del backend'],
  ['/health', 'Estado', 'Comprobar la conexion con Supabase'],
  ['/api/mps', 'Tablas', 'Consultar el plan maestro de produccion'],
  ['/api/recetas', 'Tablas', 'Consultar los ingredientes por plato'],
  ['/api/mrp', 'Tablas', 'Consultar los requerimientos de materiales'],
  ['/api/resumen', 'Resumen', 'Relacionar las tres tablas y verificar los calculos']
];

export const openapi = {
  openapi: '3.0.3',
  info: {
    title: 'Backend MPS y MRP', version: '1.1.0',
    description: 'API de lectura conectada a Supabase. Datos ilustrativos de la actividad. Abra una ruta, pulse Try it out y luego Execute para probarla.'
  },
  servers: [{ url: '/', description: 'Backend actual en Render' }],
  paths: Object.fromEntries(endpoints.map(([path, tag, summary]) => [path, {
    get: {
      tags: [tag], summary,
      operationId: path === '/' ? 'informacion' : path.slice(1).replaceAll('/', '_'),
      responses: {
        200: {
          description: 'Consulta realizada correctamente',
          content: { 'application/json': { schema: { type: 'object', additionalProperties: true } } }
        },
        ...(path === '/' ? {} : { 502: {
          description: 'No se pudo consultar Supabase',
          content: { 'application/json': { schema: {
            type: 'object', properties: { error: { type: 'string' } }
          } } }
        } })
      }
    }
  }]))
};

export const docsHtml = `<!doctype html>
<html lang="es"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Backend MPS y MRP - Documentacion</title>
<link rel="stylesheet" href="https://unpkg.com/swagger-ui-dist@5.17.14/swagger-ui.css">
<style>body{margin:0;background:#fafafa}.swagger-ui .topbar{display:none}</style>
</head><body><div id="swagger-ui"></div>
<noscript>Active JavaScript o consulte <a href="/openapi.json">openapi.json</a>.</noscript>
<script src="https://unpkg.com/swagger-ui-dist@5.17.14/swagger-ui-bundle.js"></script>
<script>
window.onload=()=>{
 if(typeof SwaggerUIBundle==='undefined'){
  document.getElementById('swagger-ui').innerHTML='<p>No se pudo cargar la interfaz. <a href="/openapi.json">Ver especificacion</a></p>';
  return;
 }
 SwaggerUIBundle({url:'/openapi.json',dom_id:'#swagger-ui',deepLinking:true,
  validatorUrl:null,persistAuthorization:false,tryItOutEnabled:false});
};
</script></body></html>`;
