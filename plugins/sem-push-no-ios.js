const { withEntitlementsPlist } = require("expo/config-plugins");

/**
 * Tira do iOS o entitlement de push que o `expo-notifications` acrescenta sem perguntar.
 *
 * O Mapill só agenda avisos locais, e eles não precisam de `aps-environment`. O entitlement só
 * atrapalha: um Apple ID gratuito não assina binário que o declare, e é com conta gratuita que o
 * app é instalado em iPhone de teste.
 *
 * ## Por que antes do `expo-notifications` no `app.json`
 *
 * Mods do mesmo tipo rodam do último plugin para o primeiro. Listado depois, este rodaria antes do
 * `expo-notifications`, que veria a chave ausente e a colocaria de volta.
 *
 * Se um dia o app precisar de push remoto, é este plugin que sai.
 */
module.exports = function withSemPushNoIos(config) {
  return withEntitlementsPlist(config, (config) => {
    delete config.modResults["aps-environment"];
    return config;
  });
};
