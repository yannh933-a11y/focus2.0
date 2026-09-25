# Arquitetura — Focus 2.0

## Princípio de produto

A fonte central de uso é a rotina semanal. `WeekPage` não é um dashboard analítico: ela materializa e exibe tarefas reais para cada data e permite alterar o estado diretamente. `TodayPage` é apenas uma visão filtrada das mesmas `TaskInstance`.

## Modelo de dados

- `RoutineTask`: modelo recorrente da rotina semanal.
- `TaskInstance`: ocorrência concreta de uma atividade em uma data.
- `StudySession`: sessão real registrada pelo cronômetro.
- `Category`, `Goals`, `AppSettings`: configuração e personalização.

Essa separação permite editar a rotina futura sem reescrever tarefas concluídas no passado.

## Materialização de rotina

Ao acessar uma data, `ensureDate()` materializa as rotinas aplicáveis naquele dia. A Semana chama essa função para os sete dias visíveis, inclusive semanas futuras. Instâncias já existentes não são duplicadas.

Ao editar uma rotina, somente ocorrências pendentes de hoje em diante são removidas/recriadas. Histórico passado e ocorrências concluídas são preservados.

## Sincronização Hoje ↔ Semana

Não existem listas independentes por tela. Ambas leem `state.tasks` e chamam as mesmas ações (`toggleComplete`, `updateTask`, `deleteTask`). Por isso um check feito em Semana aparece imediatamente em Hoje e vice-versa.

## Cronômetro

O timer guarda `startedAt`, `accumulatedMs` e estado de pausa. O tempo exibido é calculado por `Date.now()`, evitando depender da frequência de `setInterval` em background. Ao finalizar, o tempo real é somado a `actualDurationSeconds` e uma `StudySession` é criada.

## Persistência

O estado é persistido em IndexedDB. O tema também é espelhado em `localStorage` apenas para evitar flash visual durante o carregamento. A migração v2 adiciona preferências e ordem de tarefas sem apagar dados antigos.

## Semanas passadas e futuras

- Passado: tarefas incompletas permanecem registradas e são apresentadas como “Não realizada”.
- Atual: conclusão direta em um toque.
- Futuro: planejamento é visível; concluir requer confirmação explícita.

## PWA

`vite-plugin-pwa` gera manifest e service worker. A aplicação usa `viewport-fit=cover`, safe areas e `display: standalone`, com ícones próprios em preto/azul/verde.

## Limitação deliberada de notificações

Sem servidor/push, a versão atual não promete alarmes confiáveis quando o app está totalmente encerrado. O serviço de notificações foi isolado para uma futura implementação de Web Push/Supabase/Firebase.
