import { supabase } from "./supabase-client";
import { TABELAS_SINCRONIZAVEIS, type TabelaSincronizavel } from "./tabelas-sincronizaveis";

/**
 * Apaga **de verdade** as linhas do usuário na nuvem - `DELETE`, não `deleted_at`.
 *
 * O soft delete é a ferramenta certa para a exclusão do dia a dia, em que a linha precisa
 * sobreviver para contar ao outro aparelho que morreu. Aqui é outra coisa: é o direito de exclusão
 * da LGPD (art. 18), e ele exige que o dado **saia**. Uma linha marcada como apagada continua
 * sendo dado pessoal guardado num servidor.
 *
 * **Ordem inversa à da sincronização.** Lá é pai antes de filho, para nada chegar órfão; aqui é
 * filho antes de pai, para nada *ficar* órfão. Apagar `medications` antes de `prescriptions`
 * deixaria prescrições apontando para um medicamento que não existe mais.
 *
 * O RLS garante que só as linhas do próprio usuário sejam alcançadas: a política de `DELETE` usa
 * `user_id = auth.uid()`, então nem um `delete` sem filtro tocaria em dado alheio. O filtro
 * explícito está aqui de qualquer forma, porque segurança que depende de uma camada só é
 * segurança que ninguém revisou.
 *
 * **Não lança.** Sem conta vinculada, ou offline, não há nuvem a limpar - e nos dois casos o
 * apagamento local precisa acontecer do mesmo jeito. Falhar aqui e abortar tudo deixaria a pessoa
 * sem conseguir apagar nem o que está no próprio aparelho.
 */
export async function apagarNaNuvem(tabelasDesejadas: readonly string[]): Promise<boolean> {
  if (supabase === null) return true;

  try {
    const { data } = await supabase.auth.getUser();
    const userId = data.user?.id;
    // Sem conta vinculada não há nuvem a limpar, e isso é sucesso: não sobrou nada em lugar nenhum.
    if (userId === undefined) return true;

    // Só as que existem no servidor, e na ordem inversa da sincronização.
    const alvo = [...TABELAS_SINCRONIZAVEIS]
      .filter((tabela): tabela is TabelaSincronizavel => tabelasDesejadas.includes(tabela))
      .reverse();

    for (const tabela of alvo) {
      const { error } = await supabase.from(tabela).delete().eq("user_id", userId);
      if (error !== null) throw new Error(`${tabela}: ${error.message}`);
    }
    return true;
  } catch (cause) {
    /**
     * O fracasso e devolvido, e nao engolido.
     *
     * Seguir em frente continua certo, porque travar o apagamento local por causa da nuvem deixaria
     * os dados nos dois lugares. Mas quem chama precisa saber: a marca d'agua e apagada junto, e
     * sem ela o pull seguinte baixa o servidor inteiro de volta. Com a nuvem intacta, o botao de
     * apagar viraria um apagamento temporario, com a pessoa vendo tudo sumir e voltar.
     */
    console.error("Falha ao apagar os dados na nuvem:", cause);
    return false;
  }
}

/**
 * Apaga a marca d'água da sincronização.
 *
 * Precisa acontecer junto do apagamento local: a marca diz "já baixei tudo até tal instante", e
 * mantê-la depois de esvaziar o banco faria o próximo pull pular justamente os dados que
 * voltariam a fazer sentido. Fica aqui, e não em `sync-service`, porque é operação de exclusão.
 */
export const SQL_LIMPAR_MARCA_DAGUA = "DELETE FROM sync_state";
