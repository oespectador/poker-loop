# Content Rules — Poker Loop

## Regra de ouro

**Um exercício bom deve poder ser errado por uma razão interessante.**

Uma alternativa errada não deve ser apenas absurda; deve representar uma concepção equivocada plausível.

## Estrutura mínima de um exercício

- cenário explícito;
- uma habilidade primária;
- uma pergunta dominante;
- resposta defensável dentro das premissas fornecidas;
- distractors plausíveis;
- feedback curto;
- explicação expandida quando útil;
- pista compatível com o nível de suporte;
- `variantGroup` quando houver variações do mesmo conceito.

## Linguagem

Preferir:

- Herói / Vilão;
- o range;
- range mais forte (força global);
- capped / uncapped;
- “mais combinações entre as mãos mais fortes possíveis” para nut advantage;
- “essas mãos mudam de decisão se o tamanho aumentar?” para ensinar sensibilidade ao tamanho.

Evitar:

- região mais forte;
- nutted;
- “preserva” quando houver alternativa natural;
- jargão em inglês quando não for universal nas mesas/softwares;
- frases que soem como lei universal quando são apenas heurísticas.

## Range advantage, nut advantage e capped/uncapped

- **range advantage**: força dos ranges como um todo;
- **nut advantage**: quem possui mais combinações entre as mãos mais fortes possíveis;
- **capped/uncapped**: presença/ausência relativa do topo plausível na linha.

Não confundir essas dimensões.

Dois ranges podem ter forças globais diferentes e ambos permanecer uncapped.

## Inferência pelas ações

Ação não possui significado fixo.

```text
ação
+ board
+ sizing
+ ordem de ação
+ heads-up/multiway
+ ações anteriores
+ perfil/premissas
→ inferência sobre o range
```

`call = capped` e `check = capped` são atalhos proibidos.

Pergunta preferida antes do rótulo:

> **Quais mãos muito fortes ainda fazem sentido nesta linha?**

## Elasticidade / sensibilidade ao tamanho

Não ensinar como propriedade permanente de uma mão ou board.

```text
mão
+ range
+ street
+ stack
+ linha
+ size
→ resposta
```

Primeiro mostrar a resposta da mão aos sizes; depois usar o rótulo.

## Objetivo e sizing

Sequência preferida:

```text
range do Vilão
→ minha mão
→ objetivo
→ mãos-alvo
→ como respondem ao size
→ ação + sizing
```

Perguntas úteis:

- Quais mãos piores quero que continuem?
- Quais mãos melhores quero que foldem?
- Qual parte do range muda de decisão conforme o size muda?
- O fold adicional justifica o custo adicional?

Não ensinar:

- `capped → big`;
- `uncapped → small`;
- “size médio é ruim”;
- “mais fold equity = melhor”; 
- “mão forte = bet grande”.

## Premissas didáticas

Se o exercício fornece algo como:

```text
QJ
50% → call
75% → call
125% → fold
```

isso pode ser usado para treinar lógica/sizing, mas deve ser tratado como **premissa daquele exercício**. Não inferir que seja comportamento real de NL2, GGPoker, live etc.

## Lógica da decisão

Pergunta central:

> **Esta ação cumpre a função que você atribui a ela?**

Padrões de erro úteis internamente:

- ação sem função;
- objetivo e size incompatíveis;
- quebra do fio entre streets;
- plano rígido apesar de mudança de contexto;
- tentar “resolver de novo” algo que a ação anterior já filtrou;
- justificar call por preço sem mãos suficientes que vença;
- reduzir risco até o blefe deixar de atingir a mão-alvo.

Feedback deve apontar a inconsistência específica, não dizer genericamente “sua lógica está ruim”.

## Calibração

Tendência populacional é um **default contextual**, não lei.

Não transportar automaticamente:

- live → online;
- NL25 → NL2;
- cash → MTT;
- reg tables → Rush & Cash;
- um jogador → outro jogador.

Showdown atualiza uma crença; não cria uma regra após uma única observação.

Família de exercício recomendada:

> **O que sabemos? O que ainda não sabemos?**

## Fontes

As fontes podem gerar:

- princípio;
- hipótese;
- contraexemplo;
- boundary case;
- exploit candidato;
- exercício candidato.

Não geram automaticamente “verdade do Poker Loop”.
