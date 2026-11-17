# CRÓNICA — Simulador histórico de Fórmula 1

CRÓNICA permite iniciar una temporada en cualquier año disponible desde 1950 y simular la evolución de la Fórmula 1: pilotos, escuderías, circuitos, reglamentos y resultados.

## Ejecutar en local

Requisitos: Node.js 22 o una versión compatible con Vite 8.

```bash
npm install
npm run dev
```

Vite mostrará la dirección local para abrir la aplicación. Para validar la versión de producción:

```bash
npm run check
npm run build
npm run preview
```

## Publicar en GitHub y Vercel

1. Crea un repositorio en GitHub y sube el contenido de esta carpeta (incluido `package-lock.json`).
2. En Vercel, selecciona **Add New → Project** e importa ese repositorio.
3. Usa `npm install --no-audit --no-fund` como instalación y `npm run build` como comando de compilación. El adaptador Nitro genera la salida para Vercel.
4. No hacen falta claves API ni variables de entorno para ejecutar CRÓNICA.

## Partidas y datos

Las campañas se guardan en el almacenamiento local del navegador. No necesitan cuenta ni servidor externo. Por eso, las partidas quedan vinculadas al navegador y dispositivo donde se crean; no se sincronizan automáticamente entre dispositivos. Borrar los datos del sitio en el navegador también puede borrar la partida.
