/**
 * No web não há splash nativa pra cobrir, então o overlay não tem o que fazer. Este arquivo
 * existe só pra impedir que a versão nativa (que chama `SplashScreen.hideAsync`) rode no
 * navegador — ver §5.1 do plano: isolar a plataforma em vez de portar a API.
 */
export function SplashOverlay() {
  return null;
}
