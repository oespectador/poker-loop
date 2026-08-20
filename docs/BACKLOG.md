# Backlog — Poker Loop

Este backlog é ordenado por segurança/valor, não por promessa de roadmap. Antes de executar um item, confirmar se ele continua coerente com `PROJECT_STATE.md` e `DECISIONS.md`.

## P0 — ideal para primeiro teste de agente externo

### 1. Criar uma suíte de testes automatizados do motor atual

Objetivo: transformar simulações manuais/ad hoc em testes versionados **sem alterar comportamento de produto**.

Cobrir no mínimo:

- primeira sessão com 12 fundadores;
- pacote `range-actions` em `01–04`, `05–08`, `09–12`;
- pacote `range-to-decision` bloqueado enquanto `range-actions` está pendente;
- retomada após sair no meio do microbloco;
- erro em introdução não embaralha a sequência;
- erro fora da introdução reprioriza variação relacionada alguns itens depois;
- treino manual não vaza item inédito de pacote;
- `supported` sem pista pode ser registrado como independente pela UI/fluxo existente;
- IDs de exercícios únicos;
- `correctOptionId` existente nas opções;
- itens reservados não entram no treino normal.

Critério de sucesso: testes reproduzíveis, `npm run typecheck` e `npm run build` preservados.

**Não refatorar o motor durante este primeiro item, exceto alteração mínima necessária à testabilidade.**

### 2. Validador estático da biblioteca de exercícios

Criar checagem automatizada para:

- IDs duplicados;
- respostas inexistentes;
- pacote com sequências faltando/duplicadas;
- exercício `guided/supported` sem pista quando isso quebrar a experiência;
- `purpose` incompatível com coleção ativa/reservada;
- opção duplicada dentro de uma questão.

Sem modificar conteúdo estratégico.

## P1 — após validação humana da V0.4

### 3. Consolidar feedback real da V0.4

Depende de teste humano. Não inventar problemas para justificar mudança.

Perguntas de validação:

- o usuário pensa em mãos-alvo antes do size?
- pistas ajudam sem entregar?
- distractors parecem plausíveis?
- feedback específico ao erro é perceptível?
- algum item parece artificial/óbvio/ambíguo?

### 4. Preparar pacote de Calibração

Conteúdo conceitual já explorado, mas **não implementar automaticamente sem uma tarefa explícita**.

Eixos:

- lógica × calibração;
- limites da evidência;
- atualização de crenças;
- população × jogador;
- incerteza;
- showdowns: “o que sabemos / o que ainda não sabemos?”.

Cuidado: fontes live não viram defaults de NL2.

## P2 — mais tarde

- validar longitudinalmente o piloto V0.6 de retenção e transferência com pessoas;
- somente depois, decidir se retenção precisa de intervalos adaptativos;
- somente depois, decidir se transferência contextual precisa de novas superfícies;
- diagnóstico mínimo entre leitura/lógica/calibração;
- hands importadas alimentando exercícios após validação estratégica;
- ranges sugeridos e personalizáveis;
- micro-solver experimental/river toy solver para validação pedagógica;
- estudos populacionais específicos do ambiente-alvo.

## Não fazer autonomamente

- reescrever arquitetura do app;
- migrar framework;
- adicionar backend/cloud apenas por conveniência;
- adicionar autenticação;
- criar marketplace/social;
- adicionar dezenas de features;
- treinar modelos;
- transformar heurísticas de vídeos em regras universais.
