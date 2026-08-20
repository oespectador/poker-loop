import type { Exercise } from "./types";

export const developmentExercises: Exercise[] = [
  {
    id: "dev-board-01",
    purpose: "development",
    primarySkill: "board-reading",
    support: "guided",
    title: "Contraste",
    spot: { label: "3BP · Herói IP", pot: "3-bet pot", stack: "100bb", hero: "Herói IP" },
    prompt: "Em qual board mais turns podem alterar significativamente nuts, draws e forças relativas?",
    options: [
      { id: "a", label: "A♠ 9♦ 3♣" },
      { id: "b", label: "8♠ 7♠ 6♦" }
    ],
    correctOptionId: "b",
    feedback: {
      short: "8♠ 7♠ 6♦ é muito mais dinâmico: várias cartas mudam nuts, completam draws ou alteram bastante as equidades.",
      expanded: "A♠ 9♦ 3♣ é relativamente estático. Em 8♠ 7♠ 6♦, a estratégia precisa respeitar muito mais mudanças possíveis nas streets seguintes."
    },
    sourceKind: "solver-reference",
    variantGroup: "board-dynamic",
    supportNote: "Observe quantas cartas futuras realmente mudam a estrutura, não apenas quantos draws existem agora."
  },
  {
    id: "dev-board-02",
    purpose: "development",
    primarySkill: "board-reading",
    support: "supported",
    spot: { label: "3BP · Herói IP", pot: "3-bet pot", stack: "100bb", hero: "Herói IP", street: "Flop", board: ["A♠", "9♦", "3♣"] },
    prompt: "Este board tende a ser mais...",
    options: [
      { id: "static", label: "Static" },
      { id: "dynamic", label: "Dynamic" }
    ],
    correctOptionId: "static",
    feedback: {
      short: "Static. Poucos turns mudam radicalmente nuts e a estrutura relativa das mãos.",
      misconception: { dynamic: "Ter algumas cartas relevantes no turn não basta para tornar o board dinâmico. Pense na quantidade e no impacto das mudanças." }
    },
    sourceKind: "solver-reference",
    variantGroup: "board-dynamic",
    supportNote: "Pense em quantos turns mudam de verdade as nuts, completam draws importantes ou alteram bastante as equidades."
  },
  {
    id: "dev-range-01",
    purpose: "development",
    primarySkill: "range-reading",
    support: "guided",
    title: "Compare as ranges",
    spot: { label: "3BP · Herói IP", pot: "3-bet pot", stack: "100bb", hero: "Herói IP" },
    prompt: "Em qual flop o range de call do Vilão costuma ter mais combinações de mãos muito fortes?",
    options: [
      { id: "paired", label: "5♠ 5♥ 2♦" },
      { id: "connected", label: "8♠ 7♠ 6♦" }
    ],
    correctOptionId: "connected",
    feedback: {
      short: "8♠ 7♠ 6♦. O range de call do Vilão conecta mais naturalmente com sequências, sets e outras mãos muito fortes.",
      expanded: "Isso reduz a liberdade do 3-bettor para agir como se dominasse sozinho as mãos mais fortes. Board e ranges precisam ser lidos juntos."
    },
    sourceKind: "solver-reference",
    variantGroup: "range-distribution",
    supportNote: "Pergunte quem possui mais combinações entre as mãos mais fortes possíveis, e não apenas quem foi o agressor pré-flop."
  },
  {
    id: "dev-range-02",
    purpose: "development",
    primarySkill: "range-reading",
    support: "guided",
    spot: { label: "Conceito", pot: "Ranges", stack: "—", hero: "—" },
    prompt: "Qual é a diferença entre range advantage e nut advantage?",
    options: [
      { id: "same", label: "São a mesma coisa: ambos significam apenas que um range é mais forte." },
      { id: "different", label: "Range advantage compara a força dos ranges como um todo. Nut advantage compara quem tem mais combinações entre as mãos mais fortes possíveis naquele board." }
    ],
    correctOptionId: "different",
    feedback: {
      short: "Isso. Range advantage olha a força do conjunto. Nut advantage olha quem concentra mais combinações entre as mãos mais fortes possíveis naquele board.",
      expanded: "Um jogador pode ter range advantage sem dominar na mesma intensidade as melhores mãos possíveis. Por isso os dois conceitos ajudam a responder perguntas estratégicas diferentes."
    },
    sourceKind: "theory",
    variantGroup: "range-advantage",
    supportNote: "Range advantage compara a força do range como um todo. Nut advantage compara quem tem mais combinações entre as mãos mais fortes possíveis no board."
  },
  {
    id: "dev-sizing-01",
    purpose: "development",
    primarySkill: "integrated-decision",
    support: "guided",
    spot: { label: "Princípio de c-bet", pot: "3-bet pot", stack: "100bb", hero: "Herói IP" },
    prompt: "Como ponto de partida, qual conceito ajuda mais a decidir com que frequência o Herói deve fazer c-bet?",
    options: [
      { id: "range", label: "Range advantage" },
      { id: "nut", label: "Nut advantage" }
    ],
    correctOptionId: "range",
    feedback: {
      short: "Range advantage. Como ponto de partida, ele ajuda mais a pensar com que frequência o Herói pode apostar.",
      expanded: "Nut advantage continua importante, mas costuma pesar mais nos incentivos de tamanho da aposta, junto de fatores como fold equity. Não é uma fórmula automática: board, SPR e composição dos ranges também importam."
    },
    sourceKind: "solver-reference",
    variantGroup: "frequency-sizing",
    supportNote: "Como ponto de partida, pense primeiro em quem tem o range mais forte no conjunto; isso ajuda a decidir com que frequência apostar."
  },
  {
    id: "dev-range-03",
    purpose: "development",
    primarySkill: "range-reading",
    support: "supported",
    spot: { label: "Conceito", pot: "Ranges", stack: "—", hero: "—" },
    prompt: "Uma linha deixa de conter boa parte das mãos mais fortes que poderiam existir. Esse range está...",
    options: [
      { id: "capped", label: "Capped" },
      { id: "uncapped", label: "Uncapped" }
    ],
    correctOptionId: "capped",
    feedback: {
      short: "Capped. Essa linha deixou de incluir boa parte das mãos mais fortes que poderiam estar no range."
    },
    sourceKind: "theory",
    variantGroup: "capped",
    supportNote: "Pergunte se essa linha ainda consegue conter boa parte das mãos mais fortes ou se elas normalmente seguiriam outra ação."
  },
  {
    id: "dev-range-04",
    purpose: "development",
    primarySkill: "range-reading",
    support: "independent",
    spot: { label: "3BP · Flop", pot: "3-bet pot", stack: "100bb", hero: "Herói IP", action: ["Herói aposta", "Vilão paga"] },
    prompt: "O Vilão pagou a aposta no flop. Podemos concluir automaticamente que seu range está capped?",
    options: [
      { id: "yes", label: "Sim" },
      { id: "no", label: "Não" }
    ],
    correctOptionId: "no",
    feedback: {
      short: "Não. O call sozinho não prova que as mãos mais fortes saíram do range.",
      expanded: "Precisamos saber quais mãos fortes realmente tenderiam a usar outra ação naquele board, posição, sizing e perfil. Capped é uma conclusão sobre composição da linha, não um sinônimo de call.",
      misconception: { yes: "Evite o macete call = capped. A pergunta correta é: quais mãos fortes continuam plausíveis nessa linha?" }
    },
    sourceKind: "theory",
    variantGroup: "capped"
  },
  {
    id: "dev-sizing-02",
    purpose: "development",
    primarySkill: "sizing",
    support: "supported",
    spot: { label: "Sizing", pot: "3-bet pot", stack: "100bb", hero: "Herói IP" },
    prompt: "Se o Herói concentra mais mãos muito fortes e o Vilão ainda pode pagar com muitas mãos piores que têm equity relevante, qual sizing ganha mais incentivo?",
    options: [
      { id: "big", label: "Aposta maior" },
      { id: "small", label: "Aposta menor" }
    ],
    correctOptionId: "big",
    feedback: {
      short: "Aposta maior. Quando o Herói tem mais combinações entre as mãos mais fortes possíveis e muitas mãos piores do Vilão ainda podem pagar com equity relevante, existe incentivo para cobrar mais.",
      expanded: "Isso não significa que nut advantage = aposta grande em qualquer spot. É apenas um incentivo dentro de um conjunto de fatores."
    },
    sourceKind: "solver-reference",
    variantGroup: "sizing-incentives",
    supportNote: "Pense nas mãos piores que ainda pagam. Se muitas continuam contra uma aposta maior, cobrar mais ganha incentivo."
  },
  {
    id: "dev-sizing-03",
    purpose: "development",
    primarySkill: "sizing",
    support: "supported",
    spot: { label: "Sizing", pot: "3-bet pot", stack: "100bb", hero: "Herói IP" },
    prompt: "O Vilão ainda chega aqui com várias mãos muito fortes, enquanto as mãos fracas que foldariam contra uma aposta têm pouca equity. Qual direção de sizing ganha mais incentivo?",
    options: [
      { id: "small", label: "Aposta menor / mais cautela" },
      { id: "big", label: "Aposta maior automaticamente" }
    ],
    correctOptionId: "small",
    feedback: {
      short: "Aposta menor ou mais cautela. Há pouco ganho em apostar grande apenas para fazer mãos de pouca equity foldarem, enquanto o Vilão ainda pode ter várias mãos muito fortes."
    },
    sourceKind: "solver-reference",
    variantGroup: "sizing-incentives",
    supportNote: "Pergunte o que uma aposta maior realmente faria foldar. Se são mãos com pouca equity e o Vilão ainda pode ter mãos muito fortes, aumentar o tamanho ganha menos."
  },
  {
    id: "dev-integrated-01",
    purpose: "development",
    primarySkill: "integrated-decision",
    support: "supported",
    spot: { label: "3BP · Herói IP", pot: "3-bet pot", stack: "100bb", hero: "Herói IP", street: "Flop", board: ["A♠", "9♦", "3♣"] },
    prompt: "Board muito static e várias mãos médias do Herói ganham pouco construindo um pote grande. Qual direção estratégica é mais coerente?",
    options: [
      { id: "small-check", label: "Mais check e/ou apostas pequenas" },
      { id: "big-auto", label: "Bet grande automático" }
    ],
    correctOptionId: "small-check",
    feedback: {
      short: "Mais check e/ou apostas pequenas. Ter vantagem não significa que toda a range queira colocar muito dinheiro no pote."
    },
    sourceKind: "solver-reference",
    variantGroup: "integrated-board-range",
    supportNote: "Não confunda vantagem de range com obrigação de construir um pote grande. Pense no que as mãos médias do Herói realmente ganham apostando."
  },
  {
    id: "dev-integrated-02",
    purpose: "development",
    primarySkill: "integrated-decision",
    support: "independent",
    spot: { label: "3BP · Herói IP", pot: "3-bet pot", stack: "100bb", hero: "Herói IP", street: "Flop", board: ["8♠", "7♠", "6♦"] },
    prompt: "O Vilão tem bastante acesso às mãos mais fortes e o Herói possui muitos overcards que não conectaram. Qual direção ganha incentivo?",
    options: [
      { id: "check", label: "Check mais" },
      { id: "range-bet", label: "Range bet automático" }
    ],
    correctOptionId: "check",
    feedback: {
      short: "Check mais. Esse board dá ao range de call do Vilão mais combinações de mãos muito fortes e reduz o incentivo a apostar automaticamente."
    },
    sourceKind: "solver-reference",
    variantGroup: "integrated-board-range"
  },
  {
    id: "dev-integrated-03",
    purpose: "development",
    primarySkill: "integrated-decision",
    support: "independent",
    title: "Contraste",
    spot: { label: "3BP · Herói IP", pot: "3-bet pot", stack: "100bb", hero: "Herói IP" },
    prompt: "Em qual flop o 3-bettor IP deve, em geral, ter mais cautela porque o Vilão alcança mais combinações muito fortes?",
    options: [
      { id: "paired", label: "5♠ 5♥ 2♦" },
      { id: "connected", label: "8♠ 7♠ 6♦" }
    ],
    correctOptionId: "connected",
    feedback: {
      short: "8♠ 7♠ 6♦. O motivo não é apenas ser 'dinâmico': o range de call do Vilão possui mais acesso natural às mãos extremamente fortes.",
      misconception: { paired: "Evite decidir só pela aparência do board. Pergunte quais mãos muito fortes cada range realmente consegue ter nessa textura." }
    },
    sourceKind: "solver-reference",
    variantGroup: "integrated-board-range"
  }  ,
  {
    id: "dev-range-actions-01",
    purpose: "development",
    primarySkill: "range-reading",
    support: "guided",
    title: "Da ação ao range",
    spot: {
      label: "Premissa explícita",
      pot: "Heads-up",
      stack: "100bb",
      hero: "Herói IP",
      action: [
        "Neste exercício: sets e two pair do Vilão quase sempre aumentam contra 33%",
        "Herói aposta 33%",
        "Vilão paga"
      ]
    },
    prompt: "Depois desse call, como ficam sets e two pair dentro do range que continua?",
    options: [
      { id: "less", label: "Ficam menos representados" },
      { id: "same", label: "Continuam igualmente representados" }
    ],
    correctOptionId: "less",
    feedback: {
      short: "Ficam menos representados. Se essas mãos quase sempre escolheriam raise, o call filtra boa parte delas para fora dessa linha.",
      expanded: "A ideia central é atualizar o range a partir de uma premissa sobre as ações. Não é o call, sozinho, que faz isso: é o contraste entre o que esperávamos das mãos muito fortes e a ação que realmente aconteceu."
    },
    sourceKind: "theory",
    variantGroup: "range-action-inference",
    learningPackage: "range-actions",
    packageSequence: 1,
    concept: "range-inference",
    subconcept: "action-filtering",
    reasoningPattern: "premise-action-range",
    supportNote: "Se sets e two pair quase sempre aumentariam, pergunte quanto dessas mãos sobra no range que apenas paga."
  },
  {
    id: "dev-range-actions-02",
    purpose: "development",
    primarySkill: "range-reading",
    support: "supported",
    spot: { label: "Conceito", pot: "Ranges", stack: "—", hero: "—" },
    prompt: "Uma linha deixa boa parte das mãos mais fortes pouco representadas. Como descrevemos esse range?",
    options: [
      { id: "capped", label: "Capped" },
      { id: "uncapped", label: "Uncapped" }
    ],
    correctOptionId: "capped",
    feedback: {
      short: "Capped. As mãos mais fortes possíveis ficaram ausentes ou pouco representadas nessa linha.",
      expanded: "Capped não significa simplesmente 'range fraco'. A palavra descreve principalmente quanto do topo ainda consegue chegar por aquela linha."
    },
    sourceKind: "theory",
    variantGroup: "capped-meaning",
    learningPackage: "range-actions",
    packageSequence: 2,
    concept: "range-inference",
    subconcept: "capped-uncapped",
    reasoningPattern: "range-label",
    supportNote: "Pergunte se boa parte das mãos mais fortes ainda consegue chegar por essa linha."
  },
  {
    id: "dev-range-actions-03",
    purpose: "development",
    primarySkill: "range-reading",
    support: "supported",
    title: "Contraste mínimo",
    spot: {
      label: "Mesma premissa",
      pot: "Heads-up",
      stack: "100bb",
      hero: "Herói IP",
      action: [
        "Neste exercício: Vilão aumenta sets com muita frequência",
        "Linha A: Vilão aumenta",
        "Linha B: Vilão apenas paga"
      ]
    },
    prompt: "Em qual range os sets ficam menos representados?",
    options: [
      { id: "a", label: "No range da Linha A" },
      { id: "b", label: "No range da Linha B" }
    ],
    correctOptionId: "b",
    feedback: {
      short: "Linha B. Se sets tendem a aumentar, eles aparecem menos no range que apenas paga.",
      expanded: "O exercício não pergunta qual ação 'parece mais forte'. Ele pergunta como uma estratégia de ação distribui determinadas mãos entre linhas diferentes."
    },
    sourceKind: "theory",
    variantGroup: "range-action-inference",
    learningPackage: "range-actions",
    packageSequence: 3,
    concept: "range-inference",
    subconcept: "action-filtering",
    reasoningPattern: "contrast-lines",
    supportNote: "Use a premissa: se sets costumam aumentar, em qual das duas linhas eles aparecem menos?"
  },
  {
    id: "dev-range-actions-04",
    purpose: "development",
    primarySkill: "range-reading",
    support: "independent",
    spot: {
      label: "Anti-macete",
      pot: "Heads-up",
      stack: "100bb",
      hero: "Herói IP",
      action: ["Herói aposta no flop", "Vilão paga"]
    },
    prompt: "O call, sozinho, é suficiente para concluir que o range do Vilão está capped?",
    options: [
      { id: "yes", label: "Sim" },
      { id: "no", label: "Não" }
    ],
    correctOptionId: "no",
    feedback: {
      short: "Não. Primeiro precisamos saber quais mãos muito fortes tenderiam a escolher outra ação nesse spot.",
      expanded: "Call não é sinônimo de capped. Board, sizing, posição, número de jogadores e estratégia esperada das mãos fortes mudam quanto aquele call realmente informa.",
      misconception: {
        yes: "Evite transformar 'call = capped' em regra. A pergunta anterior é: quais mãos muito fortes ainda fazem sentido nessa linha?"
      }
    },
    sourceKind: "theory",
    variantGroup: "capped-boundaries",
    learningPackage: "range-actions",
    packageSequence: 4,
    concept: "range-inference",
    subconcept: "capped-uncapped",
    reasoningPattern: "avoid-action-shortcut"
  },
  {
    id: "dev-range-actions-05",
    purpose: "development",
    primarySkill: "range-reading",
    support: "guided",
    spot: {
      label: "Informação que falta",
      pot: "Heads-up",
      stack: "100bb",
      hero: "Herói IP",
      action: ["Herói aposta", "Vilão paga"]
    },
    prompt: "Antes de chamar o range de capped, qual informação é mais importante?",
    options: [
      { id: "strong-actions", label: "Quais mãos muito fortes tenderiam a escolher outra ação nesse spot" },
      { id: "hero-hand", label: "A força exata da mão do Herói" },
      { id: "turn-size", label: "Qual sizing o Herói pretende usar no turn" }
    ],
    correctOptionId: "strong-actions",
    feedback: {
      short: "Precisamos saber como as mãos muito fortes tenderiam a agir. É isso que permite inferir se elas foram filtradas dessa linha.",
      expanded: "A mão do Herói e o sizing futuro são importantes para decidir depois. Mas, para responder especificamente se o range ficou capped, precisamos primeiro entender quais mãos fortes ainda permanecem plausíveis."
    },
    sourceKind: "theory",
    variantGroup: "capped-diagnostic-question",
    learningPackage: "range-actions",
    packageSequence: 5,
    concept: "range-inference",
    subconcept: "capped-uncapped",
    reasoningPattern: "ask-before-label",
    supportNote: "Separe diagnóstico de range da decisão final: primeiro descubra quais mãos fortes ainda podem estar ali."
  },
  {
    id: "dev-range-actions-06",
    purpose: "development",
    primarySkill: "range-reading",
    support: "supported",
    spot: {
      label: "Boundary case · Multiway",
      pot: "4-way",
      stack: "100bb+",
      hero: "Herói",
      action: ["Herói aposta", "Vilão é o próximo a agir", "Ainda há dois jogadores atrás", "Vilão paga"]
    },
    prompt: "Uma mão muito forte pode escolher call para manter jogadores atrás no pote?",
    options: [
      { id: "yes", label: "Sim" },
      { id: "no", label: "Não" }
    ],
    correctOptionId: "yes",
    feedback: {
      short: "Sim. Multiway pode criar incentivo para trapar e deixar jogadores atrás continuarem.",
      expanded: "Isso não significa que todo call multiway seja forte. Significa apenas que esse call, sozinho, fornece menos evidência de que as mãos muito fortes desapareceram do range."
    },
    sourceKind: "heuristic",
    variantGroup: "capped-boundaries",
    learningPackage: "range-actions",
    packageSequence: 6,
    concept: "range-inference",
    subconcept: "multiway-traps",
    reasoningPattern: "context-changes-action-meaning",
    supportNote: "Pergunte se o Vilão ganha algo mantendo os jogadores que ainda estão atrás dentro do pote."
  },
  {
    id: "dev-range-actions-07",
    purpose: "development",
    primarySkill: "range-reading",
    support: "supported",
    title: "Mesmo call, contexto diferente",
    spot: {
      label: "Contraste",
      pot: "Heads-up × Multiway",
      stack: "100bb+",
      hero: "Herói",
      action: [
        "A: heads-up; sabemos que as mãos muito fortes normalmente aumentam",
        "B: multiway; sabemos que mãos muito fortes às vezes pagam para manter jogadores atrás"
      ]
    },
    prompt: "Em qual situação o call fornece MENOS evidência de que o range ficou capped?",
    options: [
      { id: "a", label: "Situação A" },
      { id: "b", label: "Situação B" }
    ],
    correctOptionId: "b",
    feedback: {
      short: "Situação B. Se mãos muito fortes também podem usar call, essa ação filtra menos o topo do range.",
      expanded: "A lição é estrutural: a mesma ação pode carregar informação diferente porque o contexto altera quais mãos escolhem aquela linha."
    },
    sourceKind: "theory",
    variantGroup: "capped-boundaries",
    learningPackage: "range-actions",
    packageSequence: 7,
    concept: "range-inference",
    subconcept: "context-dependence",
    reasoningPattern: "minimal-pair-context",
    supportNote: "Compare quanto do topo ainda pode escolher call em cada situação."
  },
  {
    id: "dev-range-actions-08",
    purpose: "development",
    primarySkill: "range-reading",
    support: "independent",
    spot: {
      label: "Boundary case · River",
      pot: "Heads-up",
      stack: "Deep",
      hero: "Herói agressor",
      action: [
        "Herói faz uma aposta muito grande no turn",
        "Vilão paga",
        "River completa um flush",
        "Vilão checks"
      ]
    },
    prompt: "O check no river, sozinho, elimina os flushes fortes do range do Vilão?",
    options: [
      { id: "yes", label: "Sim" },
      { id: "no", label: "Não" }
    ],
    correctOptionId: "no",
    feedback: {
      short: "Não. Depois de enfrentar muita agressão, mãos muito fortes ainda podem checkar esperando que o Herói continue apostando.",
      expanded: "Check também não é sinônimo de capped. A interpretação depende da linha inteira e de quais mãos fortes possuem motivo para apostar ou para esperar nova agressão."
    },
    sourceKind: "heuristic",
    variantGroup: "capped-boundaries",
    learningPackage: "range-actions",
    packageSequence: 8,
    concept: "range-inference",
    subconcept: "check-does-not-equal-capped",
    reasoningPattern: "context-changes-action-meaning"
  },
  {
    id: "dev-range-actions-09",
    purpose: "development",
    primarySkill: "range-reading",
    support: "supported",
    spot: { label: "Ferramenta mental", pot: "Ranges", stack: "—", hero: "—" },
    prompt: "Qual pergunta é mais útil ANTES de decidir se um range está capped ou uncapped?",
    options: [
      { id: "strong-hands", label: "Quais das mãos mais fortes ainda fazem sentido nesta linha?" },
      { id: "hero-strength", label: "Minha mão específica é forte ou fraca?" },
      { id: "next-size", label: "Qual tamanho quero apostar na próxima street?" }
    ],
    correctOptionId: "strong-hands",
    feedback: {
      short: "Quais das mãos mais fortes ainda fazem sentido nesta linha? Esse é o diagnóstico que sustenta o rótulo capped/uncapped.",
      expanded: "A força da mão do Herói e o sizing entram depois, na decisão. Aqui estamos isolando a leitura da composição do range adversário."
    },
    sourceKind: "theory",
    variantGroup: "capped-diagnostic-question",
    learningPackage: "range-actions",
    packageSequence: 9,
    concept: "range-inference",
    subconcept: "capped-uncapped",
    reasoningPattern: "ask-before-label",
    supportNote: "Procure a pergunta que atualiza o range do Vilão, não a que escolhe a ação do Herói."
  },
  {
    id: "dev-range-actions-10",
    purpose: "development",
    primarySkill: "range-reading",
    support: "independent",
    spot: {
      label: "Conceitos diferentes",
      pot: "Ranges",
      stack: "—",
      hero: "—",
      action: [
        "Range A tem mais mãos fortes no conjunto",
        "Range B é mais fraco no conjunto",
        "Os dois ainda conseguem chegar com as melhores mãos possíveis"
      ]
    },
    prompt: "Os dois ranges podem continuar uncapped?",
    options: [
      { id: "yes", label: "Sim" },
      { id: "no", label: "Não" }
    ],
    correctOptionId: "yes",
    feedback: {
      short: "Sim. Um range pode ser mais forte no conjunto e, ainda assim, ambos continuarem uncapped.",
      expanded: "'Range mais forte' descreve força global. Capped/uncapped descreve se o topo continua representado. São dimensões diferentes."
    },
    sourceKind: "theory",
    variantGroup: "capped-meaning",
    learningPackage: "range-actions",
    packageSequence: 10,
    concept: "range-inference",
    subconcept: "range-strength-vs-cap",
    reasoningPattern: "distinguish-concepts"
  },
  {
    id: "dev-range-actions-11",
    purpose: "development",
    primarySkill: "range-reading",
    support: "independent",
    spot: { label: "Limite do conceito", pot: "Ranges", stack: "—", hero: "—" },
    prompt: "Se concluímos que o range do Vilão está uncapped, o que isso nos diz com segurança?",
    options: [
      { id: "top-still-there", label: "Mãos muito fortes ainda fazem parte da decisão" },
      { id: "always-small", label: "Devemos sempre usar sizing pequeno" },
      { id: "hero-weaker", label: "O range do Herói é necessariamente mais fraco" }
    ],
    correctOptionId: "top-still-there",
    feedback: {
      short: "Mãos muito fortes ainda fazem parte da decisão. O rótulo não escolhe sozinho nossa ação nem nosso sizing.",
      expanded: "Uncapped descreve composição. Para decidir, ainda precisamos considerar nossa mão, objetivo, distribuição dos ranges, SPR e resposta esperada aos diferentes tamanhos."
    },
    sourceKind: "theory",
    variantGroup: "capped-meaning",
    learningPackage: "range-actions",
    packageSequence: 11,
    concept: "range-inference",
    subconcept: "capped-is-not-action",
    reasoningPattern: "avoid-label-to-action-shortcut"
  },
  {
    id: "dev-range-actions-12",
    purpose: "development",
    primarySkill: "range-reading",
    support: "independent",
    title: "Integração",
    spot: {
      label: "Linha completa",
      pot: "Heads-up",
      stack: "100bb",
      hero: "Herói IP",
      action: [
        "Neste exercício: Vilão aumenta quase todos os sets contra a aposta pequena",
        "Herói aposta pequeno no flop",
        "Vilão paga",
        "Turn é uma carta neutra e Vilão checks"
      ]
    },
    prompt: "Qual conclusão é mais precisa?",
    options: [
      { id: "less-sets", label: "Sets ficaram menos representados, mas isso é apenas uma informação sobre o range — ainda não determina nossa ação" },
      { id: "weak-range", label: "O range do Vilão agora é fraco, então uma aposta grande sempre funciona" },
      { id: "no-strong", label: "O call provou que o Vilão não tem nenhuma mão muito forte" }
    ],
    correctOptionId: "less-sets",
    feedback: {
      short: "Essa é a leitura precisa: a linha reduz sets segundo a premissa, sem transformar o range em 'fraco' nem escolher automaticamente a próxima ação.",
      expanded: "O objetivo do pacote é manter o fio: premissa → ação observada → atualização do range. Só depois essa leitura entra na decisão estratégica."
    },
    sourceKind: "theory",
    variantGroup: "range-action-inference",
    learningPackage: "range-actions",
    packageSequence: 12,
    concept: "range-inference",
    subconcept: "integrated-inference",
    reasoningPattern: "premise-action-range"
  }

  ,
  {
    id: "dev-range-decision-01",
    purpose: "development",
    primarySkill: "integrated-decision",
    support: "guided",
    title: "A ação tem função?",
    spot: {
      label: "River · Range polar",
      pot: "Heads-up",
      stack: "100bb",
      hero: "Herói com showdown value",
      action: [
        "Vilão tem principalmente mãos muito fortes ou blefes",
        "Nossa mão vence os blefes",
        "As mãos muito fortes praticamente não foldam para raise"
      ]
    },
    prompt: "O que um raise como blefe consegue nesta situação?",
    options: [
      { id: "useful-folds", label: "Faz uma parte importante das mãos melhores foldar" },
      { id: "little", label: "Pouco: os blefes já perdem e as mãos fortes continuam" }
    ],
    correctOptionId: "little",
    feedback: {
      short: "O raise não melhora nossa situação contra nenhuma das duas partes centrais do range.",
      expanded: "Contra os blefes, já ganhamos sem aumentar. Contra as mãos muito fortes, o raise não produz os folds necessários. Dadas essas premissas, transformar a mão em blefe não cumpre uma função relevante.",
      misconception: {
        "useful-folds": "Agressão só é útil se fizer uma parte relevante das mãos melhores mudar de decisão. Aqui, as mãos fortes continuam e os blefes já perdem para nossa mão."
      }
    },
    sourceKind: "theory",
    variantGroup: "decision-action-function",
    learningPackage: "range-to-decision",
    packageSequence: 1,
    concept: "decision-logic",
    subconcept: "action-function",
    reasoningPattern: "range-objective-action",
    supportNote: "Separe o range do Vilão em blefes e mãos fortes. Pergunte o que cada parte faz contra o raise."
  },
  {
    id: "dev-range-decision-02",
    purpose: "development",
    primarySkill: "integrated-decision",
    support: "supported",
    title: "Objetivo × tamanho",
    spot: {
      label: "Blefe · Mão-alvo Kx",
      pot: "River",
      stack: "100bb",
      hero: "Herói blefando",
      action: [
        "50% pot → Kx normalmente paga",
        "100% pot → Kx ainda paga bastante",
        "175% pot → Kx começa a foldar bastante",
        "Herói pensa: 50% arrisca menos quando recebe call"
      ]
    },
    prompt: "Qual é o principal problema desse raciocínio?",
    options: [
      { id: "misses-goal", label: "O size reduz o risco, mas deixa de produzir justamente o fold que motivava o blefe" },
      { id: "always-max", label: "Um blefe deve sempre usar o maior size disponível, independentemente do range" }
    ],
    correctOptionId: "misses-goal",
    feedback: {
      short: "Reduzir o risco não ajuda se a ação deixa de cumprir a função que justificava o blefe.",
      expanded: "Isso ainda não prova que 175% seja lucrativo. Mostra apenas que 50%, pelas premissas fornecidas, não atinge a mão-alvo. Depois ainda precisaríamos comparar custo, frequência de folds e EV.",
      misconception: {
        "always-max": "O problema não é uma regra 'blefe = size máximo'. O ponto é escolher um tamanho que tenha alguma chance de produzir a reação necessária."
      }
    },
    sourceKind: "theory",
    variantGroup: "decision-action-function",
    learningPackage: "range-to-decision",
    packageSequence: 2,
    concept: "decision-logic",
    subconcept: "objective-size-fit",
    reasoningPattern: "objective-action-fit",
    supportNote: "Volte ao objetivo declarado: qual mão precisa foldar para o blefe cumprir sua função?"
  },
  {
    id: "dev-range-decision-03",
    purpose: "development",
    primarySkill: "integrated-decision",
    support: "guided",
    title: "Value depende de quem paga",
    spot: {
      label: "Mão espelho",
      pot: "River",
      stack: "100bb",
      hero: "Mesma mão forte do Herói",
      action: [
        "Situação A: muitas mãos piores continuam contra uma aposta",
        "Situação B: quase todas as mãos piores foldam e as mãos melhores continuam"
      ]
    },
    prompt: "Em qual situação apostar por value tem uma justificativa mais clara?",
    options: [
      { id: "a", label: "Situação A" },
      { id: "b", label: "Situação B" }
    ],
    correctOptionId: "a",
    feedback: {
      short: "Situação A. A força absoluta da mão não basta; precisamos de mãos piores capazes de continuar.",
      expanded: "A mesma mão do Herói pode ter incentivos diferentes contra ranges diferentes. Value nasce da relação entre nossa mão e as mãos piores que respondem à aposta.",
      misconception: {
        "b": "Se as mãos piores saem e as melhores continuam, 'tenho uma mão forte' sozinho não cria uma boa razão para apostar por value."
      }
    },
    sourceKind: "theory",
    variantGroup: "decision-value-target",
    learningPackage: "range-to-decision",
    packageSequence: 3,
    concept: "action-objective",
    subconcept: "value-target",
    reasoningPattern: "range-objective-action",
    supportNote: "Value depende apenas da força da nossa mão ou também de quais mãos piores conseguem pagar?"
  },
  {
    id: "dev-range-decision-04",
    purpose: "development",
    primarySkill: "integrated-decision",
    support: "supported",
    title: "Carregue o fio entre streets",
    spot: {
      label: "Turn → River",
      pot: "Heads-up",
      stack: "100bb",
      hero: "Herói agressor",
      action: [
        "Turn: Herói aposta grande principalmente para fazer pares médios foldarem",
        "Vilão paga",
        "River não altera significativamente a força relativa das mãos"
      ]
    },
    prompt: "Ao chegar ao river, qual afirmação é mais coerente?",
    options: [
      { id: "filtered", label: "Muitos dos pares médios que queríamos expulsar já devem estar menos presentes" },
      { id: "reset", label: "Como começou uma nova street, devemos voltar ao range anterior à aposta do turn" }
    ],
    correctOptionId: "filtered",
    feedback: {
      short: "Nossa própria ação ajudou a construir o range que chegou ao river.",
      expanded: "Cada ação filtra combinações. Uma street nova não reinicia a leitura do zero: o range do river é consequência da linha anterior.",
      misconception: {
        "reset": "O call do turn carregou informação para o river. Ignorá-lo é quebrar o fio lógico da mão."
      }
    },
    sourceKind: "theory",
    variantGroup: "decision-street-thread",
    learningPackage: "range-to-decision",
    packageSequence: 4,
    concept: "decision-logic",
    subconcept: "street-continuity",
    reasoningPattern: "action-updates-range",
    supportNote: "O call ocorreu depois da aposta grande. Pense em quais mãos essa aposta já tentou retirar."
  },
  {
    id: "dev-range-decision-05",
    purpose: "development",
    primarySkill: "sizing",
    support: "guided",
    title: "Qual parte do range importa?",
    spot: {
      label: "Value sizing",
      pot: "River",
      stack: "100bb",
      hero: "Herói com value",
      action: [
        "Flush forte → continua contra praticamente qualquer size",
        "Qx → paga alguns sizes e folda outros",
        "Ar → folda contra praticamente qualquer size"
      ]
    },
    prompt: "Qual grupo merece mais atenção ao escolher nosso tamanho?",
    options: [
      { id: "flush", label: "Flushes fortes" },
      { id: "qx", label: "Qx" },
      { id: "air", label: "Ar" }
    ],
    correctOptionId: "qx",
    feedback: {
      short: "Qx está na fronteira: sua decisão realmente muda quando o size muda.",
      expanded: "As mãos que fariam praticamente a mesma coisa contra qualquer size muitas vezes não determinam o tamanho. A região intermediária pode definir quanto conseguimos extrair.",
      misconception: {
        "flush": "Olhar só para as mãos mais fortes pode esconder a parte do range cuja decisão realmente muda com o tamanho.",
        "air": "O ar já tende a foldar de qualquer maneira; variar o size pouco altera essa resposta."
      }
    },
    sourceKind: "theory",
    variantGroup: "sizing-target-response",
    learningPackage: "range-to-decision",
    packageSequence: 5,
    concept: "sizing-response",
    subconcept: "value-target",
    reasoningPattern: "target-response-size",
    supportNote: "Qual grupo realmente muda de comportamento quando o size muda?"
  },
  {
    id: "dev-range-decision-06",
    purpose: "development",
    primarySkill: "sizing",
    support: "supported",
    title: "Fold útil",
    spot: {
      label: "Bluff sizing",
      pot: "River",
      stack: "100bb",
      hero: "Herói blefando",
      action: [
        "Ar → folda para quase qualquer aposta",
        "Par médio → paga sizes menores e começa a foldar sob muita pressão",
        "Mãos muito fortes → continuam contra praticamente qualquer size"
      ]
    },
    prompt: "Qual parte do range mais ajuda a decidir se aumentar o size realmente tem utilidade?",
    options: [
      { id: "air", label: "Ar" },
      { id: "middle", label: "Par médio" },
      { id: "strong", label: "Mãos muito fortes" }
    ],
    correctOptionId: "middle",
    feedback: {
      short: "O par médio é a parte cuja resposta podemos realmente alterar aumentando a pressão.",
      expanded: "O ar já sai e as mãos muito fortes continuam. Para o blefe, a pergunta útil é quais mãos melhores podem cruzar a fronteira de call para fold.",
      misconception: {
        "air": "Fazer foldar uma mão que já desistiria para quase qualquer size não é o principal ganho de aumentar a aposta.",
        "strong": "Se as mãos muito fortes não pretendem foldar, elas não definem onde o size começa a gerar fold equity adicional."
      }
    },
    sourceKind: "theory",
    variantGroup: "sizing-target-response",
    learningPackage: "range-to-decision",
    packageSequence: 6,
    concept: "sizing-response",
    subconcept: "bluff-target",
    reasoningPattern: "target-response-size",
    supportNote: "Procure a parte do range que pode mudar de call para fold quando a pressão aumenta."
  },
  {
    id: "dev-range-decision-07",
    purpose: "development",
    primarySkill: "sizing",
    support: "supported",
    title: "Sensível ao tamanho",
    spot: {
      label: "Resposta de QJ",
      pot: "River",
      stack: "100bb",
      hero: "—",
      action: [
        "33% pot → CALL",
        "75% pot → CALL",
        "150% pot → FOLD com frequência"
      ]
    },
    prompt: "O que isso nos diz sobre QJ neste contexto?",
    options: [
      { id: "sensitive", label: "Sua decisão é sensível ao tamanho" },
      { id: "insensitive", label: "Sua decisão muda pouco com o tamanho" }
    ],
    correctOptionId: "sensitive",
    feedback: {
      short: "A decisão de QJ muda bastante quando o tamanho aumenta.",
      expanded: "É isso que queremos dizer por sensível ao tamanho. Não significa que QJ seja sempre assim; a resposta depende de board, range, street, stack e linha."
    },
    sourceKind: "theory",
    variantGroup: "sizing-sensitivity",
    learningPackage: "range-to-decision",
    packageSequence: 7,
    concept: "sizing-response",
    subconcept: "size-sensitive",
    reasoningPattern: "compare-response-across-sizes",
    supportNote: "Compare a decisão contra 33% e contra 150%, não apenas o tamanho absoluto das apostas."
  },
  {
    id: "dev-range-decision-08",
    purpose: "development",
    primarySkill: "sizing",
    support: "independent",
    title: "Pouco sensível ao tamanho",
    spot: {
      label: "Resposta de um nut flush draw",
      pot: "Turn",
      stack: "100bb",
      hero: "—",
      action: [
        "33% pot → CONTINUA",
        "75% pot → CONTINUA",
        "150% pot → CONTINUA"
      ]
    },
    prompt: "Qual descrição é mais adequada?",
    options: [
      { id: "low", label: "Pouco sensível ao tamanho neste contexto" },
      { id: "high", label: "Muito sensível ao tamanho porque 150% é uma aposta grande" }
    ],
    correctOptionId: "low",
    feedback: {
      short: "O tamanho mudou bastante; a decisão da mão, não.",
      expanded: "Sensibilidade descreve como a mão responde à mudança do size. Uma aposta enorme não torna uma mão automaticamente sensível ao tamanho.",
      misconception: {
        "high": "Não confunda size grande com grande mudança de decisão. Aqui a mão continua em todas as opções apresentadas."
      }
    },
    sourceKind: "theory",
    variantGroup: "sizing-sensitivity",
    learningPackage: "range-to-decision",
    packageSequence: 8,
    concept: "sizing-response",
    subconcept: "size-insensitive",
    reasoningPattern: "compare-response-across-sizes"
  },
  {
    id: "dev-range-decision-09",
    purpose: "development",
    primarySkill: "sizing",
    support: "supported",
    title: "Fronteira de call",
    spot: {
      label: "Value · Alvo QJ",
      pot: "River",
      stack: "100bb",
      hero: "Herói com value",
      action: [
        "50% pot → QJ paga bastante",
        "75% pot → QJ paga bastante",
        "125% pot → QJ começa a foldar muito"
      ]
    },
    prompt: "Entre esses tamanhos, qual ganha mais incentivo dadas exatamente essas respostas?",
    options: [
      { id: "50", label: "50% pot" },
      { id: "75", label: "75% pot" },
      { id: "125", label: "125% pot" }
    ],
    correctOptionId: "75",
    feedback: {
      short: "75% aumenta o pote em relação a 50% sem perder os calls de QJ que começamos a perder em 125%.",
      expanded: "Isso não torna 75% um size universal para QJ. A escolha nasce das respostas fornecidas neste exercício.",
      misconception: {
        "50": "QJ também paga 75% nas premissas dadas. Escolher 50% garante o call, mas deixa de extrair o aumento disponível sem perder essa mão-alvo.",
        "125": "125% constrói um pote maior quando recebe call, mas começa a expulsar justamente a mão pior que estamos tentando manter."
      }
    },
    sourceKind: "theory",
    variantGroup: "sizing-frontier",
    learningPackage: "range-to-decision",
    packageSequence: 9,
    concept: "sizing-choice",
    subconcept: "value-frontier",
    reasoningPattern: "target-response-size",
    supportNote: "Queremos aumentar o pote sem atravessar demais a fronteira onde a principal mão-alvo começa a foldar."
  },
  {
    id: "dev-range-decision-10",
    purpose: "development",
    primarySkill: "sizing",
    support: "independent",
    title: "Fronteira de fold",
    spot: {
      label: "Blefe · Alvo Qx",
      pot: "River",
      stack: "100bb",
      hero: "Herói blefando",
      action: [
        "75% pot → Qx paga",
        "125% pot → Qx paga bastante",
        "175% pot → Qx folda bastante"
      ]
    },
    prompt: "Qual é o primeiro tamanho apresentado que começa a produzir o fold necessário?",
    options: [
      { id: "75", label: "75% pot" },
      { id: "125", label: "125% pot" },
      { id: "175", label: "175% pot" }
    ],
    correctOptionId: "175",
    feedback: {
      short: "175% é o primeiro size apresentado que começa a produzir a reação que o blefe procurava. Isso ainda não significa que o blefe seja lucrativo.",
      expanded: "Para avaliar EV ainda precisaríamos considerar quanto arriscamos, quantas combinações de Qx existem, o restante do range e a frequência de folds."
    },
    sourceKind: "theory",
    variantGroup: "sizing-frontier",
    learningPackage: "range-to-decision",
    packageSequence: 10,
    concept: "sizing-choice",
    subconcept: "bluff-frontier",
    reasoningPattern: "target-response-size"
  },
  {
    id: "dev-range-decision-11",
    purpose: "development",
    primarySkill: "sizing",
    support: "independent",
    title: "Fold adicional tem custo",
    spot: {
      label: "Comparação de blefes",
      pot: "River",
      stack: "100bb",
      hero: "Herói blefando",
      action: [
        "Bet 75 → Vilão folda 40%",
        "Bet 150 → Vilão folda 50%"
      ]
    },
    prompt: "Qual conclusão é defensável apenas com essas informações?",
    options: [
      { id: "more-folds", label: "150 é melhor porque gera mais folds" },
      { id: "compare-cost", label: "Precisamos comparar o ganho dos folds adicionais com o custo adicional da aposta" }
    ],
    correctOptionId: "compare-cost",
    feedback: {
      short: "Mais folds podem ser valiosos, mas não são gratuitos.",
      expanded: "Esse é um primeiro contato com a lógica de EV sem exigir fórmula: o risco adicional precisa produzir benefício suficiente para justificá-lo.",
      misconception: {
        "more-folds": "Maximizar a frequência de folds não é o mesmo que maximizar EV. O tamanho maior também perde mais quando é pago."
      }
    },
    sourceKind: "theory",
    variantGroup: "sizing-cost-benefit",
    learningPackage: "range-to-decision",
    packageSequence: 11,
    concept: "sizing-choice",
    subconcept: "cost-benefit",
    reasoningPattern: "incremental-risk-reward"
  },
  {
    id: "dev-range-decision-12",
    purpose: "development",
    primarySkill: "integrated-decision",
    support: "independent",
    title: "Integração",
    spot: {
      label: "River · Value",
      pot: "Heads-up",
      stack: "100bb",
      hero: "Herói vence os bluff catchers",
      action: [
        "Range do Vilão: 10% mãos muito fortes · 50% bluff catchers · 40% mãos fracas",
        "50%: fortes CALL · bluff catchers CALL · fracas FOLD",
        "75%: fortes CALL · bluff catchers CALL · fracas FOLD",
        "150%: fortes CALL · bluff catchers FOLD · fracas FOLD"
      ]
    },
    prompt: "Qual tamanho parece aproveitar melhor o principal alvo de value?",
    options: [
      { id: "50", label: "50% pot" },
      { id: "75", label: "75% pot" },
      { id: "150", label: "150% pot" }
    ],
    correctOptionId: "75",
    feedback: {
      short: "75% aumenta o pote sem perder os 50% de bluff catchers que nossa mão vence e quer manter.",
      expanded: "150% extrai mais quando encontra os 10% de mãos muito fortes, mas expulsa a parcela muito maior de bluff catchers. 50% também recebe esses calls, porém deixa dinheiro na mesa em relação a 75% nas respostas fornecidas.",
      misconception: {
        "50": "Você identificou corretamente que queremos manter os bluff catchers. Mas, nas premissas fornecidas, eles também pagam 75%, que constrói um pote maior.",
        "150": "O size maior recebe call das mãos muito fortes, mas expulsa metade do range: os bluff catchers que nossa mão vence e quer manter."
      }
    },
    sourceKind: "theory",
    variantGroup: "decision-integrated-sizing",
    learningPackage: "range-to-decision",
    packageSequence: 12,
    concept: "range-to-decision",
    subconcept: "integrated-target-sizing",
    reasoningPattern: "range-target-response-size"
  },


  {
    id: "dev-calibration-01", purpose: "development", primarySkill: "integrated-decision", support: "guided",
    spot: { label: "Lógica × calibração", pot: "River", stack: "—", hero: "Herói", action: ["O range do Vilão tem principalmente mãos muito fortes e blefes", "Nossa mão vence os blefes", "As mãos muito fortes praticamente não foldam para raise"] },
    prompt: "Dadas exatamente essas premissas, evitar transformar nossa mão em blefe é uma conclusão coerente?",
    options: [{ id: "coherent", label: "Sim. A conclusão segue das premissas; outra questão seria saber se as premissas representam bem o Vilão." }, { id: "raise", label: "O raise ainda ganha valor principalmente porque aumenta a pressão sobre a parte forte do range." }],
    correctOptionId: "coherent", feedback: { short: "A lógica está coerente. Questionar se o range é realmente tão polar seria uma questão de calibração, não uma falha dessa conclusão lógica." },
    sourceKind: "theory", variantGroup: "logic-vs-calibration", learningPackage: "calibration", packageSequence: 1, concept: "logic-calibration", subconcept: "premise-conclusion", reasoningPattern: "distinguir lógica de calibração", supportNote: "Por enquanto aceite as premissas do exercício e pergunte apenas o que segue delas."
  },
  {
    id: "dev-calibration-02", purpose: "development", primarySkill: "range-reading", support: "supported",
    spot: { label: "Primeira observação", pot: "River", stack: "—", hero: "Herói", action: ["Vimos este Vilão pagar uma aposta grande com top pair", "Foi a primeira situação comparável observada", "Herói conclui: top pair quase sempre paga grandes apostas contra ele"] },
    prompt: "Qual é a principal fragilidade?",
    options: [{ id: "too-strong", label: "A conclusão ficou muito mais forte do que a evidência disponível." }, { id: "no-information", label: "O showdown não deveria alterar nossa leitura porque uma mão individual não contém informação." }, { id: "enough", label: "A leitura é suficiente porque ocorreu contra este jogador específico." }],
    correctOptionId: "too-strong", feedback: { short: "O showdown é evidência e deve atualizar a crença, mas uma observação isolada normalmente não justifica transformar uma possibilidade em uma regra forte." },
    sourceKind: "theory", variantGroup: "logic-vs-calibration", learningPackage: "calibration", packageSequence: 2, concept: "logic-calibration", subconcept: "single-observation", reasoningPattern: "distinguir lógica de calibração", supportNote: "Compare a força da conclusão com a quantidade de situações comparáveis observadas."
  },
  {
    id: "dev-calibration-03", purpose: "development", primarySkill: "range-reading", support: "guided",
    spot: { label: "O blefe funcionou", pot: "River", stack: "—", hero: "Herói", action: ["Sem evidência específica, Herói acredita que Vilão folda demais", "Herói faz grande blefe", "Vilão folda"] },
    prompt: "O fold demonstra que a leitura ‘este Vilão folda demais’ estava correta?",
    options: [{ id: "compatible", label: "Não. O resultado é compatível com a hipótese, mas uma única decisão não estabelece a tendência." }, { id: "proves", label: "Sim. O comportamento observado confirma diretamente que ele folda demais." }, { id: "ignore", label: "O fold não deve alterar nossa crença em nenhuma direção." }],
    correctOptionId: "compatible", feedback: { short: "Evite os dois extremos. O resultado contém informação, mas também pode simplesmente refletir a parte fraca do range naquela mão." },
    sourceKind: "theory", variantGroup: "logic-vs-calibration", learningPackage: "calibration", packageSequence: 3, concept: "logic-calibration", subconcept: "result-vs-tendency", reasoningPattern: "distinguir lógica de calibração", supportNote: "Um resultado pode ser compatível com uma hipótese sem prová-la."
  },
  {
    id: "dev-calibration-04", purpose: "development", primarySkill: "integrated-decision", support: "supported",
    spot: { label: "Mesmo blefe, erros diferentes", pot: "River", stack: "—", hero: "Herói", action: ["A: Qx só começa a foldar bastante contra 175%; o objetivo é fazê-la foldar; Herói escolhe 50%", "B: Herói escolhe 175%, coerente com a reação necessária; a crença sobre Qx veio de uma observação"] },
    prompt: "Qual diagnóstico é mais preciso?",
    options: [{ id: "split", label: "A tem problema de lógica entre objetivo e size; B tem problema principalmente na calibração da premissa." }, { id: "both-sizing", label: "A e B são principalmente erros de sizing." }, { id: "reversed", label: "A é calibração; B é lógica." }],
    correctOptionId: "split", feedback: { short: "A mesma decisão ruim pode nascer de causas diferentes. Diagnosticar a causa é necessário para saber o que precisa ser treinado." },
    sourceKind: "theory", variantGroup: "logic-vs-calibration", learningPackage: "calibration", packageSequence: 4, concept: "logic-calibration", subconcept: "error-diagnosis", reasoningPattern: "distinguir lógica de calibração", supportNote: "Separe a coerência entre objetivo e size da força da evidência usada na premissa."
  },
  {
    id: "dev-calibration-05", purpose: "development", primarySkill: "range-reading", support: "guided",
    spot: { label: "Primeiro showdown", pot: "River", stack: "—", hero: "Herói", action: ["Primeira situação comparável observada", "Vilão paga grande aposta com top pair"] },
    prompt: "Qual atualização é mais proporcional à evidência?",
    options: [{ id: "small-update", label: "Esse call aumenta um pouco a plausibilidade de que ele pague leve, mas ainda sabemos pouco." }, { id: "strong-read", label: "Já é melhor tratá-lo como jogador que paga top pair muito amplamente." }, { id: "no-update", label: "Devemos manter exatamente a crença anterior até acumular uma amostra grande." }],
    correctOptionId: "small-update", feedback: { short: "Nova evidência deve alterar a crença sem exigir uma mudança extrema." },
    sourceKind: "theory", variantGroup: "evidence-strength", learningPackage: "calibration", packageSequence: 5, concept: "evidence-quality", subconcept: "proportional-update", reasoningPattern: "pesar evidência", supportNote: "Procure uma atualização que não ignore o showdown nem o transforme em regra."
  },
  {
    id: "dev-calibration-06", purpose: "development", primarySkill: "range-reading", support: "supported",
    spot: { label: "Padrão repetido", pot: "River", stack: "—", hero: "Herói", action: ["Em várias situações comparáveis, o mesmo jogador mostrou calls leves"] },
    prompt: "O que mudou em relação ao primeiro showdown?",
    options: [{ id: "stronger", label: "Temos evidência mais forte para ajustar nossa expectativa nesse tipo de situação." }, { id: "all-contexts", label: "Agora podemos transferir o read para praticamente qualquer contexto pós-flop." }, { id: "isolated", label: "Ainda devemos tratar essas observações como se fossem apenas um caso isolado." }],
    correctOptionId: "stronger", feedback: { short: "Repetição coerente fortalece a hipótese, mas não elimina limites de contexto." },
    sourceKind: "theory", variantGroup: "evidence-strength", learningPackage: "calibration", packageSequence: 6, concept: "evidence-quality", subconcept: "repeated-pattern", reasoningPattern: "pesar evidência", supportNote: "Considere tanto a repetição quanto a comparabilidade das situações."
  },
  {
    id: "dev-calibration-07", purpose: "development", primarySkill: "range-reading", support: "independent",
    spot: { label: "Default populacional", pot: "Spot didático", stack: "—", hero: "Herói", action: ["Premissa didática: naquele pool e tipo de spot, jogadores semelhantes tendem a overfoldar", "Ainda não temos informação relevante deste Vilão"] },
    prompt: "Como essa informação deve entrar na decisão?",
    options: [{ id: "contextual-default", label: "Como um default contextual inicial, que pode ser atualizado quando surgirem evidências deste jogador." }, { id: "individual-property", label: "Como uma propriedade provável deste jogador que só deve mudar depois de muita evidência contrária." }, { id: "discard", label: "Não deve entrar na decisão porque informações populacionais não descrevem indivíduos." }],
    correctOptionId: "contextual-default", feedback: { short: "Um default ajuda quando falta informação individual, mas não vira certeza sobre o próximo adversário. A tendência fornecida é uma premissa didática, não uma afirmação sobre um pool real." },
    sourceKind: "exploit", variantGroup: "evidence-strength", learningPackage: "calibration", packageSequence: 7, concept: "evidence-quality", subconcept: "population-default", reasoningPattern: "pesar evidência"
  },
  {
    id: "dev-calibration-08", purpose: "development", primarySkill: "range-reading", support: "independent",
    spot: { label: "Poucas oportunidades", pot: "30 mãos", stack: "—", hero: "Herói", action: ["Nunca vimos hero call grande no river", "Quase nenhuma mão chegou a uma situação de river comparável"] },
    prompt: "Quão forte é a evidência de que ele evita hero calls?",
    options: [{ id: "weak", label: "Fraca. Houve poucas oportunidades relevantes para observar esse comportamento." }, { id: "moderate", label: "Moderada, porque 30 mãos sem observar o comportamento já apontam uma direção." }, { id: "strong", label: "Forte, porque ausência do comportamento é evidência direta de que ele não faz isso." }],
    correctOptionId: "weak", feedback: { short: "Quantidade de mãos total não é igual a quantidade de oportunidades relevantes." },
    sourceKind: "theory", variantGroup: "evidence-strength", learningPackage: "calibration", packageSequence: 8, concept: "evidence-quality", subconcept: "opportunity-count", reasoningPattern: "pesar evidência"
  },
  {
    id: "dev-calibration-09", purpose: "development", primarySkill: "range-reading", support: "supported",
    spot: { label: "Evidência contra o default", pot: "River", stack: "—", hero: "Herói", action: ["Default didático: Qx tende a foldar bastante contra 150%", "Este Vilão acaba de pagar 150% com Qx em situação comparável"] },
    prompt: "Qual atualização faz mais sentido?",
    options: [{ id: "reduce", label: "A confiança no default contra este Vilão diminui, sem ser necessário concluir imediatamente o oposto." }, { id: "hold", label: "Manter a mesma expectativa até que o comportamento se repita várias vezes." }, { id: "invert", label: "Passar a assumir que Qx normalmente paga 150% contra este Vilão." }],
    correctOptionId: "reduce", feedback: { short: "Atualização não significa ignorar nova evidência nem inverter completamente uma crença após uma única observação." },
    sourceKind: "exploit", variantGroup: "belief-update", learningPackage: "calibration", packageSequence: 9, concept: "belief-update", subconcept: "counterevidence", reasoningPattern: "atualizar crença", supportNote: "A nova observação deve mover a crença, mas não precisa invertê-la."
  },
  {
    id: "dev-calibration-10", purpose: "development", primarySkill: "range-reading", support: "independent",
    spot: { label: "Mesmo jogador, outro contexto", pot: "River", stack: "—", hero: "Herói", action: ["Vilão mostrou vários calls leves contra apostas pequenas/médias", "Agora enfrenta overbet de 175% em pote e contexto diferentes"] },
    prompt: "Qual inferência é mais defensável?",
    options: [{ id: "limited-transfer", label: "As observações anteriores são relevantes, mas o novo contexto limita quanto podemos transferi-las." }, { id: "full-transfer", label: "Os calls anteriores são evidência suficiente de que ele continuará pagando leve contra 175%." }, { id: "irrelevant", label: "A mudança de size torna as observações anteriores praticamente irrelevantes." }],
    correctOptionId: "limited-transfer", feedback: { short: "Evidência pode manter valor sem se transferir integralmente." },
    sourceKind: "theory", variantGroup: "belief-update", learningPackage: "calibration", packageSequence: 10, concept: "belief-update", subconcept: "context-transfer", reasoningPattern: "atualizar crença"
  },
  {
    id: "dev-calibration-11", purpose: "development", primarySkill: "range-reading", support: "independent",
    spot: { label: "Evidência contrária", pot: "Rivers comparáveis", stack: "—", hero: "Herói", action: ["Hipótese anterior: este jogador parece pagar rivers muito largo", "Depois, várias situações comparáveis mostram folds relativamente fortes"] },
    prompt: "Qual atitude produz uma leitura melhor?",
    options: [{ id: "rebuild", label: "Reduzir a confiança na hipótese anterior e reconstruí-la usando o conjunto das observações." }, { id: "keep", label: "Manter a hipótese até surgir um número muito maior de mãos contrárias." }, { id: "reverse", label: "Substituir a hipótese imediatamente por ‘ele folda demais’." }],
    correctOptionId: "rebuild", feedback: { short: "Calibração exige permitir que evidência nova realmente altere uma crença sem transformar cada atualização numa inversão extrema." },
    sourceKind: "theory", variantGroup: "belief-update", learningPackage: "calibration", packageSequence: 11, concept: "belief-update", subconcept: "hypothesis-revision", reasoningPattern: "atualizar crença"
  },
  {
    id: "dev-calibration-12", purpose: "development", primarySkill: "integrated-decision", support: "independent",
    spot: { label: "Integração", pot: "River", stack: "—", hero: "Herói considera blefar", action: ["Sabemos: size pequeno praticamente não faz Qx foldar; precisamos pressionar Qx", "Default contextual didático: jogadores semelhantes tendem a foldar Qx mais contra sizes muito grandes", "Deste Vilão: uma situação comparável; nela, pagou aposta grande com Qx"] },
    prompt: "Qual raciocínio é mais preciso?",
    options: [{ id: "calibrated", label: "O size grande é mais coerente com o objetivo de pressionar Qx, mas a reação deste Vilão permanece incerta e a observação disponível reduz nossa confiança no default." }, { id: "default-wins", label: "O default do pool é a melhor informação disponível, então devemos tratar o fold de Qx como a resposta mais provável sem dar muito peso ao único showdown." }, { id: "individual-wins", label: "Como a evidência individual contradiz o default, devemos tratar Qx como call contra size grande." }],
    correctOptionId: "calibrated", feedback: { short: "A lógica do size e a confiança na premissa são perguntas diferentes. Podemos identificar qual ação cumpre a função desejada sem fingir que sabemos com certeza como este Vilão responderá." },
    sourceKind: "exploit", variantGroup: "calibration-integrated", learningPackage: "calibration", packageSequence: 12, concept: "calibrated-decision", subconcept: "decision-under-uncertainty", reasoningPattern: "logic-evidence-decision"
  },

];

