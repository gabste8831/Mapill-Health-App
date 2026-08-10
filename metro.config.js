// eslint-disable-next-line @typescript-eslint/no-require-imports
const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// expo-sqlite usa um módulo .wasm no build web (SQLite compilado via WebAssembly) — sem isso
// o Metro não sabe resolver `./wa-sqlite/wa-sqlite.wasm` e o bundle web quebra.
config.resolver.assetExts.push('wasm');

// O SQLite web roda num worker que depende de SharedArrayBuffer, só disponível no navegador
// quando a página é "cross-origin isolated" — exige esses dois headers no servidor de dev.
// Sem isso: "SharedArrayBuffer is not defined" ao chamar openDatabaseSync no web.
config.server = {
  ...config.server,
  enhanceMiddleware: (middleware) => {
    return (req, res, next) => {
      res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
      res.setHeader('Cross-Origin-Embedder-Policy', 'require-corp');
      return middleware(req, res, next);
    };
  },
};

module.exports = config;
