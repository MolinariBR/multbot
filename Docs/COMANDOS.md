# COMANDOS DO PROJETO DIVIDO POR LOCAL

## COMANDOS TERMINAL DA VPS

* `./deploy.sh`: Faz o deploy do projeto.
* `./setup-ssl.sh`: Configura o SSL.
* `./vps-update.sh`: Atualiza o código (git pull), aplica `prisma db push` no banco de produção e reinicia serviços.


## COMANDOS ÚTEIS PM2

* `pm2 list` ou `pm2 status`: Lista todos os processos e seus status.
* `pm2 logs multbot-backend`: Vê os logs em tempo real do backend.
* `pm2 logs multbot-backend --lines 100`: Vê as últimas 100 linhas de log.
* `pm2 flush`: Limpa todos os logs acumulados.
* `pm2 stop multbot-backend`: Para o backend.
* `pm2 start multbot-backend`: Inicia o backend (caso esteja parado).
* `pm2 monit`: Monitor visual de CPU e memória.

## COMANDOS UTEIS DO TERMINAL

* `pnpm dev`: Iniciar o Frontend ou Backend.
* `pnpm build`: Buildar o Frontend ou Backend.

## COMANDOS DO PRISMA (Banco de Dados)

* `pnpm prisma generate`: Gera o cliente do Prisma (necessário após mudar schema).
* `pnpm prisma db push`: Atualiza o banco de dados com as mudanças do schema (ideal para dev/sqlite).
* `pnpm prisma studio`: Abre uma interface visual para ver e editar o banco de dados.
* `pnpm prisma migrate dev`: Cria uma nova migração (para bancos de produção como Postgres/MySQL).
* `pnpm prisma db seed`: Roda o script de seed para popular o banco com dados iniciais.

## COMANDOS GIT (Controle de Versão)

* `git pull`: Baixa as atualizações do repositório. Use sempre antes de buildar na VPS.
* `git status`: Mostra arquivos modificados localmente.
* `git reset --hard`: **PERIGO!** Apaga todas as mudanças locais e deixa igual ao GitHub. Útil para resolver conflitos de deploy.
* `git checkout .`: Descarta alterações locais não comitadas.
