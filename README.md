# Parecerista Cultural — Deploy na Vercel

## Estrutura do projeto

```
parecerista/
├── api/
│   └── analisar.js      ← backend (chama a API da Anthropic)
├── public/
│   └── index.html       ← frontend completo
├── vercel.json          ← configuração da Vercel
└── README.md
```

---

## Passo a passo para subir o site

### 1. Crie sua chave de API da Anthropic
1. Acesse https://console.anthropic.com
2. Faça login ou crie uma conta
3. Vá em **API Keys** → **Create Key**
4. Copie a chave (começa com `sk-ant-...`)
5. Adicione créditos em **Billing** (sugerido: US$ 5 para começar — cada análise custa ~$0.01)

### 2. Instale o Git (se não tiver)
- https://git-scm.com/downloads

### 3. Suba o código no GitHub
```bash
cd parecerista
git init
git add .
git commit -m "primeiro deploy"
```
- Crie um repositório em https://github.com/new
- Siga as instruções para conectar e fazer push

### 4. Deploy na Vercel
1. Acesse https://vercel.com e faça login com sua conta GitHub
2. Clique em **Add New Project**
3. Selecione o repositório `parecerista`
4. Clique em **Deploy** (as configurações já estão no vercel.json)

### 5. Adicione a chave de API
1. Após o deploy, vá em **Settings → Environment Variables**
2. Adicione:
   - **Name:** `ANTHROPIC_API_KEY`
   - **Value:** `sk-ant-...` (sua chave)
3. Clique em **Save**
4. Vá em **Deployments** → clique nos 3 pontos → **Redeploy**

### 6. Pronto!
A Vercel vai te dar uma URL pública tipo `parecerista.vercel.app` — compartilhe com quem quiser!

---

## Alternativa sem Git (mais simples)

1. Instale a Vercel CLI:
```bash
npm install -g vercel
```

2. Na pasta do projeto:
```bash
vercel
```

3. Siga as instruções no terminal
4. Adicione a variável de ambiente pela CLI ou pelo painel da Vercel

---

## Custos estimados

| Uso | Custo estimado |
|-----|---------------|
| 100 análises/mês | ~US$ 1,00 |
| 500 análises/mês | ~US$ 5,00 |
| 2.000 análises/mês | ~US$ 20,00 |

A Vercel é **gratuita** para projetos pessoais (até 100GB de banda/mês).

---

## Suporte

Se tiver dúvidas, a documentação da Vercel está em https://vercel.com/docs
