# Proyecto reparado - Casa Domenica

## Cambios aplicados

1. La pantalla pública `/pantalla` ya no exige login. Esto permite abrirla en una Smart TV o en una pestaña nueva sin que mande al login.
2. Se corrigió la carga de datos en Agenda y Pantalla para que lean del backend y, si el backend se cae temporalmente, usen una copia temporal del navegador en lugar de quedar en blanco.
3. Se corrigió el flujo de guardado de psicólogos con imagen. Antes la imagen se enviaba pesada en base64 y podía trabar o hacer fallar el guardado. Ahora el frontend valida y optimiza la imagen antes de enviarla al backend.
4. El formulario de psicólogos ya inicia con estado `Disponible` y consultorio `Disponible`, para evitar guardar formularios incompletos por no seleccionar esos campos.
5. Se agregó estado de `Guardando...` para evitar dobles clics mientras se guarda o actualiza.
6. Se corrigió la duplicación de contenedores en `Pantalla.jsx`.
7. Se corrigió el botón de cerrar sesión en Ajustes.
8. Se agregó timeout en las peticiones al backend para que no se quede colgado indefinidamente si el backend o MongoDB no responden.
9. Se mejoró el backend con validación de `MONGO_URI`, health check `/api/health`, CORS configurable y límite de JSON más amplio.

## Cómo correrlo

### Backend

```bash
cd backend
npm install
copy .env.example .env
npm run dev
```

Después edita `backend/.env` y coloca tu cadena real de MongoDB Atlas y tu `JWT_SECRET`.

### Frontend

```bash
cd frontend
npm install
npm run dev
```

La URL local será:

```text
http://localhost:5173
```

La pantalla para pacientes/TV será:

```text
http://localhost:5173/pantalla
```

## Verificación rápida

1. Enciende primero el backend.
2. Entra al frontend.
3. Agrega un psicólogo desde `Psicólogos`.
4. Sube una imagen JPG/PNG/WebP de preferencia.
5. Guarda.
6. Abre `Agenda` y `/pantalla`; debe aparecer el mismo registro.

## Nota sobre imágenes

Las imágenes se guardan optimizadas como texto base64 dentro del documento de MongoDB. Para evitar errores, usa imágenes normales de perfil y evita fotos muy pesadas. El sistema intenta reducirlas automáticamente.
