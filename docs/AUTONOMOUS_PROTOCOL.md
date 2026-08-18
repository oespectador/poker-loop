# Autonomous Development Protocol

Objetivo: permitir trabalho de 1–3 horas sem supervisão contínua, reduzindo deriva e acúmulo de decisões ruins.

## Princípio

Autonomia é permitida para trabalho **seguro, reversível e verificável**. Decisão estrutural incerta deve ser registrada, não improvisada.

## Ciclo

```text
LER ESTADO
↓
ESCOLHER UMA UNIDADE DE TRABALHO
↓
DEFINIR CRITÉRIO DE SUCESSO
↓
IMPLEMENTAR
↓
TESTAR
↓
AUDITAR ADVERSARIALMENTE
↓
CORRIGIR
↓
ATUALIZAR LOG/ESTADO
↓
SÓ ENTÃO CONSIDERAR PRÓXIMA UNIDADE
```

## Trabalho permitido sem confirmação

- testes automatizados;
- validação estática;
- correção de bug reproduzível;
- refatoração pequena com testes preservando comportamento;
- melhoria de documentação;
- limpeza de duplicação técnica;
- melhoria de acessibilidade sem alterar intenção de produto;
- implementação de especificação explicitamente congelada;
- feedback copy claramente editorial e já decidido.

## Trabalho que exige parar e registrar

- nova navegação;
- nova feature significativa;
- mudança de filosofia pedagógica;
- remoção de dados/compatibilidade;
- troca de framework/banco/arquitetura;
- nova afirmação estratégica sem fonte adequada;
- alteração que dependa fortemente de preferência visual subjetiva;
- mudança que torne histórico local incompatível;
- adicionar custo/serviço externo obrigatório.

Use em `docs/AUTONOMOUS_LOG.md`:

```text
DECISÃO HUMANA NECESSÁRIA
- questão:
- por que importa:
- opções:
- recomendação provisória:
- trabalho seguro que foi feito em paralelo:
```

## Regra de escopo

Uma sessão longa não é licença para aumentar escopo. Preferir:

```text
uma mudança
→ testes
→ auditoria
→ segunda mudança relacionada
```

em vez de:

```text
feature
→ feature
→ feature
→ feature
```

## Auditoria adversarial

Antes de concluir uma unidade, responder:

1. Isso melhora realmente aprendizagem/testabilidade ou só adiciona complexidade?
2. Eu alterei alguma decisão congelada sem perceber?
3. Há um caminho de regressão no scheduler/storage/conteúdo?
4. O teste cobre comportamento ou apenas implementação?
5. Estou transformando uma heurística em princípio?
6. O usuário terá mais trabalho para validar do que valor recebido?

## Entrega de sessão autônoma

Atualizar `docs/AUTONOMOUS_LOG.md` com:

- objetivo;
- arquivos alterados;
- comportamento antes/depois;
- testes executados e resultados;
- riscos conhecidos;
- decisões humanas pendentes;
- próximo passo recomendado.

Quando trabalhar via GitHub/Jules, preferir **uma branch/PR revisável**, não dezenas de artefatos intermediários.
