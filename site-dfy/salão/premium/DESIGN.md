# DESIGN.md — Salão Premium · "O QUE SOBROU DE HOJE"

Fonte de verdade de tokens. Nenhum hex solto fora do `:root` (Hallmark gate 48).
Braço Vitrine Certa / Receita-Zero — **isolado da AAPSON**.

```
/* Hallmark · macrostructure: 19 Map/Diagram · Vitrine Certa / Salão Premium
   governado por=duração do serviço · cor=tom de tintura, sem cor de marca
   display=Gloock · dados=DM Sans tabular
   pre-emit critique: P5 H4 E5 S4 R4 V5 */
```

## Por que este arquivo existe

O premium anterior (`_v1-agenda-neon.html`) usava `--bg:#0B0710` e `--a2:#B15BFF`.
São o fundo e o violeta da **AAPSON** (`#0B0714` / `#A78BFA`). O braço Vitrine Certa
é isolado por regra — isso não era gosto, era a regra sendo violada no arquivo
entregue. O redesign começa por aí.

## Princípio de cor — "a cor da página é a cor do cabelo"

**Este salão não tem cor de marca.** O acento é um **tom de tintura**, escolhido
pelo serviço: coloração → acaju, luzes → mel, platinado → o cinza frio. Corte e
escova não mexem em cor, então ficam na tinta neutra.

Nenhum dos outros 7 nichos pode fazer isto — só o salão vende cor. E não se copia
de um print, porque é sistema, não swatch.

**Rosa está proibido**, apesar de ser o default do nicho: (a) o simples já é rosa
(`#D84A7A`) e premium = simples escurecido é o defeito nº 2 da skill; (b) os salões
premiados recusam rosa — o Marco Ambrosi (Awwwards HM) é preto + um coral só.

## Tokens — base

| Token | Hex | Uso | Contraste sobre `--papel` |
|---|---|---|---|
| `--papel` | `#F3EBE7` | Fundo. Argila clara rosada **dessaturada** — não é creme amarelo (pizzaria/padaria) | — |
| `--papel2` | `#E7DAD4` | Superfície, cabeçalho de tabela, hachura de ocupado | — |
| `--linha` | `#D3C1B9` | Grade de 1px e meia-hora da pista | — |
| `--tinta` | `#241A16` | Texto, blocos escuros, tom padrão | 14,46:1 ✔ |
| `--fumo` | `#6B564E` | Texto secundário | 5,82:1 ✔ |
| `--claro` | `#FAF6F4` | Texto sobre `--tinta` | 15,84:1 sobre tinta ✔ |

## Tokens — tons de tintura (a única cor da página)

Medidos em RGB resolvido, **sobre `--papel`**, que é onde eles pousam.
Os dois últimos **não passavam no tom "real"** e foram escurecidos até passar —
mesma lição da oficina: o tom bonito no Pantone reprova no pixel.

| Token | Hex | Serviço | Sobre `--papel` |
|---|---|---|---|
| `--acaju` | `#8C2F39` | coloração de raiz | 6,92:1 ✔ |
| `--mel` | `#8A5C24` | luzes / mechas | 4,91:1 ✔ (do `#A9743A`, que dava 3,40 ✘) |
| `--platina` | `#5C6673` | loiro platinado | 4,95:1 ✔ (do `#7C8794`, que dava 3,10 ✘) |
| `--tinta` | `#241A16` | corte e escova (não mexem em cor) | 14,46:1 ✔ |

Teto: um tom ativo por vez, ≤ 6% da tela. Fora do sistema: `#25D366` (verde do
WhatsApp — cor de plataforma, não de marca).

## Tipografia

| Papel | Fonte | Onde |
|---|---|---|
| O salão fala | **Gloock** (serifa display de alto contraste) | h1, h2, nomes das profissionais |
| A agenda informa | **DM Sans** (grotesk, `tabular-nums`) | hora, duração, preço, rótulo de pista |

**Regra semântica:** *serifa = escolha e gente · grotesk tabular = tempo e dinheiro.*
Nunca as duas na mesma frase.

É o mesmo **princípio** da pizzaria (voz × máquina), com faces diferentes — declarado
aqui de propósito, porque o princípio está certo. O que não pode repetir é a cara.

Proibidas: Fraunces e a paleta Acid Circuit (AAPSON) · Instrument (pizzaria) ·
Archivo e IBM Plex Mono (oficina) · Anton e Inter (queimadas) · **Playfair e Bodoni**
— são o default de revista de beleza, e cair nelas seria o mesmo erro do rosa.

## Espaçamento / forma

- Escala: 4 · 8 · 12 · 16 · 24 · 40 · 64 · 104
- Raio 3px nos blocos da faixa (etiqueta de agenda), 999px só nos chips e no `.wa-btn`.
  A oficina é raio 0 — aqui a quina é levemente quebrada de propósito, para as duas
  páginas não se lerem como a mesma folha.
- Ocupado = **hachura**, não bloco chapado: lê como "não é para você" sem gastar cor.
- Pista com risco a cada meia hora — a grade do tempo é a grade da página.

## Movimento — governado pela duração, não pelo scroll

Pizzaria: motor = hora. Oficina: motor = consulta. Aqui: **motor = a duração escolhida**.

Uma animação só na página inteira: a **barra-fantasma** (`@keyframes pousa`, 450ms),
do tamanho exato do serviço, pousando onde ele caberia.
Frase de negócio: *"é o seu serviço procurando onde cabe."*
`prefers-reduced-motion` → tudo vira troca instantânea; os encaixes continuam corretos.

## Decisões de honestidade (é o produto, não o enfeite)

- **Nome de cliente não aparece** nos blocos ocupados — só o tipo de serviço.
  Nome na vitrine do salão é vazamento, não prova social.
- **"livre · Xh" conta o que ainda dá para usar**, não o tamanho do vão no papel:
  às 14:30 um buraco de 14h–16h é 1h30, não 2h. Vão que já passou não recebe rótulo.
- **A contagem da barra diz exatamente o que conta** — "3 de 5 serviços ainda cabem
  hoje". Dizer "3 encaixes livres" seria contar outra coisa e mentir de leve.
- **Quando nada cabe, o site diz isso** e oferece amanhã, com o motivo escrito.
- Salão fechado e "não cabe hoje" são motivos diferentes e têm **frases diferentes**.

## Fora do sistema (exceções conscientes)

- `#25D366` — verde WhatsApp no `.wa-btn`.
