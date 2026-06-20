# AsterTune 🎵

Reproductor de música 100% gratuito y funcional, con canciones **completas en tiempo real** (no previews de 30s), usando la API gratuita de [Jamendo](https://www.jamendo.com) (catálogo libre / Creative Commons).

## Estructura

```
astertune/
├── index.html        ← App completa (UI + lógica)
├── public/
│   └── logo.png       ← Tu logo (AsterTune)
├── api/
│   └── jamendo.js      ← Endpoint serverless (Vercel Function) que llama a Jamendo
├── package.json
└── vercel.json
```

## Cómo funciona el audio completo

- El front-end **nunca** llama a Jamendo directamente: llama a `/api/jamendo`.
- `/api/jamendo.js` es una función serverless de Vercel que reenvía la búsqueda a Jamendo, agregando el `client_id` desde el servidor (así no queda expuesto en el navegador) y pide `audioformat=mp32` (192kbps, pista completa real, no preview).
- Jamendo es un catálogo de música libre/CC: artistas independientes que permiten streaming gratuito legal de sus canciones completas.

## Desplegar en Vercel (gratis)

1. Sube esta carpeta a un repo de GitHub (o usa `vercel` CLI directo desde la carpeta).
2. En [vercel.com](https://vercel.com) → **Add New Project** → importa el repo.
3. (Opcional pero recomendado) Crea tu propio `client_id` gratis en 2 minutos en
   https://devportal.jamendo.com → "Create an application", y en Vercel ve a
   **Project Settings → Environment Variables** y agrega:
   ```
   JAMENDO_CLIENT_ID = tu_client_id
   ```
   Si no configuras nada, la app funciona igual con un client_id público de pruebas
   de Jamendo (`709fa152`), pero con límites más bajos de uso.
4. Deploy. Listo — tu app queda en `https://tu-proyecto.vercel.app`.

### Desde la terminal (alternativa rápida)
```bash
npm i -g vercel
cd astertune
vercel --prod
```

## Notas

- No requiere base de datos ni backend propio: todo el estado (Me gusta, etc.) vive en `localStorage` del navegador.
- El endpoint `/api/jamendo` solo permite parámetros de búsqueda seguros (whitelist), nunca expone el client_id al cliente.
- Si quieres ampliar el catálogo, puedes combinar Jamendo con otras fuentes legales de audio completo gratis (por ejemplo Free Music Archive) agregando otra función en `/api/`.
