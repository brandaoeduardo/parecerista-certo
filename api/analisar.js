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
    {"tipo": "positivo", "tag": "Ponto forte", "texto": "aspecto bem desenvolvido"},
    {"tipo": "positivo", "tag": "Ponto forte", "texto": "outro ponto positivo"},
    {"tipo": "critico", "tag": "Problema crítico", "texto": "falha séria que pode reprovar"},
    {"tipo": "atencao", "tag": "Atenção", "texto": "ponto que precisa de melhoria"},
    {"tipo": "atencao", "tag": "Atenção", "texto": "outro ponto de atenção"},
    {"tipo": "melhoria", "tag": "Sugestão", "texto": "melhoria específica e acionável"},
    {"tipo": "melhoria", "tag": "Sugestão", "texto": "outra sugestão de melhoria"}
  ],
  "conformidade": ${hasEdital ? '[{"status":"ok","criterio":"Critério do edital","obs":"Como atende"},{"status":"nok","criterio":"Outro critério","obs":"Por que não atende"},{"status":"warn","criterio":"Critério parcial","obs":"Atende parcialmente"}]' : 'null'},
  "conformidade_score": ${hasEdital ? '75' : 'null'},
  "proximos_passos": ["ação concreta 1", "ação concreta 2", "ação concreta 3"]
}

Seja honesto e técnico. Use linguagem direta e específica ao conteúdo real do projeto. As notas devem refletir genuinamente a qualidade do documento.`;

  let messageContent;

  if (hasPdf) {
    messageContent = [
      {
        type: 'document',
        source: {
          type: 'base64',
          media_type: 'application/pdf',
          data: projetoPdfBase64,
        },
      },
      { type: 'text', text: instrucao },
    ];
  } else {
    messageContent = instrucao;
  }

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1500,
        messages: [{ role: 'user', content: messageContent }],
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      console.error('Anthropic error:', err);
      return res.status(502).json({ error: 'Erro na API de IA', details: err });
    }

    const data = await response.json();
    let raw = data.content.map((b) => b.text || '').join('');
    raw = raw.replace(/```json|```/g, '').trim();
    const result = JSON.parse(raw);
    return res.status(200).json(result);
  } catch (err) {
    console.error('Handler error:', err);
    return res.status(500).json({ error: 'Erro interno', details: err.message });
  }
}
