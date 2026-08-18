# Poker Loop — instruções para agentes de código

Este repositório é o **Poker Loop 1.0**, um aplicativo de aprendizagem deliberada de poker. O produto não é um dashboard de estatísticas nem um catálogo de regras: o núcleo é um treinador que seleciona decisões, dá feedback, reapresenta conceitos em novas superfícies e aumenta gradualmente a independência do jogador.

Leia **antes de alterar código**:

1. `docs/PRODUCT_VISION.md`
2. `docs/LEARNING_MODEL.md`
3. `docs/CONTENT_RULES.md`
4. `docs/PROJECT_STATE.md`
5. `docs/DECISIONS.md`
6. `docs/AUTONOMOUS_PROTOCOL.md`
7. `docs/TESTING.md`
8. `docs/BACKLOG.md`

## Regra principal

**Não expandir o produto apenas porque é possível.** Prefira a menor mudança reversível que melhore aprendizagem, clareza, confiabilidade ou testabilidade.

## Escopo atual

A baseline é **V0.4 — Da Leitura à Decisão**.

- Next.js 16.2 / React 19.2 / TypeScript.
- 36 exercícios de desenvolvimento.
- 18 itens reservados de retenção/transferência, fora do treino normal.
- Pacotes estruturados em microblocos de quatro exercícios.
- Ordem pedagógica da primeira apresentação deve ser preservada.
- Revisões podem variar/adaptar; introduções não devem ser embaralhadas por erro.
- Histórico é salvo a cada resposta.
- Suporte: `guided` → `supported` → `independent`.

## Produto e UX

- O treino é o produto. Evite criar módulos, dashboards ou menus sem necessidade validada.
- Navegação primária: `Hoje`, `Treinar`, `Progresso`, `+ Adicionar`.
- Durante exercício, reduzir distrações.
- Teoria deve aparecer em exemplos, feedback e explicações; evitar grandes módulos de leitura.
- Não adicionar gamificação pesada: XP, moedas, baús, streak punitiva, leaderboard etc.
- Sem cronômetro obrigatório para conceito novo.
- UI simples; dificuldade deve vir do poker, não da interface.
- Não exibir metadados editoriais/proveniência na interface principal.

## Linguagem do Poker Loop

- Português técnico natural.
- Usar **Herói** e **Vilão**.
- Usar **o range**.
- Manter **capped / uncapped** como termos operacionais.
- Quando a ideia for força global, usar **range mais forte**.
- Para nut advantage, preferir: **mais combinações entre as mãos mais fortes possíveis**.
- Evitar **“região mais forte”**.
- Evitar **“nutted”**.
- Evitar **“preserva”** quando “ainda contém”, “continua representando” ou equivalente for mais natural.
- Para elasticidade, priorizar a pergunta: **“essas mãos mudam de decisão se o tamanho aumentar?”**. `board elástico / board inelástico` pode ser usado como resumo operacional, não como propriedade absoluta das cartas.

## Conteúdo estratégico

Não transforme automaticamente uma fala de vídeo, artigo ou coach em verdade estratégica.

Classifique mentalmente afirmações como:

- princípio;
- referência de solver;
- heurística;
- exploit/calibração populacional;
- observação individual.

Regras importantes:

- `call` não implica `capped` automaticamente;
- `check` não implica `capped` automaticamente;
- `capped` não significa `range fraco`;
- `uncapped` não significa `range mais forte`;
- `capped` não determina sozinho size grande;
- `uncapped` não determina sozinho size pequeno;
- “mais folds” não significa automaticamente “melhor bluff”;
- mão forte não implica aposta automática;
- sizing deve ser ensinado via mãos-alvo e resposta ao tamanho, não como número decorado.

Se uma afirmação estratégica nova não estiver sustentada pelos documentos do projeto, **não invente**. Registre a questão em `docs/AUTONOMOUS_LOG.md` e trabalhe em outra tarefa segura.

## Exercícios

Cada exercício deve:

- ter uma habilidade primária clara;
- testar uma ideia dominante;
- evitar ambiguidade estratégica;
- ter resposta defensável dentro das premissas explicitadas;
- usar distractors plausíveis, ligados a concepções erradas reais;
- explicar por que a concepção errada falha;
- preferir contraste, minimal pairs e boundary cases;
- não ensinar atalhos cegos;
- não misturar calibração populacional com lógica quando a premissa pode ser fornecida explicitamente.

Quando números de resposta do range forem inventados para ensino (ex.: `QJ: call 50%, call 75%, fold 125%`), deixe claro no exercício/feedback que são **premissas didáticas**, não afirmações sobre NL2, GGPoker ou qualquer pool real.

## Motor de treino

Não faça overengineering. O motor atual é heurístico e interpretável.

Princípios que devem ser preservados:

- feedback agora; recuperação novamente depois;
- erro recente aumenta prioridade de variação relacionada;
- primeira apresentação mantém sequência pedagógica;
- se erro já revela a causa, não criar interrogatório diagnóstico extra;
- acerto com ajuda não vale como evidência independente;
- progresso qualitativo e conservador;
- não criar porcentagens de “mastery” sem base empírica;
- retenção e transferência futuras devem ser diferenciadas de desenvolvimento, mas não implementar infraestrutura complexa sem biblioteca suficiente.

## Desenvolvimento autônomo

Ao receber uma tarefa ampla como “continue o Poker Loop”:

1. ler o estado e backlog;
2. escolher **uma** unidade de trabalho segura e mensurável;
3. declarar no log qual hipótese está sendo trabalhada;
4. implementar;
5. rodar testes/typecheck/build quando possível;
6. auditar regressões e escopo;
7. atualizar documentação;
8. só então considerar uma segunda unidade de trabalho.

Não faça mudanças estruturais irreversíveis sem pedido explícito. Se encontrar uma decisão de produto incerta, registre-a como `DECISÃO HUMANA NECESSÁRIA` e siga para outro item.

## Comandos

```bash
npm install
npm run typecheck
npm run build
npm run dev
```

Se adicionar testes, documente o comando aqui e em `docs/TESTING.md`.

## Entrega

Uma sessão autônoma deve terminar com:

- código compilando/typechecking, sempre que o ambiente permitir;
- testes executados ou limitação documentada;
- `docs/AUTONOMOUS_LOG.md` atualizado;
- mudanças pequenas e revisáveis;
- resumo do que mudou, o que não mudou e o que requer validação humana.
