// Funcoes de apoio: acesso ao Blob Storage e processamento do CSV.
const { BlobServiceClient } = require("@azure/storage-blob");

const NOME_CONTAINER = "vendas";
const TAMANHO_MAXIMO = 1_000_000; // 1 MB por arquivo (protecao basica)
const COLUNAS = ["data", "produto", "categoria", "quantidade", "preco_unitario"];

// A chave NAO fica no codigo: vem das "Variaveis de ambiente" do Azure.
async function getContainer() {
  const conexao = process.env.STORAGE_CONNECTION_STRING;
  if (!conexao) {
    throw new Error("STORAGE_CONNECTION_STRING nao configurada.");
  }
  const servico = BlobServiceClient.fromConnectionString(conexao);
  const container = servico.getContainerClient(NOME_CONTAINER);
  await container.createIfNotExists(); // privado por padrao (sem acesso publico)
  return container;
}

// Remove caracteres perigosos do nome do arquivo.
function limparNome(nome) {
  return String(nome || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9._-]/g, "_")
    .slice(0, 80);
}

function numero(txt) {
  return Number(String(txt).trim().replace(",", "."));
}

// Le o CSV, valida linha por linha e calcula os indicadores.
// Lanca erro com a lista de problemas se o arquivo for invalido.
function processarCsv(texto) {
  const linhas = String(texto)
    .replace(/^\uFEFF/, "")
    .split(/\r?\n/)
    .filter((l) => l.trim() !== "");
  if (linhas.length < 2) {
    throw erroValidacao(["O arquivo precisa ter o cabecalho e ao menos 1 venda."]);
  }

  const sep = linhas[0].includes(";") ? ";" : ",";
  const cab = linhas[0].split(sep).map((c) => c.trim().toLowerCase());
  const faltando = COLUNAS.filter((c) => !cab.includes(c));
  if (faltando.length) {
    throw erroValidacao([`Colunas faltando: ${faltando.join(", ")}. Esperado: ${COLUNAS.join(", ")}.`]);
  }

  const erros = [];
  const vendas = [];
  for (let i = 1; i < linhas.length; i++) {
    const cel = linhas[i].split(sep).map((c) => c.trim());
    const reg = {};
    cab.forEach((nome, idx) => (reg[nome] = cel[idx] ?? ""));
    const n = i + 1; // numero da linha no arquivo
    const quantidade = numero(reg.quantidade);
    const preco = numero(reg.preco_unitario);

    if (!/^\d{4}-\d{2}-\d{2}$/.test(reg.data) || isNaN(Date.parse(reg.data))) erros.push(`Linha ${n}: data invalida (use AAAA-MM-DD).`);
    else if (!reg.produto) erros.push(`Linha ${n}: produto vazio.`);
    else if (!Number.isInteger(quantidade) || quantidade <= 0) erros.push(`Linha ${n}: quantidade invalida.`);
    else if (!isFinite(preco) || preco <= 0) erros.push(`Linha ${n}: preco_unitario invalido.`);
    else vendas.push({ data: reg.data, produto: reg.produto, categoria: reg.categoria || "Sem categoria", quantidade, preco });
    if (erros.length >= 10) break;
  }
  if (erros.length) throw erroValidacao(erros);

  // ----- Indicadores -----
  let total = 0;
  let itens = 0;
  const porProduto = {};
  const porCategoria = {};
  const porDia = {};
  for (const v of vendas) {
    const valor = v.quantidade * v.preco;
    total += valor;
    itens += v.quantidade;
    porProduto[v.produto] = porProduto[v.produto] || { produto: v.produto, quantidade: 0, receita: 0 };
    porProduto[v.produto].quantidade += v.quantidade;
    porProduto[v.produto].receita += valor;
    porCategoria[v.categoria] = (porCategoria[v.categoria] || 0) + valor;
    porDia[v.data] = (porDia[v.data] || 0) + valor;
  }
  const arred = (x) => Math.round(x * 100) / 100;

  return {
    registros: vendas.length,
    total_vendas: arred(total),
    total_itens: itens,
    ticket_medio: arred(total / vendas.length),
    top_produtos: Object.values(porProduto)
      .sort((a, b) => b.quantidade - a.quantidade)
      .slice(0, 5)
      .map((p) => ({ ...p, receita: arred(p.receita) })),
    por_categoria: Object.entries(porCategoria)
      .map(([categoria, valor]) => ({ categoria, valor: arred(valor) }))
      .sort((a, b) => b.valor - a.valor),
    por_dia: Object.entries(porDia)
      .map(([data, valor]) => ({ data, valor: arred(valor) }))
      .sort((a, b) => a.data.localeCompare(b.data)),
  };
}

function erroValidacao(lista) {
  const e = new Error("Arquivo invalido");
  e.validacao = lista;
  return e;
}

module.exports = { getContainer, limparNome, processarCsv, TAMANHO_MAXIMO };
