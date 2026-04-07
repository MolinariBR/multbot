Você é um engenheiro sênior especialista em qualidade de código e DevOps. Analise toda a estrutura do projeto atual, identifique automaticamente a stack, linguagens, gerenciador de pacotes e plataforma de deploy, e execute as três configurações abaixo de forma integrada e consistente entre si.

---

## ETAPA 0 — LEITURA DO PROJETO

Antes de qualquer configuração, identifique:

- Linguagens utilizadas no projeto
- Frameworks e bibliotecas principais
- Gerenciador de pacotes (npm, yarn, pnpm, pip, pub, etc.)
- Estrutura de pastas (monorepo, frontend/backend separados, etc.)
- Plataforma de deploy se identificável (Vercel, Railway, Render, AWS, etc.)
- Branches existentes no repositório

Informe o que foi identificado antes de prosseguir, e sinalize se alguma informação necessária não foi encontrada.

---

## 1. CLEAN CODE — LINTERS E FORMATADORES

Com base na stack identificada, configure as ferramentas de análise estática e formatação automática mais adequadas para cada linguagem presente no projeto.

**Regras obrigatórias independente da linguagem:**

- Tamanho de arquivo: aviso em 200 linhas, erro em 300 linhas
- Tamanho de função/método: aviso em 20 linhas, erro em 30 linhas
- Número de parâmetros por função: aviso a partir de 3
- Comprimento de linha: máximo 120 caracteres
- Variáveis não utilizadas: erro
- Imports não utilizados: erro
- Complexidade ciclomática: aviso a partir de 10
- Nomenclatura: camelCase para variáveis e funções, PascalCase para classes e tipos, UPPER_CASE para constantes
- Console.log / print de debug: aviso

**Para cada linguagem encontrada:**

- Instale o linter padrão da linguagem
- Instale o formatador padrão da linguagem
- Configure ambos para não conflitarem entre si
- Aplique todas as regras obrigatórias acima usando os equivalentes nativos de cada ferramenta

---

## 2. PRE-COMMIT COM HUSKY OU EQUIVALENTE

Configure o hook de pre-commit adequado para o projeto.

**Requisitos:**

- Se o projeto tiver package.json: use Husky + lint-staged
- Se o projeto for exclusivamente Python: use pre-commit framework
- Se for monorepo ou stack mista: combine as abordagens necessárias
- Para cada tipo de arquivo, o hook deve:
  1. Tentar corrigir automaticamente o que for possível (formatação)
  2. Validar o que não pode ser corrigido automaticamente (análise estática)
  3. Bloquear o commit com mensagem clara se houver erro não corrigível, indicando arquivo e linha
- Adicionar scripts de lint manual no arquivo de configuração principal do projeto

---

## 3. GITHUB ACTIONS — BUILD E DEPLOY

Crie três workflows separados.

**Arquivo 1 — lint.yml:**

- Trigger: push e pull_request em qualquer branch
- Um job por linguagem/contexto identificado no projeto, rodando em paralelo
- Cada job: instala dependências → roda linter → roda verificação de formatação
- Falha em qualquer job falha o workflow inteiro

**Arquivo 2 — build.yml:**

- Trigger: push nas branches main e develop (se existirem)
- Só executa se lint.yml passar
- Um job de build por contexto do projeto (frontend, backend, mobile, etc.)
- Rodar testes automatizados se existirem no projeto

**Arquivo 3 — deploy.yml:**

- Trigger: push em main e develop
- Só executa se build.yml passar
- Lógica de branch deploy:
  - develop → ambiente staging
  - main → ambiente production
- Se a plataforma de deploy não for identificável, gere o workflow com steps comentados e placeholders claros para preenchimento manual
- Se o deploy falhar, abrir uma GitHub Issue automaticamente com o log do erro

---

## FORMATO DE RESPOSTA ESPERADO

Para cada uma das 3 seções:

📁 Arquivos criados ou modificados:
[liste cada arquivo com o caminho completo]

📦 Dependências instaladas:
[comandos de instalação prontos para rodar]

⚙️ Configuração aplicada:
[conteúdo completo de cada arquivo]

⚠️ Pontos de atenção:
[conflitos possíveis, variáveis de ambiente necessárias, segredos a configurar no GitHub]

---

## RESTRIÇÕES

- Não assuma nenhuma stack — use apenas o que foi identificado no projeto
- Não quebre configurações existentes sem avisar antes
- Se encontrar conflito com ferramentas já instaladas, aponte e pergunte antes de sobrescrever
- Se alguma informação necessária não for encontrada no projeto, pergunte antes de prosseguir
- Todos os arquivos de configuração devem estar nos caminhos convencionais de cada ferramenta
- Os workflows do GitHub Actions devem ser funcionais e sem steps redundantes
