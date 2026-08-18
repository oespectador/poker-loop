# Testing Protocol

## Estado atual

A baseline possui scripts:

```bash
npm run typecheck
npm run build
npm run dev
```

A suíte formal de testes automatizados ainda é uma prioridade P0. Não assumir que simulações feitas durante prototipagem estão versionadas.

## Invariantes do motor

Qualquer teste/refatoração deve preservar:

1. primeira sessão: 12 exercícios fundadores;
2. pacotes estruturados entram em ordem definida;
3. microbloco atual não antecipa o próximo se sessão for interrompida;
4. erro em primeira apresentação não embaralha o bloco;
5. itens inéditos de pacote não entram por treino manual/adaptive fill;
6. pacote posterior fica bloqueado enquanto anterior tem inéditos;
7. itens reservados de retenção/transferência não entram no treino normal;
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

## Teste humano atual

A V0.4 precisa ser validada principalmente nestas perguntas:

- os microblocos aparecem corretamente?
- as perguntas são claras?
- as alternativas erradas são plausíveis?
- a pista ajuda sem entregar?
- o feedback explica a concepção errada?
- depois dos exercícios, o jogador começa a perguntar espontaneamente “qual parte do range quero atingir?” e “essas mãos mudam de decisão com o size?”

## Build

Se `npm run build` falhar por ambiente/rede, documentar a limitação. Não declarar build bem-sucedida sem tê-la executado.
