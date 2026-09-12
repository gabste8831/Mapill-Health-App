/**
 * Faz o Node resolver `./modulo` como `./modulo.ts`, do jeito que o bundler do app já resolve.
 *
 * ## Por que isto existe
 *
 * O código-fonte importa sem extensão (`from "./generate-dose-schedules"`) — é a convenção do
 * projeto inteiro, e o Metro resolve sozinho. O Node puro não: ele exige o caminho exato, e por
 * isso qualquer `conferir-*` que alcançasse um módulo com import de **valor** sem extensão morria
 * em `ERR_MODULE_NOT_FOUND`. Os scripts existentes escapavam porque os imports que eles
 * atravessavam eram `import type`, apagados pelo strip-types antes de virarem resolução.
 *
 * Foi o que deixou `estimate-stock-depletion` sem cobertura até 12/09 — e foi exatamente lá que o
 * aviso de estoque desaparecia. Regra que não dá para testar é regra que quebra calada.
 *
 * A alternativa era pôr `.ts` nos imports do `src/`, o que mexeria em arquivos do app inteiro para
 * servir a um script de conferência. Este hook resolve no lado de quem testa.
 *
 * Usar: node --experimental-strip-types --import ./scripts/resolver-sem-extensao.mjs <script>
 */
import { existsSync } from "node:fs";
import { fileURLToPath, pathToFileURL } from "node:url";
import { register } from "node:module";

/**
 * O hook roda na thread de resolução; `register` o instala a partir deste próprio arquivo.
 *
 * `async` e com `await` no `nextResolve`: ele rejeita uma promessa em vez de lançar, e um
 * `try/catch` síncrono não pegaria o `ERR_MODULE_NOT_FOUND` que é justamente o gatilho daqui.
 */
export async function resolve(specifier, context, nextResolve) {
  // Só especificadores relativos: pacote do npm resolve pelas regras dele.
  if (specifier.startsWith(".")) {
    try {
      return await nextResolve(specifier, context);
    } catch (erro) {
      if (erro?.code !== "ERR_MODULE_NOT_FOUND" || context.parentURL === undefined) throw erro;
      const base = new URL(specifier, context.parentURL);
      for (const tentativa of [".ts", ".tsx", "/index.ts"]) {
        const candidato = new URL(base.href + tentativa);
        if (existsSync(fileURLToPath(candidato))) {
          return { url: candidato.href, shortCircuit: true, format: "module-typescript" };
        }
      }
      throw erro;
    }
  }
  return nextResolve(specifier, context);
}

register(pathToFileURL(import.meta.filename));
