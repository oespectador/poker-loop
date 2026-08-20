# Hungry Horse — pistas de força do range

## Escopo e método

Este registro de pesquisa sustenta a V0.10 a partir do claim map explícito fornecido ao Poker Loop. A fonte é uma transcrição do Hungry Horse Poker fornecida durante a pesquisa; URL, título do vídeo, data e timestamps não foram fornecidos e, por isso, não são inferidos aqui.

O fluxo editorial aplicado é: transcrição → claim → tipo → condições → exceções → exercício → validação. Os claims abaixo são heurísticas condicionais ou boundary cases, não regras universais nem tendências comprovadas de NL2/GGPoker.

## Claims autorizados

### Claim 1 — size grande no flop

- **claim:** uma c-bet relativamente grande no flop é apresentada como pista de que o range do apostador pode estar mais forte.
- **sourceKind:** `heuristic`.
- **condições:** flop; c-bet; tamanhos relativamente grandes, incluindo os exemplos fornecidos de pot, 3/4 pot e tamanhos grandes em 3-bet pots.
- **interpretação segura:** o size aumenta a evidência ou torna um range mais forte mais plausível; deve ser combinado com o contexto.
- **erro de generalização a evitar:** “bet grande = range forte” ou qualquer porcentagem de certeza.

### Claim 2 — c-bet multiway

- **claim:** uma c-bet multiway é uma pista adicional em direção a range relativamente mais forte.
- **sourceKind:** `heuristic`.
- **condições:** c-bet contra mais de um jogador.
- **interpretação segura:** o contexto multiway acrescenta evidência que pode ser empilhada com outras pistas.
- **erro de generalização a evitar:** dizer que multiway prova mão forte ou range forte.

### Claim 3 — configuração preflop tight

- **claim:** configurações mais tight, como early vs early ou 4-bet pot, oferecem uma pista inicial de ranges relativamente mais fortes.
- **sourceKind:** `heuristic`.
- **condições:** comparação relativa entre configurações preflop de amplitudes diferentes.
- **interpretação segura:** usar a configuração como uma das informações sobre a composição possível dos ranges.
- **erro de generalização a evitar:** afirmar que toda ação em configuração tight representa força.

### Claim 4 — small c-bet em contexto combinado

- **claim:** uma c-bet pequena pode ser pista de range relativamente mais fraco quando combinada com heads-up, configuração wide e board wet/dynamic.
- **sourceKind:** `heuristic`.
- **condições:** as quatro pistas devem ser consideradas em conjunto: small c-bet, heads-up, wide e wet/dynamic.
- **interpretação segura:** o conjunto torna a hipótese de range relativamente mais fraco mais plausível, sem determiná-la.
- **erro de generalização a evitar:** “small bet = weak”.

### Claim 5 — configuração wide

- **claim:** configurações wide, como button vs big blind, têm maior possibilidade relativa de mãos fracas no range do agressor que configurações muito tight.
- **sourceKind:** `heuristic`.
- **condições:** comparação entre uma configuração wide e outra mais tight.
- **interpretação segura:** descrever diferença relativa na composição possível.
- **erro de generalização a evitar:** rotular todo o range wide como fraco.

### Claim 6 — boundary case static/dry

- **claim:** em board muito static/dry, c-bet pequena não deve ser interpretada automaticamente como sinal de range fraco; segundo a fonte, mãos fortes também podem usar size pequeno porque há menos turns ruins a temer.
- **sourceKind:** `heuristic` (boundary case editorial).
- **condições:** board muito static/dry e c-bet pequena.
- **interpretação segura:** o board modifica o valor informativo do size e limita a inferência de fraqueza.
- **erro de generalização a evitar:** transformar a explicação da exceção em estratégia universal de c-bet.

### Claim 7 — boundary case de 3-bet pot

- **claim:** em 3-bet pot, c-bet pequena isoladamente não basta para concluir range fraco, pois a configuração já contém ranges relativamente mais estreitos/fortes que muitos single-raised pots.
- **sourceKind:** `heuristic` (boundary case editorial).
- **condições:** 3-bet pot e c-bet pequena.
- **interpretação segura:** considerar conjuntamente size e configuração.
- **erro de generalização a evitar:** concluir fraqueza pelo size ou criar uma nova regra universal para 3-bet pots.

### Claim 8 — calibração e empilhamento

- **claim:** nenhuma pista individual produz certeza; uma pista gera atualização pequena/contextual, várias pistas coerentes sustentam mais a leitura e pistas conflitantes mantêm incerteza.
- **sourceKind:** `heuristic` (princípio de calibração derivado do framing da fonte).
- **condições:** leitura conjunta dos sinais autorizados, incluindo conflitos entre eles.
- **interpretação segura:** calibrar a linguagem e empilhar evidências sem quantificar confiança.
- **erro de generalização a evitar:** inventar percentuais, deixar uma pista dominar sempre ou tratar múltiplas pistas como prova.

## Claims mantidos fora da biblioteca ativa

A transcrição também continha os tópicos abaixo, mas eles **não estão validados para uso ativo nesta versão** e não foram convertidos em exercícios:

- double previous bet size → weak;
- heurísticas de turn stab, inclusive linhas após checkback;
- capped/uncapped após checkback no flop;
- sinais de river strong/thin;
- prescrições de sizing de raise no river;
- prescrições de donk.

Também permanecem fora inferências sobre velocidade de ação e qualquer estratégia completa contra ranges fortes/fracos. Nada foi transplantado da fonte para NL2, GGPoker ou qualquer pool como fato.
