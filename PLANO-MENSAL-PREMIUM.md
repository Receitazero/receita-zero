# Plano Mensal — Sites Premium Vitrine Certa (30 dias)

> Última atualização: 22/07/2026
> Status: Claude Code produzindo · Hermes validando em paralelo

## Divisão de trabalho
- **Claude Code** = designer principal (cria `index.html` de cada nicho)
- **Hermes** = paralelo + validador (cria `_paralelo/`, roda `npm test`, corrige bugs)

## Status atual (Dia 0)

| Nicho | Claude (`index.html`) | Hermes (`_paralelo/`) | Status |
|-------|----------------------|----------------------|--------|
| 🍕 Pizzaria | ✅ em andamento | ✅ validado | Escolher vencedor |
| 🐾 Pet | 🔄 em andamento | ⏳ pendente | — |
| 🥖 Padaria | ⏳ pendente | ⏳ pendente | — |
| 🔧 Oficina | ⏳ pendente | ⏳ pendente | — |
| 💇 Salão | ⏳ pendente | ⏳ pendente | — |
| 🦷 Clínica | ⏳ pendente | ⏳ pendente | — |
| 🧺 Lavanderia | ⏳ pendente | ⏳ pendente | — |
| 🏠 Imobiliária | ⏳ pendente | ⏳ pendente | — |

## Cronograma — 4 semanas

### Semana 1 (dias 1–7): FUNDAMENTOS
- [ ] Claude: finalizar pizzaria (5 estados, SVG forno, comanda)
- [ ] Hermes: validar pizzaria Claude vs paralelo → escolher vencedor
- [ ] Claude: iniciar pet shop (conceito "dia na vida do pet")
- [ ] Hermes: criar `pet/_paralelo/` com avatar interativo
- [ ] Definir pipeline de review (checklist Hallmark 58 gates)

### Semana 2 (dias 8–14): PRODUÇÃO EM LOTE
- [ ] Claude: padaria (storytelling vertical)
- [ ] Claude: oficina (dashboard técnico)
- [ ] Hermes: `_paralelo/` para ambos
- [ ] Hermes: `npm test` diário em todos os premiums
- [ ] Landing: seção "compare os planos" com screenshots

### Semana 3 (dias 15–21): SERVIÇOS + IMÓVEIS
- [ ] Claude: salão (agenda visual)
- [ ] Claude: clínica (tour virtual)
- [ ] Claude: lavanderia (simulador)
- [ ] Claude: imobiliária (masonry + mini-mapa)
- [ ] Hermes: `_paralelo/` para os 4 restantes
- [ ] Hermes: auditoria de gates Hallmark em todos

### Semana 4 (dias 22–30): POLIMENTO + LANÇAMENTO
- [ ] Hermes: correções finais de contraste/responsive
- [ ] Hermes: landing com galeria de todos os 8 premiums
- [ ] Claude: refinamentos visuais (micro-interações)
- [ ] Hermes: `npm test` final + relatório de qualidade
- [ ] Preparar material de venda (PDF/WhatsApp)

## Checklist de qualidade (por nicho)
- [ ] `npm test` passa (syntax + playwright)
- [ ] 0 pageerrors, 0 reveals invisíveis
- [ ] Paleta única (não colide com outros nichos)
- [ ] Tipografia distinta (não Fraunces/Anton/Inter)
- [ ] Mecânica premium exclusiva (não só "simule")
- [ ] Motion design específico (não aurora/translateY)
- [ ] Responsivo (mobile first)
- [ ] `prefers-reduced-motion` respeitado

## Métricas de acompanhamento
- **Velocity**: nichos completos por semana (meta: 2/semana)
- **Quality**: % de gates Hallmark passando
- **Bugs**: nº de pageerrors por site (meta: 0)
- **Diff**: Claude vs Hermes (qualidade percebida)

## Comandos essenciais
```bash
npm test                    # valida syntax + playwright
node references/verify-syntax.js   # syntax only
python -m http.server 8736  # servidor local
?h=14|17|21|23              # forçar estado da pizzaria (demo)
```
