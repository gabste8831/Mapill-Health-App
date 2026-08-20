// eslint-disable-next-line @typescript-eslint/no-require-imports
const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// expo-sqlite usa um módulo .wasm no build web (SQLite compilado via WebAssembly) — sem isso
// o Metro não sabe resolver `./wa-sqlite/wa-sqlite.wasm` e o bundle web quebra.
config.resolver.assetExts.push('wasm');

// "Package exports" precisa continuar HABILITADO (padrão do Metro). O `NativeTabs` no web
// (expo-router/unstable-native-tabs → NativeTabsView.web.js) usa @radix-ui/react-tabs, e
// @radix-ui/primitive só expõe `./is-development` pelo mapa `exports` — não existe arquivo
// físico com esse nome. Desabilitar a flag quebra o bundle web inteiro na tela de tabs.
//
// O workaround antigo (`unstable_enablePackageExports = false`) existia por causa de
// react-native-svg, que declarava um `exports` map parcial e rejeitava `./web/WebShape`.
// A partir da 15.15.4 a lib não declara `exports` nenhum, então a resolução clássica já
// resolve esse subpath sozinha e o workaround ficou obsoleto.

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
