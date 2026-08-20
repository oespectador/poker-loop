# Testing Protocol

## Estado atual

A baseline possui scripts:

```bash
npm test
npm run typecheck
npm run build
npm run dev
```

`npm test` compila os arquivos TypeScript da suíte em `.test-dist` e executa o test runner nativo do Node.js. Essa abordagem não adiciona dependências: mantém a suíte pequena e compatível com o Node `>=20.9.0` já exigido pelo projeto.

O runner recebe o diretório compilado de testes, sem depender de expansão de glob do shell, e cobre tanto o motor quanto o contrato estático da biblioteca e a classificação de suporte das tentativas.

## Invariantes do motor

Qualquer teste/refatoração deve preservar:

1. primeira sessão: 12 exercícios fundadores;
2. pacotes estruturados entram em ordem definida;
3. microbloco atual não antecipa o próximo se sessão for interrompida;
4. erro em primeira apresentação não embaralha o bloco;
5. itens inéditos de pacote não entram por treino manual/adaptive fill;
6. pacote posterior fica bloqueado enquanto anterior tem inéditos;
7. itens reservados de retenção/transferência não entram antes da conclusão dos pacotes;
8. revisão pode variar ordem sem destruir prioridade pedagógica;
9. progresso não deve virar `Consistente` por um único acerto/sessão;
10. histórico deve persistir resposta a resposta.

## Validação da biblioteca

Checar automaticamente sempre que possível:

- IDs únicos;
- resposta correta presente nas opções;
- sequências de pacote válidas;
- `learningPackage` conhecido;
- `purpose` válido;
- pistas presentes quando necessárias;
- nenhuma opção vazia;
- nenhum board inválido se houver parser/validador disponível.

Na V0.5, `range-actions`, `range-to-decision` e `calibration` são os pacotes estruturados: cada um deve ter exatamente as sequências de 1 a 12 entre os exercícios de desenvolvimento. `foundations` não exige `packageSequence`.

## Teste humano atual

A V0.5 precisa ser validada principalmente nestas perguntas:

- os microblocos aparecem corretamente?
- as perguntas são claras?
- as alternativas erradas são plausíveis?
- a pista ajuda sem entregar?
- o feedback explica a concepção errada?
- depois dos exercícios, o jogador começa a perguntar espontaneamente “qual parte do range quero atingir?” e “essas mãos mudam de decisão com o size?”
- o jogador separa “a ação segue das premissas?” de “há evidência para confiar nas premissas?”;
- evidência limitada produz atualização proporcional, em vez de certeza, descarte ou inversão extrema;
- a incerteza leva a uma decisão calibrada, e não à paralisia?

A suíte automatizada possui 39 testes. Para V0.6, ela protege também o bloqueio
de `calibration` até a apresentação completa de `range-to-decision`, seus três
microblocos, retomada parcial, estabilidade após erro de introdução, ausência de
vazamento pelo treino manual e o contrato estático das sequências 1–12. O piloto
de avaliação cobre o limite de 12 itens, no máximo uma retenção e uma
transferência, elegibilidade independente em duas sessões, espera de 24 horas
somente para retenção, apresentação única, suporte independente, determinismo,
repriorização apenas para development e separação do `SkillState`.

Na V0.6.1, a suíte também protege a seleção genérica do primeiro pacote pendente,
inclusive a prioridade de `calibration` sobre o ranking normal, o retorno ao
ranking depois dos três pacotes, a introdução recomendada de `calibration 01–04`
e o resumo separado das evidências de retenção e transferência.

## Build

Se `npm run build` falhar por ambiente/rede, documentar a limitação. Não declarar build bem-sucedida sem tê-la executado.
