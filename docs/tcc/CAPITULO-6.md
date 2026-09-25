# Capítulo 6 - texto para inclusão

> **Escrito em 25/09/2026.** Substitui o capítulo "6. CONCLUSÃO", que tinha só o parágrafo de
> trabalhos futuros, usado como base do acesso de acompanhamento.
>
> **Trabalhos futuros definidos pelo Gabriel em 25/09:** versão para iOS, organização do cuidado por
> tratamento (contexto clínico que reúne medicamentos, sessões em lote e compromissos, com adesão ao
> tratamento inteiro) e acesso de acompanhamento só de consulta para médicos e responsáveis. A
> avaliação de usabilidade fecha o parágrafo, por responder à limitação declarada. Saíram os anexos
> na nuvem (item E9 do plano) e o pausar ou arquivar tratamento (commit `0cddbef`).
>
> **Este arquivo sai** depois que o texto estiver no documento e conferido.

---

**6. CONCLUSÃO**

	Este trabalho partiu da pergunta de como uma aplicação móvel, baseada em arquitetura *offline-first*, pode centralizar o gerenciamento de medicamentos, o controle de estoques e a organização de compromissos terapêuticos, atendendo a requisitos de usabilidade, segurança e confiabilidade. A resposta construída ao longo do trabalho é o Mapill, aplicação na qual toda operação clínica é gravada primeiro no próprio aparelho, e a nuvem atua como cópia de segurança e ponte entre dispositivos, nunca como condição para o funcionamento.

	Os objetivos propostos foram atendidos. Os requisitos foram levantados a partir da literatura sobre *mHealth* e adesão medicamentosa e especificados em requisitos funcionais, não funcionais e regras de negócio. A arquitetura em camadas isolou as regras do domínio das tecnologias de persistência e de interface, e a implementação contemplou o cadastro de medicamentos com apoio da base pública da Anvisa, a geração de cronogramas, o alarme de dose, o registro de ingestões, o controle de estoque, os compromissos e o relatório clínico.

	Entre as decisões que distinguem a proposta, destacam-se o desconto de estoque pela quantidade efetivamente administrada em cada dose, a correção retroativa que preserva o registro original e a distinção entre dose pulada e dose sem resposta, que mantém fiel o histórico levado ao profissional de saúde. A validação em aparelho confirmou o comportamento da arquitetura nos quatro cenários previstos na metodologia e levou a refinamentos na sincronização, que passou a garantir a prevalência da edição mais recente e o recebimento, pelos demais aparelhos da mesma conta, de registros feitos sem conexão.

	O trabalho apresenta limitações que delimitam o alcance desses resultados. A validação consistiu em testes funcionais conduzidos pelo autor em um único modelo de aparelho, com o segundo dispositivo simulado pela base remota, e não incluiu avaliação com usuários do público-alvo. A aplicação foi desenvolvida e validada apenas para Android, e a entrega do alarme permanece sujeita às restrições de inicialização automática impostas por alguns fabricantes, que a aplicação pode orientar, mas não contornar.

	Como trabalhos futuros, sugere-se inicialmente o desenvolvimento da versão para iOS, que ampliaria o alcance da aplicação aos usuários de aparelhos da Apple. Outra frente é a organização do cuidado por tratamento, na qual o paciente reúne sob um mesmo contexto clínico, como o de uma terapia oncológica, os medicamentos, as sessões de radioterapia agendadas em lote e os demais compromissos, permitindo acompanhar a adesão ao tratamento como um todo, e não apenas a cada medicamento. Sugere-se também um acesso de acompanhamento destinado a médicos e responsáveis pelo paciente, com permissão apenas de consulta, funcionalidade já consolidada em soluções de mercado como o Medisafe, e que exigiria a revisão do modelo de permissões da aplicação, deliberadamente simplificado na delimitação de escopo apresentada na seção 4.1. Por fim, a avaliação de usabilidade com pacientes idosos e polimedicados complementaria a validação técnica realizada neste trabalho.
