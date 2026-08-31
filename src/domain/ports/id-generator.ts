/**
 * Gera o identificador de um registro novo.
 *
 * Existe como port pela mesma razão pela qual o tempo é parâmetro nos use-cases: **gerar id é um
 * efeito colateral**, e um caso de uso que o produz sozinho deixa de ser determinístico — não dá
 * para afirmar o resultado dele numa verificação.
 *
 * Antes disso, `register-intake` e `correct-intake` importavam `expo-crypto` diretamente. Eram os
 * dois únicos arquivos do domínio que conheciam o Expo, e isso os tornava impossíveis de executar
 * em Node puro, que é justamente como o resto do núcleo clínico é verificado.
 */
export type IdGenerator = () => string;
