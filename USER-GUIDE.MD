# 📚 Guia do Usuário - Projeto MultBot

Bem-vindo ao guia completo de operação e manutenção do MultBot. Este documento cobre desde tarefas básicas até operações avançadas na VPS.

## 🚀 Fluxo de Trabalho (Workflow)

Este é o fluxo recomendado para manter o projeto atualizado e rodando:

1. **Desenvolvimento Local**: Faça as alterações no código, teste e envie para o GitHub (`git push`).
2. **Acesso à VPS**: Conecte-se ao servidor via SSH.
3. **Atualização**: Baixe as novidades do GitHub (`git pull`).
4. **Deploy**: Rode o script de deploy automatizado (`./deploy.sh`).
5. **Monitoramento**: Verifique se tudo está rodando bem com o PM2.

---

## 🛠️ Comandos da VPS (Servidor)

Estes são os scripts principais na raiz do projeto (`/root/multbot`).

### Automatização
* `./deploy.sh`
  * **O que faz**: Automatiza todo o processo de deploy: Atualiza o código, instala dependências, roda migrações do banco, builda o frontend/backend e reinicia os serviços.
  * **Quando usar**: Sempre que você quiser atualizar o sistema com as últimas mudanças do GitHub.

* `./setup-ssl.sh`
  * **O que faz**: Configura certificados SSL (HTTPS) gratuitos usando Certbot/LetsEncrypt.
  * **Quando usar**: Apenas na primeira configuração ou se os certificados expirarem e não renovarem automaticamente.

### Monitoramento e Logs (PM2)
O PM2 é o gerenciador de processos que mantém o Node.js rodando.

* `pm2 monit`
  * **O que faz**: Abre um painel visual em tempo real mostrando CPU, Memória e Logs de todos os processos.
  * **Dica**: Use as setas do teclado para navegar. Pressione `q` para sair.

* `pm2 list`
  * **O que faz**: Lista todos os processos ativos e mostra o status (online/stopped), uptime e consumo de memória.

* `pm2 logs multbot-backend`
  * **O que faz**: Mostra os logs em tempo real do backend. Ótimo para ver se pagamentos estão chegando ou se há erros.
  * **Variações**:
    * `pm2 logs --lines 100`: Vê as últimas 100 linhas (útil para ver o que aconteceu antes).
    * `pm2 flush`: Limpa todos os logs antigos (bom para liberar espaço ou "limpar a visão").

* `pm2 restart multbot-backend`
  * **O que faz**: Reinicia forçadamente o processo do backend.
  * **Quando usar**: Se o bot travar ou se você editou arquivos de configuração (.env) e precisa recarregar.

### Comandos Git (Controle de Versão)

* `git pull`
  * **O que faz**: Baixa as últimas atualizações do repositório GitHub para a VPS.
  * **Importante**: Se houver conflito de arquivos (erro "local changes would be overwritten"), veja o comando abaixo.

* `git reset --hard` ⚠️ **CUIDADO**
  * **O que faz**: Apaga **TODAS** as alterações locais que não foram enviadas para o GitHub e força a pasta a ficar idêntica ao repositório remoto.
  * **Quando usar**: Se o `git pull` falhar por conflitos e você tiver certeza que não fez nenhuma alteração importante direto na VPS.

---

## 💾 Banco de Dados (Prisma)

Comandos executados dentro da pasta `packages/backend`.

* `pnpm prisma studio`
  * **O que faz**: Abre uma interface web para visualizar e editar o banco de dados diretamente.
  * **Como usar**: Na VPS pode ser difícil acessar, mas em desenvolvimento local é excelente.

* `pnpm prisma db push`
  * **O que faz**: "Empurra" as mudanças do arquivo `schema.prisma` para o banco de dados real (`dev.db`).
  * **Quando usar**: Sempre que você alterar a estrutura do banco (adicionar tabelas ou campos).

* `pnpm prisma db seed`
  * **O que faz**: Roda o script de "seeding" (popula o banco com dados iniciais, como o usuário Admin padrão).

---

## 💻 Desenvolvimento Local

Comandos para usar no seu computador enquanto programa.

* `pnpm dev`
  * Roda o projeto em modo de desenvolvimento (com auto-reload).

* `pnpm build`
  * Gera a versão final de produção (compila o TypeScript para JavaScript otimizado).
