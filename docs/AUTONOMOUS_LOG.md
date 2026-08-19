# Autonomous Log

## 2026-08-18 — Handoff inicial

### Objetivo

Preparar Poker Loop V0.4 para ser compreendido por um agente de código externo sem depender do histórico completo da conversa original.

### Alterações

- criado `AGENTS.md`;
- documentada visão do produto;
- documentado modelo de aprendizagem;
- documentadas regras de conteúdo/terminologia;
- registrado estado técnico da V0.4;
- congeladas decisões relevantes;
- criado protocolo de desenvolvimento autônomo;
- criado protocolo de testes;
- criado backlog priorizado;
- criada política de fontes;
- criada primeira tarefa controlada para Jules.

### Código de produto

Nenhum comportamento do aplicativo foi alterado nesta etapa.

### Próximo passo recomendado

Executar o primeiro experimento com Jules usando `docs/JULES_TRIAL_TASK.md`. Avaliar o diff antes de permitir tarefas maiores ou mais abertas.

## 2026-08-19 — Suíte automatizada do motor V0.4

### Objetivo

Caracterizar os invariantes atuais do scheduler e da biblioteca com testes automatizados, sem alterar comportamento de produto.

### Hipótese trabalhada

Uma suíte pequena, determinística e executada pelo test runner nativo do Node pode proteger a ordem pedagógica, os bloqueios de conteúdo inédito e a separação entre desenvolvimento e avaliação sem exigir refatoração do motor nem nova dependência.

### Alterações

- criado `npm test`, que compila a suíte TypeScript em diretório temporário e usa `node:test`;
- adicionados testes da primeira sessão fundadora e dos três microblocos de `range-actions`;
- caracterizados bloqueio de `range-to-decision`, retomada parcial e estabilidade da introdução após erro;
- caracterizada a repriorização pós-erro fora da introdução, sem repetição imediata da mesma questão;
- cobertos treino manual, adaptive fill, exclusão de retenção/transferência e integridade básica de IDs/respostas;
- documentado o comando em `docs/TESTING.md`.

### Comportamento antes/depois

O comportamento do scheduler, conteúdo, UI, navegação e storage não foi alterado. Depois da mudança, os invariantes existentes podem ser verificados de forma reproduzível por `npm test`.

### Testes executados

- `npm test`: 10 testes aprovados;
- `npm run typecheck`: aprovado;
- `npm run build`: aprovado (Next.js 16.3.1 disponível no ambiente).

### Riscos e limitações

- A suíte testa o motor diretamente e não cobre persistência/UI ponta a ponta.
- A instalação de Vitest foi tentada, mas o registry respondeu HTTP 403. Para evitar dependência e manter compatibilidade com Node `>=20.9.0`, foi adotado `node:test` com uma compilação TypeScript temporária.
- Não foi encontrado bug de comportamento nos invariantes solicitados; não há decisão humana pendente nesta unidade.

### Auditoria de escopo

O diff foi revisado para remover artefatos gerados pelo build. Não houve refatoração do scheduler nem mudança de conteúdo, copy, regras pedagógicas, navegação ou storage.

### Próximo passo recomendado

Em unidade separada, considerar os validadores adicionais já listados no backlog (sequências de pacote, opções vazias e requisitos editoriais de pista), sem misturá-los a mudanças de produto.

## 2026-08-19 — Portabilidade do comando de testes

### Objetivo e alteração

Tornar `npm test` compatível com Windows e Linux sem dependências: a limpeza de `.test-dist` passou de `rm -rf` para `fs.rmSync`, e a execução deixou de depender de expansão de glob pelo shell ao apontar explicitamente para o único arquivo de teste compilado.

### Escopo e validação

Somente o script de teste foi funcionalmente alterado. Testes, scheduler, conteúdo, UI, navegação, storage e comportamento do produto permaneceram intactos. Foram executados com sucesso `npm test`, `npm run typecheck`, `npm run build` e `git diff --check`. Nenhuma limitação ou decisão humana pendente foi encontrada.
