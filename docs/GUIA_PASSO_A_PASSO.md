# Guia passo a passo (para o Leonardo conduzir)

Tempo total estimado: 2 a 3 horas. Prazo: **sexta 13/11, 18h**. Dica: façam em chamada de voz com compartilhamento de tela; quem não está no teclado acompanha e tira os prints.

Regra de ouro: **nunca** tire print da tela que mostra a *connection string* ou as *chaves de acesso* e nunca coloque no GitHub.

## Fase 0: conta do Azure (Leonardo)

1. Acesse https://azure.microsoft.com/free/students e entre com o e-mail da faculdade (o da UNIMA).
2. A oferta Azure for Students dá US$ 100 de crédito por 12 meses, sem cartão. Segundo a Microsoft, é para alunos de graduação; se o seu e-mail não for aceito, **avise o professor** (o enunciado manda comunicar restrições de acesso) e anote no relatório.
3. Plano B: conta gratuita comum do Azure (https://azure.microsoft.com/free), que pede cartão, mas o projeto custa centavos. Só use se o professor autorizar.
4. Depois de entrar em https://portal.azure.com, confira em *Assinaturas* que existe uma assinatura ativa. **Print 1**: a assinatura.

## Fase 1: GitHub (Andrielle)

1. Crie um repositório `projeto-vendas-azure` no GitHub (pode ser privado) e convide os 3 colegas em *Settings > Collaborators*.
2. Envie a pasta do projeto: *Add file > Upload files*, arrastando o conteúdo do ZIP (api, web, exemplos, docs, README.md, .gitignore). Confira que **não** há `local.settings.json`.
3. Dê permissão para o Leonardo (o Azure precisa acessar o repositório pela conta dele).

## Fase 2: Resource Group (Leonardo)

1. Portal > *Grupos de recursos* > **Criar**. Nome: `rg-vendas-cloud`. Região: *Brazil South* (ou outra permitida pela sua assinatura).
2. **Print 2**: o grupo de recursos criado.

## Fase 3: Storage Account (Leonardo)

1. Portal > *Contas de armazenamento* > **Criar**.
   - Grupo de recursos: `rg-vendas-cloud`
   - Nome: `stvendas` + números (só minúsculas, tem que ser único no mundo, ex.: `stvendascloud2611`)
   - Região: a mesma do grupo. Desempenho: *Standard*. Redundância: **LRS** (a mais barata)
2. Aba *Avançado*: deixe *Exigir transferência segura (HTTPS)* ligado e *Permitir acesso anônimo* **desligado**.
3. Criar. Depois, no menu da conta, *Contêineres* > **+ Contêiner** com nome `vendas` e acesso **Privado**. (A API também cria sozinha se não existir.)
4. Copie a connection string: *Segurança + rede > Chaves de acesso > Mostrar > Cadeia de conexão (key1) > copiar*. Guarde só para colar na Fase 5.
5. **Print 3**: visão geral da Storage Account. **Print 4**: tela de Contêineres mostrando `vendas` com nível de acesso *Privado* (sem chaves na tela).

## Fase 4: Static Web App (Leonardo)

1. Portal > *Static Web Apps* > **Criar**.
   - Grupo de recursos: `rg-vendas-cloud`; Nome: `swa-vendas`; Tipo de plano: **Gratuito (Free)**
   - Região da API: escolha a que o portal oferecer (Brasil não aparece; use *East US 2* ou *West US 2*)
   - Origem: **GitHub** > autorizar > Organização (sua conta), Repositório `projeto-vendas-azure`, Branch `main`
   - Predefinições de build: **Custom**
   - Local do aplicativo (App location): `/web`
   - Local da API (Api location): `/api`
   - Local de saída (Output location): deixe **vazio**
2. Criar. O Azure adiciona um arquivo em `.github/workflows` no repositório e roda o deploy (3 a 5 minutos). Acompanhe na aba **Actions** do GitHub; deve terminar com ✔ verde.
3. **Print 5**: visão geral do Static Web App (com a URL). **Print 6**: aba Actions com o deploy verde.

## Fase 5: variável de ambiente (Leonardo)

1. Static Web App > *Configurações > Variáveis de ambiente* > **Adicionar**.
2. Nome: `STORAGE_CONNECTION_STRING` | Valor: a connection string copiada | Salvar.
3. **Print 7**: a lista de variáveis (o valor fica oculto; confira que não aparece).

Se a tela de variáveis não aparecer com esse nome, procure por *Configuration / Application settings*.

## Fase 6: testes (João Victor)

Abra a URL do Static Web App. Para cada teste, tire print (os arquivos de teste estão em `exemplos/`):

| # | Teste | Como fazer | Resultado esperado |
|---|---|---|---|
| T1 | Acesso pela Internet | Abrir a URL no celular ou aba anônima | Site carrega (print com a URL visível) |
| T2 | Inserção e armazenamento | Enviar `vendas_exemplo.csv` | Mensagem verde "Arquivo gravado (40 registros)" e arquivo aparece na lista |
| T3 | Processamento na nuvem | Clicar em *Ver relatório* | Total R$ 11.613,20; 124 itens; 40 registros; ticket médio R$ 290,33; top produto Camiseta Basica (27 un.) |
| T4 | Recuperação dos resultados | Abrir `SUA_URL/api/arquivos` no navegador | JSON com a lista de arquivos; e no Portal, o blob dentro do contêiner `vendas` |
| T5a | Entrada inválida | Enviar `vendas_invalido.csv` | Mensagem vermelha listando as linhas com erro; nada é gravado |
| T5b | Tipo errado | Enviar um arquivo `.txt` ou `.png` | Mensagem "Envie um arquivo .csv." |

Anote para cada teste: data/hora, resultado real, passou ou falhou. Isso vira a tabela da seção 7 do relatório.

## Fase 7: evidências, segurança e custos (Rayca)

1. Portal > Grupo de recursos > **Print 8**: lista dos recursos (Storage e Static Web App, o Function aparece dentro do Static Web App).
2. Static Web App > *Funções* (Functions): **Print 9** mostrando `upload`, `arquivos` e `relatorio` (processamento).
3. Storage Account > Contêiner `vendas` > **Print 10**: os blobs enviados (armazenamento funcionando).
4. Permissões: Grupo de recursos > *Controle de acesso (IAM) > Atribuições de função*. **Print 11**. (Opcional: o Leonardo pode adicionar os colegas como *Leitor* para eles navegarem no portal.)
5. Consumo: *Gerenciamento de Custos > Análise de custo* (ou *Visão geral* da assinatura mostrando o crédito). **Print 12**. Pode demorar algumas horas para aparecer.
6. Custos: abra https://azure.microsoft.com/pricing/calculator, adicione *Static Web Apps (Free)* e *Storage Accounts (Blob, LRS, Hot, poucos GB)*. **Print 13** do resultado.

## Fase 8: fechamento (Leonardo + todos)

1. Cole os prints no relatório (`Relatorio_Tecnico.docx`, nos locais marcados com **[PRINT]**), preencha a tabela de testes e exporte em **PDF** (Arquivo > Salvar como PDF). Confira: **4 a 6 páginas** e os 4 nomes na capa.
2. Baixe o repositório como ZIP (GitHub > *Code > Download ZIP*) ou use o link do repo.
3. Entregue no Canvas: PDF do relatório + link do GitHub ou ZIP. Confirmem todos que **entraram no grupo no Canvas** (Pessoas > Grupos), senão ficam sem nota.
4. Depois da nota, apaguem o Resource Group para não gastar crédito.

## Problemas comuns

- **Site abre mas upload dá erro 500**: variável `STORAGE_CONNECTION_STRING` faltando ou colada errada. Refaça a Fase 5 e aguarde 1 minuto.
- **Actions falhou**: abra o log. Confira Api location `/api` e App location `/web`.
- **Região bloqueada ao criar recurso**: a assinatura de estudante limita regiões. Escolha uma das permitidas e anote no relatório.
- **Qualquer cota/limite do Azure**: relatem no relatório (o enunciado pede).

## Sobre os prints

- **Entregável C (Evidências do Azure)**: junte os 13 prints num PDF ou pasta separada e entregue junto.
- **Dentro do relatório**: cole só os prints principais (os quadros amarelos). Reduza o tamanho das imagens para o relatório continuar com **no máximo 6 páginas**.
