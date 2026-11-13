# CRÓNICA — Simulador histórico de Fórmula 1

Aplicación web independiente para crear líneas temporales alternativas de la Fórmula 1 entre 1950 y 2026. La simulación y el guardado de las partidas funcionan en el navegador; no requiere cuentas, claves de API, base de datos externa ni servicios externos.

## Desarrollo local

Requisitos: Node.js 20.19 o posterior y npm.

```bash
npm install
npm run dev
```

Vite inicia el entorno local en `http://localhost:8080`.

## Compilación

```bash
npm run typecheck
npm run build
npm run preview
```

## Publicación en Vercel

1. Subí el contenido de este proyecto a un repositorio de GitHub.
2. En Vercel, importá ese repositorio.
3. Usá `npm install` como comando de instalación y `npm run build` como comando de compilación. La configuración ya está declarada en `vercel.json`.
4. No hacen falta variables de entorno para ejecutar el simulador.

## Guardado

La partida se guarda automáticamente en el `localStorage` del navegador. Los datos permanecen en ese navegador y dispositivo; borrar los datos del sitio o cambiar de navegador puede eliminarlos o hacerlos inaccesibles.
