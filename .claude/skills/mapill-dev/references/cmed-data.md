# Base CMED (Anvisa) como "dicionário de saúde" — Mapill

Fonte: https://www.gov.br/anvisa/pt-br/assuntos/medicamentos/cmed/precos
Arquivo de referência do usuário: `xls_conformidade_site_20260610_121627707.xlsx`

Embora a planilha da CMED seja voltada a preços regulados de medicamentos, ela funciona
como uma base pública sólida e nacional para autocompletar o cadastro de medicamentos no
app, evitando erro de digitação manual do usuário — especialmente relevante pro público-alvo
polimedicado/idoso (reduz carga cognitiva, alinhado à seção 2.4 do artigo).

## Uso pretendido

1. Importar a planilha **uma vez em tempo de build/dev** (não em runtime no dispositivo do
   usuário) e gerar um arquivo SQLite pré-populado (ou um JSON/CSV enxuto) que vai embarcado
   no app.
2. Em runtime, o app faz busca **local** (offline) nesse dataset — por nome comercial,
   princípio ativo, ou EAN — para autocompletar o cadastro de um medicamento/prescrição.
3. Isso não substitui o cadastro manual; é um atalho de UX (reconhecimento em vez de
   recordação — Nielsen) que reduz erro de digitação.

## Colunas relevantes a extrair (confirmar nomes exatos ao abrir a planilha, variam por versão)

Ao processar o arquivo, mapear tipicamente para:

- **Nome do produto** → `medications.commercial_name`
- **Princípio ativo (substância)** → `medications.active_ingredient`
- **Apresentação** (ex: comprimido, ml, mg) → `medications.presentation`
- **Laboratório/EAN/código de barras** → `medications.ean` (chave usada para busca rápida por
  código de barras, se o app tiver leitura de código de barras)
- **Classe terapêutica**, quando presente → `medications.therapeutic_class` (não crítico, mas
  útil para categorização/filtros na UI)

Não é necessário (e não deve) importar colunas de preço/regulação (PMC, ICMS, etc.) — o app
usa a CMED só como dicionário de nomes/EAN, não como fonte de preços.

## Processo sugerido de ingestão

1. Script único (Node ou Python, fora do runtime do app) lê o `.xlsx`, filtra e normaliza as
   colunas acima, remove duplicatas por EAN.
2. Gera um arquivo `medications_seed.sql` (ou `.json`) enxuto.
3. Esse seed é embarcado como asset do app e importado para o SQLite local na primeira
   inicialização (ou sob demanda, se o dataset for grande — considerar tamanho do app).
4. Atualizações da base CMED são tratadas como um novo seed versionado, não como sync em
   tempo real (a CMED não é uma API, é uma planilha publicada periodicamente).

## Observação de manutenção

Se um dia a Anvisa disponibilizar uma API oficial (o usuário já pesquisou e não encontrou uma
no momento da escrita do artigo), esse processo de seed pode ser trocado por chamadas diretas
— mas a camada de `repository` de medicamentos deve abstrair essa fonte, para que trocar de
"seed local" para "API remota" não exija mudança nos use-cases que consomem os dados.
