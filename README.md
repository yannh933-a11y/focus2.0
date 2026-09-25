# Focus 2.0 — Seu sistema pessoal

PWA mobile-first para rotina semanal, tarefas, estudos, academia e progresso. A lógica principal prioriza a agenda semanal interativa: você pode visualizar os sete dias e marcar/desmarcar atividades diretamente pela tela **Semana**. A tela **Hoje** usa exatamente as mesmas instâncias de tarefas, sem duplicação de estado.

## Stack

- React + Vite + TypeScript
- Tailwind CSS
- Lucide Icons
- Recharts
- Framer Motion
- IndexedDB
- vite-plugin-pwa

## Rodar localmente

```bash
npm install
npm run dev
```

## Validar e gerar produção

```bash
npm run typecheck
npm run build
```

O build final será criado em `dist/`.

## Publicar na Vercel

1. Envie esta pasta para um repositório GitHub.
2. Importe o repositório na Vercel.
3. Framework preset: **Vite**.
4. Build command: `npm run build`.
5. Output directory: `dist`.
6. Publique.

Não são necessárias variáveis de ambiente ou backend nesta versão.

## Funcionalidades centrais

- Semana interativa com modo **Dia selecionado** e **Semana completa**.
- Checkboxes sincronizados entre Semana e Hoje.
- Histórico preservado em tarefas recorrentes.
- Tarefas passadas pendentes aparecem como **Não realizadas**.
- Tarefas futuras exigem confirmação explícita antes de serem concluídas.
- Cronômetro de estudo baseado em timestamps e persistido.
- Barra de sessão ativa visível em todas as telas.
- Tempo planejado e tempo real separados.
- Gráficos de 7 dias, 30 dias, mês e histórico.
- Rotinas recorrentes por dias específicos da semana.
- Backup e restauração em JSON.
- Tema OLED escuro, tema claro e modo sistema.
- PWA instalável com cache offline dos assets.

## Persistência

O estado principal fica no IndexedDB. A versão 2 inclui migração dos dados da versão anterior quando eles existem no mesmo domínio/origem.

## Notificações

A permissão só é solicitada quando o usuário ativa lembretes. Sem backend, lembretes locais são tratados enquanto a aplicação está ativa; push agendado confiável com o app totalmente encerrado fica preparado para uma evolução futura.

Veja `ARCHITECTURE.md` para as decisões de arquitetura.
