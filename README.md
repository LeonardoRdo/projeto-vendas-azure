# Análise de Vendas na Nuvem (Azure)

Projeto final de Cloud Computing (UNIMA). Grupo: Leonardo Fernandes, Andrielle Fernanda Silva, Joao Victor de Moraes, Rayca Rafaelle Farias.

O usuário envia um arquivo CSV de vendas pelo site. O arquivo é guardado no **Azure Blob Storage**. Ao pedir o relatório, uma **Azure Function** lê o CSV do Blob, calcula os indicadores (total de vendas, itens, ticket médio, produtos mais vendidos, vendas por categoria e por dia) e devolve o resultado para o site.

## Arquitetura

```
Navegador ──HTTPS──> Azure Static Web Apps (site: /web)
                          │  /api/*
                          ▼
                     Azure Functions (API: /api)  ──(connection string em variável de ambiente)──> Azure Blob Storage (container "vendas")
```

| Serviço | Papel | Modelo |
|---|---|---|
| Azure Static Web Apps (plano Free) | Hospeda o site | PaaS |
| Azure Functions (gerenciadas pelo Static Web Apps) | Processamento e API | PaaS / serverless |
| Azure Blob Storage | Armazenamento persistente dos CSVs | PaaS |

## Endpoints da API

| Método | Rota | O que faz |
|---|---|---|
| POST | `/api/upload` | Recebe `{nome, conteudo}`, valida o CSV e grava no Blob |
| GET | `/api/arquivos` | Lista os CSVs guardados |
| GET | `/api/relatorio?arquivo=NOME` | Lê o CSV do Blob e calcula os indicadores |

Formato do CSV: `data,produto,categoria,quantidade,preco_unitario` (data em AAAA-MM-DD). Exemplos em `exemplos/`.

## Segurança

- Nenhuma chave no código: a connection string fica em **Variáveis de ambiente** do Static Web Apps (`STORAGE_CONNECTION_STRING`).
- Container do Blob privado, HTTPS obrigatório.
- Validação de entrada (tipo de arquivo, tamanho de até 1 MB, colunas e valores) e nome de arquivo sanitizado.
- Site escreve dados na tela com `textContent` (evita injeção de HTML).
- Dados 100% fictícios (sem dados pessoais).

## Como executar (resumo)

O passo a passo completo, com cliques no portal, está em `docs/GUIA_PASSO_A_PASSO.md`.

1. Criar no Azure: Resource Group, Storage Account e Static Web App ligado a este repositório (App location `/web`, Api location `/api`, Output location vazio).
2. No Static Web App, em *Variáveis de ambiente*, criar `STORAGE_CONNECTION_STRING` com a connection string da Storage Account.
3. Abrir a URL do Static Web App e enviar `exemplos/vendas_exemplo.csv`.

Teste local opcional (precisa de Node 20, Azure Functions Core Tools e SWA CLI): copie `api/local.settings.sample.json` para `api/local.settings.json`, preencha a connection string e rode `swa start web --api-location api`.
