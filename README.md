# GUAÇU NEWS SCRAPPING

Um poderoso web scrapper para extrair notícias atualizadas das cidades de Mogi-Guaçu e Mogi-Mirim, ambas do estado de São Paulo e enviadas com o link e o título da matéria para aplicativos de comunicação. Mantenha-se informado com as últimas notícias da sua região de forma eficiente e automatizada na palma de sua mão.

## Início Rápido

Essas instruções irão ajudá-lo a obter uma cópia do projeto e executá-lo na sua máquina local para fins de desenvolvimento e teste.

### Pré-requisitos

Antes de começar, certifique-se de ter as seguintes ferramentas instaladas em sua máquina:
- ![Git](https://img.icons8.com/color/20/000000/git.png) [Git](https://git-scm.com) - Sistema de controle de versão distribuído.
- ![Node.js](https://img.icons8.com/color/20/000000/nodejs.png) [Node.js](https://nodejs.org/en/) - Ambiente de execução JavaScript.
- ![NPM](https://img.icons8.com/color/20/000000/npm.png) [NPM](https://www.npmjs.com/) - Gerenciador de pacotes para JavaScript.
- ![Docker](https://img.icons8.com/color/20/000000/docker.png) [Docker](https://www.docker.com/) - Plataforma para desenvolvimento, envio e execução de aplicações em containers.
- ![Docker Compose](https://img.icons8.com/color/20/000000/docker.png) [Docker Compose](https://docs.docker.com/compose/) - Ferramenta para definição e execução de aplicações Docker multi-container.

Além disso, é bom ter um editor para trabalhar com o código, como [VSCode](https://code.visualstudio.com/).

**Para começar a usar o GUAÇU NEWS SCRAPPING, siga os passos abaixo:**

1. Clone o repositório para a sua máquina local usando `git clone`.
2. Navegue até o diretório do projeto usando `cd`.
3. Instale todas as dependências necessárias do projeto usando `npm install`.
4. Suba os container docker para aplicação se conectar usando o comando `npm run services:up`
5. Inicie a aplicação no modo desenvolvimento com o comando `npm run start:dev`

Agora você deve ter o GUAÇU NEWS SCRAPPING rodando localmente e pronto para começar a extrair as últimas notícias de Mogi-Guaçu e Mogi-Mirim.

## Tecnologias Utilizadas

Este projeto utiliza as seguintes tecnologias:

- ![Node.js](https://img.icons8.com/color/20/000000/nodejs.png) [Node.js](https://nodejs.org/en/) - Ambiente de execução JavaScript usado para desenvolver o servidor.
- ![TypeScript](https://img.icons8.com/color/20/000000/typescript.png) [TypeScript](https://www.typescriptlang.org/) - Superconjunto de JavaScript que adiciona tipagem estática e outros recursos.
- ![Data Streaming](https://img.icons8.com/color/20/000000/data-configuration.png) [Apache Kafka](https://kafka.apache.org/) - Plataforma de streaming de eventos distribuídos usada para construir pipelines de dados em tempo real.
- ![MySQL](https://img.icons8.com/color/20/000000/mysql-logo.png) [MySQL 8](https://www.mysql.com/) - Sistema de gerenciamento de banco de dados relacional usado para armazenar e recuperar dados.
- ![Kafka UI](https://img.icons8.com/color/20/000000/red-panda.png) [Kafka UI Redpanda](https://vectorized.io/redpanda/kafka-ui/) - Interface de usuário para visualizar e gerenciar tópicos Kafka.

Por favor, note que os ícones podem não corresponder exatamente às tecnologias mencionadas devido à disponibilidade limitada de ícones.


> **Observação:** Este sistema faz requisições POST para a API oficial do Telegram (desativado por padrão) e para a API não oficial do WhatsApp [(Evolution API)](https://github.com/EvolutionAPI/evolution-api/tree/main), que deve estar previamente configurada. As configurações de ambiente (endpoins tokens de autenticação etc..) deverão serem configuradas no arquivo `.env`.
