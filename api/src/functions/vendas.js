// Tres endpoints (Azure Functions, gatilho HTTP):
//   POST /api/upload     -> valida e grava o CSV no Blob Storage
//   GET  /api/arquivos   -> lista os CSVs guardados
//   GET  /api/relatorio  -> le o CSV do Blob e calcula os indicadores
const { app } = require("@azure/functions");
const { getContainer, limparNome, processarCsv, TAMANHO_MAXIMO } = require("../lib");

function resposta(status, corpo) {
  return { status, jsonBody: corpo };
}

app.http("upload", {
  methods: ["POST"],
  authLevel: "anonymous",
  route: "upload",
  handler: async (request, context) => {
    let corpo;
    try {
      corpo = await request.json();
    } catch {
      return resposta(400, { erro: "Corpo da requisicao invalido (esperado JSON)." });
    }

    const nome = limparNome(corpo.nome);
    const conteudo = corpo.conteudo;
    if (!nome.toLowerCase().endsWith(".csv")) return resposta(400, { erro: "Envie um arquivo .csv." });
    if (typeof conteudo !== "string" || conteudo.length === 0) return resposta(400, { erro: "Arquivo vazio." });
    if (conteudo.length > TAMANHO_MAXIMO) return resposta(413, { erro: "Arquivo maior que 1 MB." });

    try {
      const relatorio = processarCsv(conteudo); // valida antes de guardar
      const container = await getContainer();
      const nomeBlob = `${Date.now()}-${nome}`;
      const blob = container.getBlockBlobClient(nomeBlob);
      await blob.upload(conteudo, Buffer.byteLength(conteudo), {
        blobHTTPHeaders: { blobContentType: "text/csv" },
        metadata: { registros: String(relatorio.registros) },
      });
      context.log(`CSV gravado: ${nomeBlob} (${relatorio.registros} registros)`);
      return resposta(201, { arquivo: nomeBlob, registros: relatorio.registros });
    } catch (e) {
      if (e.validacao) return resposta(400, { erro: "CSV invalido.", detalhes: e.validacao });
      context.error(e);
      return resposta(500, { erro: "Erro interno ao gravar o arquivo." });
    }
  },
});

app.http("arquivos", {
  methods: ["GET"],
  authLevel: "anonymous",
  route: "arquivos",
  handler: async (request, context) => {
    try {
      const container = await getContainer();
      const lista = [];
      for await (const b of container.listBlobsFlat({ includeMetadata: true })) {
        lista.push({
          nome: b.name,
          tamanho: b.properties.contentLength,
          data: b.properties.lastModified,
          registros: b.metadata ? Number(b.metadata.registros) : null,
        });
      }
      lista.sort((a, b) => new Date(b.data) - new Date(a.data));
      return resposta(200, lista);
    } catch (e) {
      context.error(e);
      return resposta(500, { erro: "Erro interno ao listar os arquivos." });
    }
  },
});

app.http("relatorio", {
  methods: ["GET"],
  authLevel: "anonymous",
  route: "relatorio",
  handler: async (request, context) => {
    const arquivo = request.query.get("arquivo");
    if (!arquivo || arquivo.includes("/") || arquivo.includes("\\")) {
      return resposta(400, { erro: "Informe o parametro ?arquivo=NOME." });
    }
    try {
      const container = await getContainer();
      const blob = container.getBlockBlobClient(arquivo);
      if (!(await blob.exists())) return resposta(404, { erro: "Arquivo nao encontrado." });
      const texto = (await blob.downloadToBuffer()).toString("utf-8");
      const relatorio = processarCsv(texto); // processamento na nuvem
      return resposta(200, { arquivo, ...relatorio });
    } catch (e) {
      if (e.validacao) return resposta(422, { erro: "CSV invalido.", detalhes: e.validacao });
      context.error(e);
      return resposta(500, { erro: "Erro interno ao gerar o relatorio." });
    }
  },
});
