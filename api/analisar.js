module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Método não permitido' });

  const { projeto, projetoPdfBase64, edital, editalNome } = req.body;

  const hasTexto = projeto && projeto.length > 30;
  const hasPdf = projetoPdfBase64 && projetoPdfBase64.length > 100;

  if (!hasTexto && !hasPdf) {
    return res.status(400).json({ error: 'Envie o texto ou o PDF do projeto' });
  }

  const hasEdital = edital && edital.length > 20;

  const instrucao = `Você é um parecerista especializado em projetos culturais brasileiros com 20 anos de experiência avaliando editais públicos de fomento. Analise o projeto cultural ${hasPdf ? 'no documento PDF anexo' : 'abaixo'} com rigor técnico e retorne APENAS um JSON válido, sem markdown, sem texto fora do JSON.

${hasEdital ? `EDITAL AO QUAL O PROJETO SERÁ SUBMETIDO (${editalNome || 'edital informado'}):\n${edital.substring(0, 1500)}\n\n` : ''}${!hasPdf ? `PROJETO CULTURAL:\n${projeto.substring(0, 3000)}\n\n` : ''}Retorne exatamente este JSON (sem texto fora dele):
{
  "titulo_projeto": "título ou nome identificador do projeto",
  "nota_geral": 72,
  "nota_label": "Bom — com ajustes tem boas chances",
  "nota_cor": "med",
  "dimensoes": [
    {"nome": "Mérito artístico", "nota": 75, "cor": "med"},
    {"nome": "Viabilidade técnica", "nota": 60, "cor": "low"},
    {"nome": "Justificativa e contexto", "nota": 80, "cor": "high"},
    {"nome": "Metodologia", "nota": 65, "cor": "med"},
    {"nome": "Orçamento", "nota": 55, "cor": "low"},
    {"nome": "Impacto social", "nota": 78, "cor": "high"}
  ],
  "parecer_geral": "Texto de 3-4 frases como um parecerista real escreveria: avaliação geral honesta, principais forças e fraquezas, perspectiva de aprovação.",
  "itens": [

