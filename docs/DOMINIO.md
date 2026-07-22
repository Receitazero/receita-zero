# Deploy + Domínio Próprio — Vitrine Certa

> Como publicar um site da Vitrine Certa no GitHub Pages e (opcional) no domínio do cliente.

## 1. Deploy no GitHub Pages (padrão)

O repositório já está configurado para GitHub Pages:
- Repo: `Receitazero/receita-zero`
- Branch: `main`
- Pasta: `/` (root)
- URL: `https://receitazero.github.io/receita-zero/`

**Para publicar um novo site:**
1. Editar `site-dfy/<nicho>/index.html`
2. `git add -A && git commit -m "feat: site <nicho>"`
3. `git push`
4. Aguardar ~1min → site no ar

**Estrutura de pastas:**
```
receita-zero/
├── receita-zero/index.html    # landing principal
├── site-dfy/
│   ├── pizzaria/index.html     # simples
│   ├── pizzaria/premium/       # premium
│   └── ... (8 nichos)
```

## 2. Domínio Próprio (.com.br via dominios.com.br)

**Pré-requisitos:**
- Conta no [dominios.com.br](https://dominios.com.br)
- Plano Domínio Próprio ativo (R$199/mês do cliente)

**Passo a passo:**

### 2.1 Registrar domínio
1. Acessar dominios.com.br
2. Buscar `seunegocio.com.br`
3. Registrar (R$40/ano aprox — desconto no 1º ano)
4. Guardar usuário/senha da conta

### 2.2 Configurar DNS (CNAME)
No painel do dominios.com.br:
1. Entrar em **Gerenciar Domínio → DNS**
2. Adicionar registro **CNAME**:
   - Nome: `www`
   - Destino: `receitazero.github.io`
3. Adicionar registro **A** (opcional, para raiz):
   - Nome: `@`
   - Destino: `185.199.108.153` (IP do GitHub Pages)

### 2.3 Configurar GitHub Pages
1. No repo `Receitazero/receita-zero`:
   - Settings → Pages → Custom domain: `www.seunegocio.com.br`
   - Marcar **Enforce HTTPS**
2. Aguardar propagação DNS (~30min–24h)

### 2.4 Criar arquivo CNAME
Na raiz do repo, criar `CNAME` com conteúdo:
```
www.seunegocio.com.br
```
E commitar.

## 3. E-mail profissional (opcional)

Se o cliente quiser `voce@seunegocio.com.br`:
- Usar [Zoho Mail](https://zoho.com/mail/) (free tier 5 contas)
- Ou Google Workspace (pago)

## 4. Checklist de entrega

- [ ] Site no ar no GitHub Pages
- [ ] Domínio registrado (se aplicável)
- [ ] DNS configurado (CNAME + A)
- [ ] GitHub Pages com custom domain
- [ ] HTTPS ativo
- [ ] E-mail profissional (se contratado)
- [ ] Cliente treinado a usar WhatsApp botão

## 5. Renovação

| Item | Quando | Responsável |
|------|--------|-------------|
| Domínio (.com.br) | Anual | Hermes (renova 30d antes) |
| GitHub Pages | Automático | — |
| SSL | Automático | GitHub |

⚠️ **Nunca deixar domínio vencer** — site cai e cliente reclama.
