# Backend MPS y MRP

API de lectura para las tres tablas de la actividad en Supabase.
No necesita dependencias externas. Requiere Node.js 22 o posterior.

## Render

- Tipo: Web Service
- Runtime: Node
- Build command: `npm install`
- Start command: `npm start`
- Instance: Free
- Health check: `/health`
- Variables: `SUPABASE_URL` y `SUPABASE_PUBLISHABLE_KEY`

La clave publicable no es una clave administrativa. La base debe permitir
SELECT mediante RLS sobre las tres tablas de ejemplo antes de probar la API.
No usar service_role ni secret keys. No guardar claves en GitHub.

## Rutas GET

- `/`: descripcion y rutas
- `/health`: comprueba conexion con Supabase
- `/api/mps`: plan_mps
- `/api/recetas`: recetas
- `/api/mrp`: requerimientos_mrp
- `/api/resumen`: une los datos y comprueba el calculo

Solo lectura, hasta 100 filas por tabla. Datos de ejemplo academico.
No es un sistema de produccion para datos privados de un restaurante.
La necesidad bruta es una instantanea; no recalcula registros en la base.

## Pruebas

`npm test` verifica rutas, relaciones, metodos no permitidos y errores.
