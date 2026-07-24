# Automação de Cardápio & Atualização — Vitrine Certa (Mês 2 / Semana 5)

> Scripts Hermes-on-demand que **reusam a estratégia do `gera-site.js`**. NÃO são
> "novos empregados" — são ferramentas de entrega/manutenção. GATE 2=C (cardápio híbrido):
> cardápio inicial entra na geração/onboarding; edições pontuais são cobradas R$29/un.

## 1. Injeção de cardápio via brief — `references/injeta-cardapio.js`

Substitui os cards dentro de `<section id="cardapio">` de um site de cliente **já
scaffoldado** pelos itens de um brief JSON, preservando o markup rico do template
(imagem + descrição + preço + tamanho). Backup `.bak` automático.

```bash
# 1) gera o site do cliente a partir do template do nicho
node references/gera-site.js references/_fixtures/cliente-forno-dourado.json
# 2) injeta o cardápio real do cliente
node references/injeta-cardapio.js references/_fixtures/cardapio-forno-dourado.json
```

**Brief (`cardapio.json`):**
```json
{
  "site": "site-dfy/pizzaria/cliente-forno-dourado/index.html",
  "itens": [
    { "nome": "Marguerita da Casa", "desc": "...", "preco": "42", "tam": "media - 30cm", "img": "assets/p1.jpg" }
  ]
}
```

**Teste real (23/jul):** Forno Dourado (pizzaria) — 4 cards do template substituídos por
4 do brief (preços 42/49/51/58). `SYNTAX_ALL_OK` (54 HTML/74 scripts/0). **Template
original `site-dfy/pizzaria/index.html` intocado** (Margherita/Pepperoni/… preservados).

## 2. Atualização pontual (R$29/un) — `references/atualiza-site.js`

Edição **cirúrgica** num site de cliente já publicado, sem regerar (preserva fotos,
layout e demais cards). Cobre os casos reais de manutenção cobrados avulso:

| Campo do brief | O que faz |
|----------------|-----------|
| `whatsapp` | remarca todos os `wa.me/<n>` |
| `cores.primary` / `cores.accent` | override `:root` (rebrand de cor) |
| `cardapio[]` (match por `nome` no `<h4>`) | troca `preco`, `desc`, `tam` de item(ns) específico(s) |
| `rebanner.nome` / `.cidade` | troca `title` + `h1` + banner |

```bash
node references/atualiza-site.js references/_fixtures/edicao-forno-dourado.json
```

**Brief (`edicao.json`):**
```json
{
  "site": "site-dfy/pizzaria/cliente-forno-dourado/index.html",
  "whatsapp": "5513988887777",
  "cardapio": [
    { "nome": "Marguerita da Casa", "preco": "45", "desc": "receita nova ..." },
    { "nome": "Doce de Nutella", "preco": "62" }
  ]
}
```

**Teste real (23/jul):** Marguerita 42→45, Nutella 58→62 (Portuguesa/Frango 49/51
**intactos**), WhatsApp remarcado nos 3 links, desc atualizada. `SYNTAX_ALL_OK`.

## 3. Rollback

Ambos os scripts gravam `index.html.bak` antes de escrever. Para reverter:
```bash
cp site-dfy/<nicho>/cliente-<slug>/index.html.bak site-dfy/<nicho>/cliente-<slug>/index.html
```

## 4. Precificação (canônica em `vitrine-certa-precificacao`)

- **Cardápio inicial** → embutido na geração (parte do Essencial/Plus/Premium).
- **Atualização pontual** → R$29/un (avulsa) OU inclusa no pacote Full.
- **Pacote Light** (R$99) / **Full** (R$199) → ver `docs/COBRANCA-MP.md`.

## 5. HITL (GATE 6=A — LGPD herdada do ATLAS)

IA edita conteúdo do cliente, mas **só publica após aprovação humana**. O fluxo é:
brief → script gera/edita → prévia local (`python -m http.server 8736`) → cliente
aprova → publish. Zero PII em fixtures (dados fictícios).

## 6. Fixtures de teste

`references/_fixtures/` (gitignored) guarda os briefs de exemplo com dados **fictícios**:
`cliente-forno-dourado.json`, `cardapio-forno-dourado.json`, `edicao-forno-dourado.json`.

> **Nota de infra:** `docs/` e `references/` estão no `.gitignore` — commit forçado com
> `-f`, não sobem pro GitHub Pages. Sites de cliente (`site-dfy/<nicho>/cliente-*`) NÃO
> são ignorados; durante os testes um agente sibling limpou `site-dfy/**/cliente-*`
> untracked, então regenere antes de usar.
