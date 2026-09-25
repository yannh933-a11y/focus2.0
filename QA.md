# QA — Focus 2.0

## Validações executadas neste ambiente

- Parsing/transpilação de todos os arquivos `.ts`/`.tsx`: sem diagnóstico de sintaxe.
- Resolução de imports locais: nenhum import local quebrado.
- Busca por `any` explícito no código da aplicação: nenhum encontrado.
- Serviço puro de recorrência compilado com TypeScript em modo `strict`.
- Teste: rotina semanal aplica no dia correto e não aplica no dia incorreto.
- Teste: materializar a mesma data duas vezes não duplica a tarefa.
- Teste: conclusão reflete 100% no cálculo diário.
- Teste: materializar outro dia cria uma instância independente e pendente.
- Teste: cálculo do cronômetro usa timestamp após intervalo em background.
- Teste: cronômetro pausado não continua acumulando tempo.
- Teste: início da semana funciona para segunda-feira e domingo.
- Teste: navegação semanal avança exatamente sete dias.

## Build de dependências

O ambiente de geração não conseguiu resolver `registry.npmjs.org` (DNS), portanto `npm install` e o build completo do Vite não puderam ser executados aqui. O projeto inclui os scripts `npm run typecheck` e `npm run build` para a validação final em uma máquina com acesso ao npm/Vercel.


## Patch 2.0.1

- Troca de abas agora é instantânea, sem `AnimatePresence`/fade-out, eliminando o intervalo preto entre páginas.
- `timerEnabled` foi adicionado a rotinas e instâncias.
- O formulário permite ligar/desligar cronômetro por atividade.
- Rotinas podem carregar essa preferência para as instâncias futuras.
- Dados antigos são migrados: atividades de Estudos mantêm cronômetro habilitado por compatibilidade.
- Cronômetros de atividades não classificadas como Estudos registram duração real na tarefa, mas não entram nas métricas de estudo.
- Validação sintática: 30 arquivos TS/TSX, 0 diagnósticos de sintaxe.
- `npm install` não concluiu neste ambiente dentro do timeout; o build completo deve ser confirmado na Vercel, que já compilou a versão 2.0.0 com a mesma base de dependências.
