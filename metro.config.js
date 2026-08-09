// eslint-disable-next-line @typescript-eslint/no-require-imports
const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// expo-sqlite usa um módulo .wasm no build web (SQLite compilado via WebAssembly) — sem isso
// o Metro não sabe resolver `./wa-sqlite/wa-sqlite.wasm` e o bundle web quebra.
config.resolver.assetExts.push('wasm');

module.exports = config;
