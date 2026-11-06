# Arquitetura do Sistema

## 1. Visão geral

A estrutura inicial do projeto foi organizada de forma modular e orientada ao domínio, com inspiração em conceitos de Domain-Driven Design (DDD) e Clean Architecture.

A intenção é manter as regras de negócio independentes dos detalhes de infraestrutura, permitindo que os módulos de domínio sejam utilizados pelos casos de uso sem depender diretamente de mecanismos externos.

Os principais módulos previstos são:

- **Wallet:** gerenciamento das carteiras e seus saldos.
- **Wagering:** processamento das transações de apostas.
- **Shared:** componentes compartilhados, como o Value Object `Money`.

A separação interna planejada contempla domínio, aplicação e infraestrutura.

## 2. Modelagem de domínio

### Money

O `Money` foi implementado como um Value Object responsável pela representação e pelas operações monetárias.

Foi utilizada a biblioteca `decimal.js` para evitar os problemas de precisão associados à utilização de números de ponto flutuante nativos do JavaScript.

A intenção é manter os valores monetários representados com precisão decimal, evitando conversões desnecessárias para `number`.

### Wallet

A `Wallet` representa uma carteira associada a um jogador e a uma moeda específica.

O agregado encapsula o saldo e as operações financeiras, buscando preservar as regras de negócio relacionadas à movimentação dos valores.

Entre as regras consideradas estão:

- Impedir saldos negativos.
- Validar operações de débito e crédito.
- Garantir compatibilidade entre as moedas envolvidas.
- Manter o controle de versão do agregado.

### WagerTransaction

A `WagerTransaction` representa uma transação financeira originada por um provedor de jogos.

A entidade contempla informações como provedor, identificadores externos, carteira associada, valor, moeda, tipo da operação e estado da transação.

A modelagem considera transições explícitas entre estados, evitando alterações arbitrárias no ciclo de vida de uma transação.

### WalletLedgerEntry

A `WalletLedgerEntry` representa um registro financeiro associado à movimentação de uma carteira.

A proposta é manter esses registros imutáveis, permitindo rastrear as alterações de saldo.

Cada registro contempla:

- Direção da movimentação (débito ou crédito).
- Valor da movimentação.
- Saldo anterior.
- Saldo posterior.
- Moeda.
- Referência à carteira e à transação relacionada.

A consistência aritmética entre o saldo anterior, a movimentação e o saldo posterior também foi considerada na modelagem.

## 3. Persistência

O PostgreSQL foi escolhido como banco de dados relacional, utilizando TypeORM como ORM.

O mapeamento inicial contempla as entidades:

- `WalletOrmEntity`
- `WagerTransactionOrmEntity`
- `WalletLedgerEntryOrmEntity`

Foram iniciadas as definições de relacionamentos, índices únicos e restrições de integridade.

Entretanto, as migrations, as restrições completas do esquema e os repositórios ainda não foram concluídos e validados.

## 4. Concorrência e consistência financeira

A estratégia planejada para o controle de concorrência considera a utilização de transações do banco de dados e bloqueio pessimista de registros de carteira.

A intenção é impedir que operações concorrentes sobre a mesma carteira provoquem atualizações inconsistentes de saldo.

O fluxo planejado contempla:

1. Iniciar uma transação no banco de dados.
2. Obter o bloqueio da carteira envolvida.
3. Validar o saldo e as regras da operação.
4. Atualizar o saldo da carteira.
5. Registrar a movimentação no ledger.
6. Confirmar a transação.

A atualização do saldo e a criação do registro financeiro devem ocorrer atomicamente.

**Status:** essa estratégia foi considerada durante o planejamento, mas não foi implementada nem testada.

## 5. Idempotência

A estratégia planejada de idempotência considera a utilização de uma chave `Idempotency-Key` fornecida nas requisições.

A proposta contempla:

- Persistir a chave de idempotência.
- Armazenar um hash do payload original.
- Reutilizar o resultado de uma requisição já processada quando a chave e o payload forem equivalentes.
- Rejeitar requisições que reutilizem a mesma chave com payload diferente.
- Utilizar restrições únicas no banco de dados para evitar duplicidade.

A intenção é garantir que requisições repetidas não provoquem movimentações financeiras duplicadas.

**Status:** a estrutura inicial de alguns campos foi considerada no mapeamento ORM, mas a estratégia de idempotência persistente não foi implementada.

## 6. Mensageria e processamento distribuído

A arquitetura planejada considera AWS SQS para o processamento assíncrono das transações.

O fluxo previsto contempla:

- Recebimento de mensagens.
- Processamento por consumidores independentes.
- Persistência de mensagens recebidas por meio do padrão Inbox.
- Publicação confiável de eventos por meio do padrão Outbox.
- Tentativas de reprocessamento com intervalos progressivos.
- Encaminhamento de mensagens não processáveis para uma Dead Letter Queue (DLQ).
- Confirmação da mensagem somente após a conclusão da operação no banco de dados.

A intenção é reduzir o risco de perda de mensagens e manter a consistência entre o processamento financeiro e a comunicação entre serviços.

**Status:** a integração com SQS e os mecanismos de Inbox, Outbox, retry e DLQ não foram implementados.

## 7. Autenticação

A autenticação não foi implementada nesta submissão.

A proposta inicial considera a utilização de um provedor externo de identidade (OIDC), conforme a possibilidade de utilizar uma solução externa prevista no desafio.

## 8. Testes

A estratégia de testes planejada contempla diferentes níveis:

- **Testes unitários:** validação das regras de domínio e dos Value Objects.
- **Testes de integração:** validação da comunicação entre aplicação e PostgreSQL.
- **Testes de concorrência:** validação de operações simultâneas sobre uma mesma carteira.
- **Testes de idempotência:** validação de requisições repetidas e conflitos de payload.
- **Testes de recuperação:** validação de falhas durante o processamento de mensagens.

**Status:** essa estrutura de testes não foi implementada.

## 9. Limitações e familiaridade técnica

O desenvolvimento deste desafio também representou um processo de aprendizado em relação a tecnologias e conceitos com os quais ainda não possuo experiência prática consolidada.

Minha familiaridade com NestJS, PostgreSQL, Docker e TypeORM é limitada. Da mesma forma, conceitos como DDD, mensageria distribuída, observabilidade, testes de integração, concorrência e idempotência ainda são áreas nas quais estou desenvolvendo conhecimento.

Parte do tempo disponível foi dedicada à compreensão dessas ferramentas e abordagens, o que influenciou o escopo final da implementação.

Além disso, foi utilizado npm como gerenciador de pacotes, em vez de Bun, conforme solicitado no desafio.

## 10. Limitações da implementação atual

Esta submissão contempla principalmente a modelagem inicial do domínio e a configuração básica da infraestrutura.

Os principais componentes ainda pendentes são:

- Migrations e validação do esquema do banco de dados.
- Repositórios e casos de uso.
- Endpoints HTTP.
- Processamento efetivo das transações.
- Garantias de concorrência e idempotência.
- Integração com mensageria.
- Mecanismos de recuperação de falhas.
- Testes automatizados.
- Observabilidade.

Portanto, a implementação atual não oferece as garantias necessárias para ser considerada um processador distribuído de transações financeiras funcional.

A arquitetura documentada representa a direção planejada para a solução, distinguindo as decisões consideradas durante o desenvolvimento dos mecanismos que ainda precisam ser implementados e validados.