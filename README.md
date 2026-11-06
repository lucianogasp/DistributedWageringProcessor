# Processador Distribuído de Transações de Apostas

Projeto desenvolvido como parte do desafio técnico da Jungle Gaming.

A proposta do sistema é construir um processador distribuído de transações financeiras de apostas, recebidas de múltiplos provedores de jogos, com foco em precisão financeira, modelagem de domínio, idempotência, concorrência e consistência entre os saldos das carteiras e seus respectivos registros financeiros (ledger).

## Estado atual da implementação

Esta submissão representa uma implementação parcial da solução proposta.

O foco principal durante o desenvolvimento foi estabelecer a modelagem de domínio e a estrutura técnica inicial da aplicação.

### Implementado

- **Money Value Object:** representação monetária utilizando `decimal.js`, evitando operações financeiras com a imprecisão de ponto flutuante do JavaScript.
- **Wallet Aggregate:** encapsulamento do saldo da carteira e de suas operações financeiras.
- **WagerTransaction:** representação de domínio das transações de apostas e seus respectivos estados.
- **WalletLedgerEntry:** representação de domínio dos registros financeiros imutáveis e da consistência dos saldos.
- **Mapeamento ORM inicial:** início da implementação das entidades TypeORM para carteiras, transações de apostas e registros financeiros.
- **Ambiente de banco de dados:** PostgreSQL configurado por meio do Docker Compose.
- **Configuração da aplicação:** configuração inicial da conexão entre NestJS e TypeORM.

### Não implementado

As seguintes funcionalidades permanecem pendentes:

- Migrations iniciais e validação do esquema do banco de dados.
- Endpoints de criação e consulta de carteiras.
- Casos de uso para processamento de transações de apostas.
- Idempotência persistente e detecção de conflitos entre payloads.
- Transações no banco de dados e controle de concorrência.
- Atualização atômica dos saldos das carteiras e dos registros financeiros.
- Integração com AWS SQS, incluindo consumidores de mensagens e filas de mensagens não processáveis (Dead Letter Queue).
- Padrões Transactional Inbox e Outbox.
- Mecanismos de retry e processamento de transações recebidas fora de ordem.
- Integração de autenticação.
- Testes de integração e concorrência.
- Logs estruturados, métricas e verificações de saúde da aplicação.

## Tecnologias utilizadas

- TypeScript
- NestJS
- PostgreSQL
- TypeORM
- Docker Compose
- decimal.js
- npm (gerenciador de pacotes)

**Observação:** o desafio especificava o uso de Bun, mas foi utilizado npm durante o desenvolvimento.

## Familiaridade com as tecnologias e conceitos

Minha experiência prática com parte das tecnologias solicitadas — especialmente NestJS, PostgreSQL, Docker e TypeORM — ainda é limitada.

Também não possuo experiência consolidada com algumas das abordagens arquiteturais e estratégias envolvidas no desafio, como Domain-Driven Design (DDD), mensageria distribuída, observabilidade, testes de integração, controle de concorrência e idempotência.

Durante o desenvolvimento, parte do tempo disponível foi dedicada ao estudo desses conceitos e ferramentas, buscando compreender suas aplicações e estabelecer uma base inicial para a solução. Essa curva de aprendizado influenciou diretamente o escopo que foi possível implementar.

## Visão geral do domínio

A modelagem inicial está organizada em torno de três conceitos principais:

- **Wallet:** representa o saldo de um jogador em uma moeda específica.
- **WagerTransaction:** representa uma operação financeira recebida de um provedor de jogos.
- **WalletLedgerEntry:** representa o registro financeiro associado a uma alteração de saldo.

Um Value Object compartilhado, denominado `Money`, é responsável pela representação e pelas operações monetárias.

## Ambiente de execução

O projeto possui um ambiente local inicial de PostgreSQL configurado por meio do Docker Compose.

O container do banco de dados foi iniciado com sucesso, e a aplicação NestJS iniciou sem apresentar erros de conexão com o PostgreSQL.

Entretanto, as migrations ainda não foram concluídas e a aplicação ainda não disponibiliza a API de processamento de apostas.

## Considerações finais

Esta submissão deve ser considerada uma implementação inicial das fundações de domínio e infraestrutura, e não um processador de transações de apostas funcional.

Reconheço que os componentes pendentes são fundamentais para atender aos requisitos de consistência financeira, concorrência e processamento distribuído do desafio.

Optei por documentar explicitamente o estado atual, as decisões tomadas e as limitações da implementação, distinguindo o que foi efetivamente desenvolvido daquilo que ainda precisaria ser implementado e validado.