export const evaluationExercises: Exercise[] = [
  {
    id: "transfer-01",
    purpose: "transfer",
    primarySkill: "range-reading",
    support: "independent",
    spot: { label: "3BP · Herói IP", pot: "3-bet pot", stack: "100bb", hero: "Herói IP", street: "Flop", board: ["7♠", "6♠", "4♦"] },
    prompt: "Comparado a um A-high rainbow, qual lado tende a ganhar relativamente mais acesso natural às mãos muito fortes neste board?",
    options: [
      { id: "caller", label: "O range de call do Vilão" },
      { id: "bettor", label: "O 3-bettor, automaticamente" }
    ],
    correctOptionId: "caller",
    feedback: { short: "O range de call do Vilão. A textura média/conectada aproxima esse range das mãos muito fortes." },
    sourceKind: "theory",
    variantGroup: "transfer-range"
  },
  {
    id: "transfer-02",
    purpose: "transfer",
    primarySkill: "integrated-decision",
    support: "independent",
    spot: { label: "3BP · Herói IP", pot: "3-bet pot", stack: "100bb", hero: "Herói IP", street: "Flop", board: ["A♣", "8♦", "2♠"] },
    prompt: "Qual direção é mais plausível como ponto de partida?",
    options: [
      { id: "small-check", label: "Bastante small betting e/ou check" },
      { id: "big", label: "Estratégia baseada principalmente em bets grandes" }
    ],
    correctOptionId: "small-check",
    feedback: { short: "Small/check é a direção mais plausível: o board é muito static e muitas mãos médias não precisam inflar o pote." },
    sourceKind: "solver-reference",
    variantGroup: "transfer-integrated"
  },
  {
    id: "transfer-03",
    purpose: "transfer",
    primarySkill: "range-reading",
    support: "independent",
    spot: { label: "Nova linha", pot: "3-bet pot", stack: "100bb", hero: "3-bettor", action: ["O 3-bettor sempre aposta seus overpairs", "Agora ele checks"] },
    prompt: "Se os overpairs quase nunca chegam ao check, o checking range fica...",
    options: [
      { id: "capped", label: "Mais capped" },
      { id: "uncapped", label: "Mais uncapped" }
    ],
    correctOptionId: "capped",
    feedback: { short: "Mais capped. Retirar mãos fortes de uma linha reduz a força máxima que ela consegue representar." },
    sourceKind: "solver-reference",
    variantGroup: "transfer-capped"
  },
  {
    id: "retention-01",
    purpose: "retention",
    primarySkill: "sizing",
    support: "independent",
    spot: { label: "Revisão", pot: "C-bet", stack: "—", hero: "—" },
    prompt: "Como heurística inicial, qual conceito tende a influenciar mais diretamente a frequência da c-bet?",
    options: [
      { id: "range", label: "Range advantage" },
      { id: "nut", label: "Nut advantage" }
    ],
    correctOptionId: "range",
    feedback: { short: "Range advantage. Nut advantage costuma pesar mais diretamente nos incentivos de sizing." },
    sourceKind: "solver-reference",
    variantGroup: "retention-sizing"
  },
  {
    id: "retention-02",
    purpose: "retention",
    primarySkill: "range-reading",
    support: "independent",
    spot: { label: "Revisão", pot: "Ranges", stack: "—", hero: "—" },
    prompt: "Um range sem boa parte das suas mãos mais fortes é chamado...",
    options: [
      { id: "capped", label: "Capped" },
      { id: "uncapped", label: "Uncapped" }
    ],
    correctOptionId: "capped",
    feedback: { short: "Capped." },
    sourceKind: "theory",
    variantGroup: "retention-capped"
  },
  {
    id: "retention-03",
    purpose: "retention",
    primarySkill: "integrated-decision",
    support: "independent",
    spot: { label: "3BP · Herói IP", pot: "3-bet pot", stack: "100bb", hero: "Herói IP", street: "Flop", board: ["9♠", "8♠", "7♦"] },
    prompt: "Antes de escolher sizing, qual preocupação é mais importante?",
    options: [
      { id: "nuts", label: "O Vilão pode ter bastante acesso às mãos muito fortes nesta textura." },
      { id: "aggressor", label: "O Herói foi o último agressor, então deve sempre apostar." }
    ],
    correctOptionId: "nuts",
    feedback: { short: "A distribuição das ranges vem antes do automatismo 'sou o agressor, então aposto'." },
    sourceKind: "theory",
    variantGroup: "retention-integrated"
  }  ,
  {
    id: "transfer-range-actions-01",
    purpose: "transfer",
    primarySkill: "range-reading",
    support: "independent",
    spot: {
      label: "Transferência · 4-bet pot",
      pot: "4-bet pot",
      stack: "Deep",
      hero: "Herói IP",
      action: ["Vilão 4-beta pré-flop", "Vilão continua apostando flop e turn"]
    },
    prompt: "AA e KK ainda fazem sentido nessa linha do Vilão?",
    options: [
      { id: "yes", label: "Sim" },
      { id: "no", label: "Não" }
    ],
    correctOptionId: "yes",
    feedback: {
      short: "Sim. A linha continua compatível com mãos do topo do range; não há base para tratá-la como capped apenas porque chegamos a uma street posterior."
    },
    sourceKind: "heuristic",
    variantGroup: "transfer-range-actions",
    learningPackage: "range-actions",
    concept: "range-inference",
    subconcept: "transfer-4bet",
    reasoningPattern: "action-context-range"
  },
  {
    id: "transfer-range-actions-02",
    purpose: "transfer",
    primarySkill: "range-reading",
    support: "independent",
    spot: {
      label: "Transferência · Multiway",
      pot: "4-way",
      stack: "100bb+",
      hero: "Herói",
      action: ["Herói aposta", "Vilão paga", "Ainda há jogadores atrás do Vilão"]
    },
    prompt: "Esse call elimina necessariamente sets e two pair do range do Vilão?",
    options: [
      { id: "yes", label: "Sim" },
      { id: "no", label: "Não" }
    ],
    correctOptionId: "no",
    feedback: {
      short: "Não. Em multiway, mãos muito fortes podem continuar no call para manter jogadores atrás no pote."
    },
    sourceKind: "heuristic",
    variantGroup: "transfer-range-actions",
    learningPackage: "range-actions",
    concept: "range-inference",
    subconcept: "transfer-multiway",
    reasoningPattern: "context-changes-action-meaning"
  },
  {
    id: "transfer-range-actions-03",
    purpose: "transfer",
    primarySkill: "range-reading",
    support: "independent",
    spot: {
      label: "Transferência · River",
      pot: "Heads-up",
      stack: "Deep",
      hero: "Herói agressor",
      action: ["Herói overbeta o turn", "Vilão paga", "River completa o draw", "Vilão checks"]
    },
    prompt: "O check, sozinho, permite remover as mãos muito fortes que completaram no river?",
    options: [
      { id: "yes", label: "Sim" },
      { id: "no", label: "Não" }
    ],
    correctOptionId: "no",
    feedback: {
      short: "Não. A linha anterior pode dar às mãos muito fortes motivo para checkar e esperar nova agressão."
    },
    sourceKind: "heuristic",
    variantGroup: "transfer-range-actions",
    learningPackage: "range-actions",
    concept: "range-inference",
    subconcept: "transfer-river-check",
    reasoningPattern: "context-changes-action-meaning"
  },
  {
    id: "retention-range-actions-01",
    purpose: "retention",
    primarySkill: "range-reading",
    support: "independent",
    spot: { label: "Retenção", pot: "Ranges", stack: "—", hero: "—" },
    prompt: "Qual definição descreve melhor um range capped?",
    options: [
      { id: "top-limited", label: "As mãos mais fortes possíveis ficaram ausentes ou pouco representadas naquela linha" },
      { id: "always-weak", label: "É qualquer range com muitas mãos fracas" }
    ],
    correctOptionId: "top-limited",
    feedback: {
      short: "Capped descreve principalmente a limitação do topo naquela linha, não simplesmente um range globalmente fraco."
    },
    sourceKind: "theory",
    variantGroup: "retention-range-actions",
    learningPackage: "range-actions",
    concept: "range-inference",
    subconcept: "retention-definition",
    reasoningPattern: "range-label"
  },
  {
    id: "retention-range-actions-02",
    purpose: "retention",
    primarySkill: "range-reading",
    support: "independent",
    spot: { label: "Retenção", pot: "Ranges", stack: "—", hero: "—", action: ["Vilão paga uma aposta"] },
    prompt: "Call significa automaticamente que o range ficou capped?",
    options: [
      { id: "yes", label: "Sim" },
      { id: "no", label: "Não" }
    ],
    correctOptionId: "no",
    feedback: {
      short: "Não. Precisamos saber quais mãos muito fortes tenderiam a escolher outra ação naquele contexto."
    },
    sourceKind: "theory",
    variantGroup: "retention-range-actions",
    learningPackage: "range-actions",
    concept: "range-inference",
    subconcept: "retention-anti-shortcut",
    reasoningPattern: "avoid-action-shortcut"
  },
  {
    id: "retention-range-actions-03",
    purpose: "retention",
    primarySkill: "range-reading",
    support: "independent",
    spot: { label: "Retenção", pot: "Ranges", stack: "—", hero: "—" },
    prompt: "Para decidir se um range está capped, qual pergunta é mais útil?",
    options: [
      { id: "strong-hands", label: "Quais das mãos mais fortes ainda fazem sentido nesta linha?" },
      { id: "hero-hand", label: "Minha mão é forte o bastante para apostar agora?" }
    ],
    correctOptionId: "strong-hands",
    feedback: {
      short: "Primeiro investigamos quais mãos mais fortes ainda chegam pela linha. A ação do Herói vem depois."
    },
    sourceKind: "theory",
    variantGroup: "retention-range-actions",
    learningPackage: "range-actions",
    concept: "range-inference",
    subconcept: "retention-question",
    reasoningPattern: "ask-before-label"
  }

  ,
  {
    id: "retention-range-decision-01",
    purpose: "retention",
    primarySkill: "sizing",
    support: "independent",
    spot: { label: "Retenção", pot: "Sizing", stack: "—", hero: "—" },
    prompt: "O que significa dizer que uma mão é sensível ao tamanho neste contexto?",
    options: [
      { id: "changes", label: "Sua decisão muda significativamente quando o size muda" },
      { id: "big", label: "Ela enfrenta necessariamente uma aposta muito grande" }
    ],
    correctOptionId: "changes",
    feedback: { short: "Sensibilidade descreve a mudança de decisão da mão, não o tamanho absoluto da aposta." },
    sourceKind: "theory",
    variantGroup: "retention-range-decision",
    learningPackage: "range-to-decision",
    concept: "sizing-response",
    subconcept: "retention-sensitivity",
    reasoningPattern: "compare-response-across-sizes"
  },
  {
    id: "retention-range-decision-02",
    purpose: "retention",
    primarySkill: "sizing",
    support: "independent",
    spot: {
      label: "Retenção",
      pot: "River",
      stack: "100bb",
      hero: "—",
      action: ["33% → CALL", "75% → CALL", "150% → FOLD"]
    },
    prompt: "Qual informação esta sequência revela primeiro?",
    options: [
      { id: "frontier", label: "Existe uma fronteira de tamanho em que a decisão muda" },
      { id: "universal", label: "150% é sempre o melhor size contra essa mão" }
    ],
    correctOptionId: "frontier",
    feedback: { short: "A sequência mostra mudança de resposta ao size; não determina sozinha a estratégia ótima." },
    sourceKind: "theory",
    variantGroup: "retention-range-decision",
    learningPackage: "range-to-decision",
    concept: "sizing-response",
    subconcept: "retention-frontier",
    reasoningPattern: "target-response-size"
  },
  {
    id: "retention-range-decision-03",
    purpose: "retention",
    primarySkill: "integrated-decision",
    support: "independent",
    spot: { label: "Retenção", pot: "Ranges", stack: "—", hero: "—" },
    prompt: "Saber que o range do Vilão está capped determina sozinho qual sizing usar?",
    options: [
      { id: "yes", label: "Sim" },
      { id: "no", label: "Não" }
    ],
    correctOptionId: "no",
    feedback: { short: "Não. Ainda precisamos considerar nossa mão, objetivo, mãos-alvo, resposta aos tamanhos, stack e contexto." },
    sourceKind: "theory",
    variantGroup: "retention-range-decision",
    learningPackage: "range-to-decision",
    concept: "range-to-decision",
    subconcept: "retention-anti-shortcut",
    reasoningPattern: "range-target-response-size"
  },
  {
    id: "transfer-range-decision-01",
    purpose: "transfer",
    primarySkill: "sizing",
    support: "independent",
    spot: {
      label: "Transferência · Stack",
      pot: "Turn",
      stack: "100bb × 200bb",
      hero: "Mesma mão e mesmo board",
      action: ["A profundidade muda quanto dinheiro ainda pode entrar nas streets seguintes"]
    },
    prompt: "A resposta de uma mão aos mesmos sizes precisa permanecer igual em 100bb e 200bb?",
    options: [
      { id: "yes", label: "Sim, porque as cartas são as mesmas" },
      { id: "no", label: "Não, a profundidade pode mudar incentivos e a pressão das streets futuras" }
    ],
    correctOptionId: "no",
    feedback: { short: "Não. Sensibilidade ao tamanho depende também de stack e linha futura, não apenas das cartas." },
    sourceKind: "theory",
    variantGroup: "transfer-range-decision",
    learningPackage: "range-to-decision",
    concept: "sizing-response",
    subconcept: "transfer-stack",
    reasoningPattern: "context-changes-response"
  },
  {
    id: "transfer-range-decision-02",
    purpose: "transfer",
    primarySkill: "sizing",
    support: "independent",
    spot: {
      label: "Transferência · Dois Vilões",
      pot: "River",
      stack: "100bb",
      hero: "Mesma mão de value",
      action: [
        "Vilão A: top pair paga vários sizes",
        "Vilão B: top pair começa a foldar quando o size cresce"
      ]
    },
    prompt: "A mesma mão do Herói deve necessariamente usar o mesmo sizing contra os dois ranges?",
    options: [
      { id: "same", label: "Sim, porque a força da mão do Herói não mudou" },
      { id: "different", label: "Não, a resposta das mãos-alvo pode mudar o incentivo de sizing" }
    ],
    correctOptionId: "different",
    feedback: { short: "Não. O sizing depende da interação com o range que responde, não apenas da força absoluta da nossa mão." },
    sourceKind: "theory",
    variantGroup: "transfer-range-decision",
    learningPackage: "range-to-decision",
    concept: "sizing-response",
    subconcept: "transfer-villain-response",
    reasoningPattern: "target-response-size"
  },
  {
    id: "transfer-range-decision-03",
    purpose: "transfer",
    primarySkill: "integrated-decision",
    support: "independent",
    spot: {
      label: "Transferência · Sem rótulos",
      pot: "River",
      stack: "100bb",
      hero: "Herói com value",
      action: [
        "Grupo A → continua contra 50%, 75% e 150%",
        "Grupo B → continua contra 50% e 75%, mas folda 150%",
        "Grupo C → folda contra todos os tamanhos"
      ]
    },
    prompt: "Qual grupo provavelmente está mais perto da fronteira que deve orientar nosso sizing de value?",
    options: [
      { id: "a", label: "Grupo A" },
      { id: "b", label: "Grupo B" },
      { id: "c", label: "Grupo C" }
    ],
    correctOptionId: "b",
    feedback: { short: "Grupo B. Sua resposta muda conforme o size, então ele contém informação especialmente útil para escolher o tamanho." },
    sourceKind: "theory",
    variantGroup: "transfer-range-decision",
    learningPackage: "range-to-decision",
    concept: "range-to-decision",
    subconcept: "transfer-target-identification",
    reasoningPattern: "range-target-response-size"
  },


  {
    id: "retention-calibration-01", purpose: "retention", primarySkill: "integrated-decision", support: "independent",
    spot: { label: "Retenção · River", pot: "Heads-up", stack: "—", hero: "Herói", action: ["Premissa: bluff catchers não foldam para raise", "Herói decide apenas pagar com uma mão que vence blefes"] },
    prompt: "Qual avaliação é mais precisa?",
    options: [{ id: "logic-weak-premise", label: "A ação segue da premissa, embora ainda possa faltar evidência para confiar nela." }, { id: "illogical", label: "A ação é incoerente porque toda mão que vence blefes deve aumentar a pressão." }],
    correctOptionId: "logic-weak-premise", feedback: { short: "A coerência da conclusão e a força da premissa são avaliações separadas." }, sourceKind: "theory", variantGroup: "retention-calibration", learningPackage: "calibration", concept: "logic-calibration", subconcept: "implicit-retrieval", reasoningPattern: "logic-evidence"
  },
  {
    id: "retention-calibration-02", purpose: "retention", primarySkill: "range-reading", support: "independent",
    spot: { label: "Retenção · Showdown", pot: "River", stack: "—", hero: "Herói", action: ["Pela primeira vez, Vilão mostra um call muito leve em situação comparável"] },
    prompt: "Como essa informação deve afetar a leitura?",
    options: [{ id: "update", label: "Ela move a leitura na direção de mais calls leves, sem estabelecer uma tendência." }, { id: "prove", label: "Ela prova que este Vilão costuma pagar rivers muito largo." }, { id: "ignore", label: "Ela deve ser ignorada até aparecer novamente." }],
    correctOptionId: "update", feedback: { short: "Uma observação informa e atualiza, mas não prova sozinha um padrão." }, sourceKind: "theory", variantGroup: "retention-calibration", learningPackage: "calibration", concept: "evidence-quality", subconcept: "implicit-single-observation", reasoningPattern: "weigh-one-observation"
  },
  {
    id: "retention-calibration-03", purpose: "retention", primarySkill: "range-reading", support: "independent",
    spot: { label: "Retenção · Oportunidades", pot: "Sessão longa", stack: "—", hero: "Herói", action: ["Vilão jogou muitas mãos", "Somente duas chegaram ao tipo de decisão que queremos observar", "O comportamento não apareceu"] },
    prompt: "O que essa ausência permite concluir?",
    options: [{ id: "little", label: "Pouco, porque quase não houve oportunidades relevantes de observar o comportamento." }, { id: "absent", label: "Que o comportamento provavelmente não faz parte do jogo do Vilão, pois a sessão foi longa." }],
    correctOptionId: "little", feedback: { short: "O número relevante é o de oportunidades comparáveis, não apenas o total de mãos." }, sourceKind: "theory", variantGroup: "retention-calibration", learningPackage: "calibration", concept: "evidence-quality", subconcept: "implicit-opportunities", reasoningPattern: "opportunities-vs-absence"
  },
  {
    id: "transfer-calibration-01", purpose: "transfer", primarySkill: "range-reading", support: "independent",
    spot: { label: "Transferência · Anotação antiga", pot: "Turn", stack: "Deep", hero: "Herói", action: ["Nota antiga: Vilão pagou leve em um river de pote single-raised", "Agora: Vilão enfrenta raise no turn de um 4-bet pot"] },
    prompt: "Como usar a anotação antiga?",
    options: [{ id: "limited", label: "Como evidência com transferência limitada, porque a decisão e o contexto mudaram." }, { id: "direct", label: "Como base suficiente para esperar que ele também pague leve agora." }, { id: "none", label: "Como informação sem qualquer valor por ser antiga." }],
    correctOptionId: "limited", feedback: { short: "A nota pode informar sem descrever integralmente uma decisão de outra superfície." }, sourceKind: "heuristic", variantGroup: "transfer-calibration", learningPackage: "calibration", concept: "belief-update", subconcept: "old-note-new-context", reasoningPattern: "context-limits-transfer"
  },
  {
    id: "transfer-calibration-02", purpose: "transfer", primarySkill: "range-reading", support: "independent",
    spot: { label: "Transferência · Torneio", pot: "Bubble", stack: "25bb", hero: "Herói", action: ["Default didático: jogadores semelhantes defendem pouco contra shoves neste spot", "Este Vilão mostrou dois calls mais largos em situações comparáveis"] },
    prompt: "Qual leitura combina melhor as informações?",
    options: [{ id: "lower-confidence", label: "O default ainda contextualiza a decisão, mas a evidência individual reduz a confiança em aplicá-lo a este Vilão." }, { id: "population", label: "O default deve dominar porque duas observações individuais não têm valor." }, { id: "reverse", label: "Os dois calls provam que este Vilão sempre defenderá largo." }],
    correctOptionId: "lower-confidence", feedback: { short: "A evidência individual atualiza o default sem precisar virar uma certeza oposta. O default é apenas uma premissa didática." }, sourceKind: "exploit", variantGroup: "transfer-calibration", learningPackage: "calibration", concept: "belief-update", subconcept: "population-vs-individual", reasoningPattern: "combine-default-evidence"
  },
  {
    id: "transfer-calibration-03", purpose: "transfer", primarySkill: "integrated-decision", support: "independent",
    spot: { label: "Transferência · Pré-flop", pot: "Torneio", stack: "18bb", hero: "Herói considera shove", action: ["Premissa didática: o raise pequeno não pressiona o grupo de mãos-alvo", "O shove pressiona esse grupo", "A estimativa de folds do Vilão vem de informação pouco comparável"] },
    prompt: "Qual conclusão separa melhor função da ação e confiança na premissa?",
    options: [{ id: "separate", label: "O shove cumpre melhor a função proposta, mas o resultado esperado permanece incerto porque a estimativa de folds é fraca." }, { id: "certain-shove", label: "Como o shove tem a função correta, o Vilão provavelmente foldará as mãos-alvo." }, { id: "paralysis", label: "Sem certeza sobre os folds, não podemos identificar qual ação exerce mais pressão." }],
    correctOptionId: "separate", feedback: { short: "É possível escolher a ação coerente com a função sem fingir certeza sobre a premissa de resposta." }, sourceKind: "theory", variantGroup: "transfer-calibration", learningPackage: "calibration", concept: "calibrated-decision", subconcept: "new-surface-decision", reasoningPattern: "logic-evidence-decision"
  },

];

export const allExercises = [...developmentExercises, ...evaluationExercises];
