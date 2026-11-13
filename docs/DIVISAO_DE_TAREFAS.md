# Divisão de tarefas (versão: Leonardo faz quase tudo)

| Pessoa | Tarefa mínima | Tempo |
|---|---|---|
| **Leonardo** | Tudo: GitHub, conta Azure, recursos, deploy, testes, prints, relatório e entrega | algumas horas |
| **Andrielle** | Ler o README e o arquivo `api/src/functions/vendas.js`; conferir o relatório pronto e responder se achou erro | 20 min |
| **Joao Victor** | Abrir o site publicado no celular e enviar o arquivo `vendas_invalido.csv` (teste de erro); mandar print | 10 min |
| **Rayca** | Ler a seção 8 do relatório (segurança e custos) e rodar a Calculadora de Preços do Azure; mandar print | 15 min |

Todos: entrar no grupo no Canvas (Pessoas > Grupos) e ler a "cola" abaixo.

## Cola para qualquer um explicar o projeto

- **Problema**: guardar e analisar vendas em CSV sem servidor próprio.
- **Serviços**: Static Web Apps (site), Azure Functions (processamento), Blob Storage (arquivos), tudo num Resource Group.
- **Caminho dos dados**: navegador > Function `/api/upload` > Blob Storage. Depois: navegador > Function `/api/relatorio` > lê o Blob > calcula > mostra na tela.
- **Por que nuvem**: paga só o que usa, sem manter servidor, acessível pela Internet.
- **Segurança**: chave em variável de ambiente, contêiner privado, HTTPS, validação do arquivo.
- **Modelo**: PaaS (a Microsoft cuida dos servidores).
- **Custo**: plano gratuito do site + centavos de armazenamento.
