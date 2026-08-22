#!/usr/bin/env node
'use strict';

/**
 * Vitrine Certa — Validador do modelo de dados
 * ==================================================
 * Faz parsing do SQL da migration (0001_negocio.sql) e verifica 3 invariantes:
 *
 *   1. Toda tabela tem RLS habilitada (ALTER TABLE ... ENABLE ROW LEVEL SECURITY)
 *   2. Toda FK aponta pra tabela existente (REFERENCES <tabela> — tabela deve existir)
 *   3. Nenhuma tabela de cobrança foi criada (proibia: assinatura/cobranca/pagamento)
 *
 * Zero dependência. Node puro.
 * Uso: node references/valida-modelo.js
 */

const fs = require('fs');
const path = require('path');

const SQL_FILE = path.join(__dirname, '..', 'supabase-vc', 'migrations', '0001_negocio.sql');

// Diretórios proibidos como nome de tabela (fonte de verdade de cobrança → Avança)
const TABELAS_PROIBIDAS_REGEX =
    /\b(assinatura|cobranca|cobranças|cobranca_s|pagamento|pagamentos|fatura|faturas|invoice|invoices|subscription|subscriptions|payment|payments)\b/i;

// Tabelas externas conhecidas (não criadas pelo SQL, mas válidas como FK)
const TABELAS_EXTERNAS_VALIDAS = new Set(['auth.users', 'auth.users(id)']);

let erros   = 0;
let avisos  = 0;

function ok(msg)   { console.log('  ✅ ' + msg); }
function erro(msg) { console.log('  ❌ ' + msg); erros++; }
function aviso(msg) { console.log('  ⚠️  ' + msg); avisos++; }

// ---------------------------------------------------------------------------
// 1. Ler o arquivo SQL
// ---------------------------------------------------------------------------
function lerSQL() {
    if (!fs.existsSync(SQL_FILE)) {
        console.log('ERRO FATAL: arquivo não encontrado: ' + SQL_FILE);
        process.exit(1);
    }
    return fs.readFileSync(SQL_FILE, 'utf8');
}

// ---------------------------------------------------------------------------
// 2. Extrair tabelas criadas (CREATE TABLE)
// ---------------------------------------------------------------------------
function extrairTabelasCriadas(sql) {
    const tabelas = [];
    // Casa: CREATE TABLE [IF NOT EXISTS] public.nome_da_tabela (
    const regex = /CREATE\s+TABLE\s+(?:IF\s+NOT\s+EXISTS\s+)?(?:public\.)?([a-z_]+)\s*\(/gi;
    let m;
    while ((m = regex.exec(sql)) !== null) {
        tabelas.push(m[1].toLowerCase());
    }
    // Casa: CREATE TABLE [IF NOT EXISTS] schema.nome_da_tabela (
    return tabelas;
}

// ---------------------------------------------------------------------------
// 3. Extrair FKs (REFERENCES)
// ---------------------------------------------------------------------------
function extrairForeignKeys(sql) {
    const fks = [];
    // Casa: REFERENCES public.tabela ( ou REFERENCES tabela (
    // Também tabela.coluna (raro)
    const regex = /REFERENCES\s+(?:public\.)?([a-z_]+(?:\.[a-z_]+)?)\s*\(/gi;
    let m;
    while ((m = regex.exec(sql)) !== null) {
        let ref = m[1].toLowerCase();
        fks.push(ref);
    }
    return fks;
}

// ---------------------------------------------------------------------------
// 4. Extrair RLS habilitada (ALTER TABLE ... ENABLE ROW LEVEL SECURITY)
// ---------------------------------------------------------------------------
function extrairRLSHabilitada(sql) {
    const rlsTables = [];
    const regex = /ALTER\s+TABLE\s+(?:IF\s+EXISTS\s+)?(?:public\.)?([a-z_]+)\s+ENABLE\s+ROW\s+LEVEL\s+SECURITY/gi;
    let m;
    while ((m = regex.exec(sql)) !== null) {
        rlsTables.push(m[1].toLowerCase());
    }
    return rlsTables;
}

// ---------------------------------------------------------------------------
// 5. Extrair policies (CREATE POLICY)
// ---------------------------------------------------------------------------
function extrairPolicies(sql) {
    const policies = [];
    const regex = /CREATE\s+POLICY\s+"([a-z_0-9]+)"\s+ON\s+(?:public\.)?([a-z_]+)/gi;
    let m;
    while ((m = regex.exec(sql)) !== null) {
        policies.push({ nome: m[1].toLowerCase(), tabela: m[2].toLowerCase() });
    }
    return policies;
}

// ---------------------------------------------------------------------------
// 6. Verificar se CREATE TABLE menciona palavra proibida (cobrança)
// ---------------------------------------------------------------------------
function verificarTabelasProibidas(sql) {
    console.log('\n[1] Verificando tabelas de cobrança proibidas...');

    const blocoCreateRegex = /CREATE\s+TABLE\s+(?:IF\s+NOT\s+EXISTS\s+)?(?:public\.)?([a-z_]+)\s*\(([^;]*?)\);/gi;
    let m;
    let encontrouProibida = false;
    while ((m = blocoCreateRegex.exec(sql)) !== null) {
        const nomeTabela = m[1].toLowerCase();
        const corpoTabela = m[2];

        // Verifica o NOME da tabela
        if (TABELAS_PROIBIDAS_REGEX.test(nomeTabela)) {
            erro('Tabela "' + nomeTabela + '" tem nome proibido (fonte de verdade de cobrança → Avança)');
            encontrouProibida = true;
        }

        // Verifica se o CORPO menciona colunas de cobrança como fonte de verdade
        // (ex: status_pagamento, valor_cobranca, retry_count)
        const colunasProibidas =
            /\b(status_pagamento|valor_cobranca|retry_count|conciliation|preapproval|mp_subscription|mercadopago_id)\b/i;
        if (colunasProibidas.test(corpoTabela)) {
            erro('Tabela "' + nomeTabela + '" tem colunas de cobrança (fonte de verdade → Avança)');
            encontrouProibida = true;
        }
    }

    if (!encontrouProibida) {
        ok('Nenhuma tabela de cobrança/assinatura/pagamento criada (contrato respeitado)');
    }
}

// ===========================================================================
// MAIN
// ===========================================================================
function main() {
    console.log('══════════════════════════════════════════════════════');
    console.log('  Vitrine Certa — Validador do Modelo de Dados');
    console.log('  Migration: supabase-vc/migrations/0001_negocio.sql');
    console.log('══════════════════════════════════════════════════════');

    const sql = lerSQL();

    const tabelasCriadas    = extrairTabelasCriadas(sql);
    const fks               = extrairForeignKeys(sql);
    const rlsHabilitadas    = extrairRLSHabilitada(sql);
    const policies          = extrairPolicies(sql);

    // --- [1] Tabelas de cobrança proibidas ---
    verificarTabelasProibidas(sql);

    // --- [2] RLS habilitada em toda tabela ---
    console.log('\n[2] Verificando RLS habilitada em todas as tabelas...');
    const createdSet = new Set(tabelasCriadas);
    const rlsSet     = new Set(rlsHabilitadas);

    let rlsOk = true;
    for (const t of tabelasCriadas) {
        if (rlsSet.has(t)) {
            ok('RLS habilitada: ' + t);
        } else {
            erro('RLS NÃO habilitada na tabela: ' + t);
            rlsOk = false;
        }
    }
    if (rlsOk && tabelasCriadas.length > 0) {
        ok('Todas as ' + tabelasCriadas.length + ' tabelas têm RLS habilitada');
    } else if (tabelasCriadas.length === 0) {
        erro('Nenhuma tabela encontrada no SQL');
    }

    // --- [3] FKs apontam para tabela existente ---
    console.log('\n[3] Verificando Foreign Keys...');
    let fkOk = true;
    for (const ref of fks) {
        const tabelaRef = ref.split('.')[0]; // pega só o nome da tabela (sem schema)
        // É auth.users?
        if (ref.startsWith('auth.users')) {
            ok('FK → auth.users (tabela externa válida)');
            continue;
        }
        // É uma tabela criada neste SQL?
        if (createdSet.has(tabelaRef)) {
            ok('FK → ' + ref + ' (tabela criada neste SQL)');
            continue;
        }
        erro('FK → ' + ref + ' aponta para tabela INEXISTENTE no SQL');
        fkOk = false;
    }
    if (fkOk && fks.length > 0) {
        ok('Todas as ' + fks.length + ' FKs apontam para tabelas válidas');
    } else if (fks.length === 0) {
        aviso('Nenhuma FK encontrada (verifique se é esperado)');
    }

    // --- [4] Policies por usuário (auth.uid) ---
    console.log('\n[4] Verificando policies (auth.uid)...');
    let policyOk = true;
    for (const p of policies) {
        // Procura a policy no SQL e verifica se menciona auth.uid()
        const regexPolicy = new RegExp(
            'CREATE\\s+POLICY\\s+"' + p.nome.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') +
            '"[^;]*?auth\\.uid\\(\\)',
            'is'
        );
        if (regexPolicy.test(sql)) {
            ok('Policy "' + p.nome + '" em "' + p.tabela + '" usa auth.uid()');
        } else {
            aviso('Policy "' + p.nome + '" em "' + p.tabela + '" NÃO menciona auth.uid()');
            policyOk = false;
        }
    }
    if (policyOk && policies.length > 0) {
        ok('Todas as ' + policies.length + ' policies usam auth.uid()');
    }

    // --- RESUMO ---
    console.log('\n────────────────────────────────────────────────────');
    console.log('  RESUMO');
    console.log('────────────────────────────────────────────────────');
    console.log('  Tabelas criadas:    ' + tabelasCriadas.length + ' (' + tabelasCriadas.join(', ') + ')');
    console.log('  FKs encontradas:    ' + fks.length);
    console.log('  RLS habilitada:     ' + rlsHabilitadas.length + ' tabelas');
    console.log('  Policies:           ' + policies.length);
    console.log('  Erros:              ' + erros);
    console.log('  Avisos:             ' + avisos);
    console.log('────────────────────────────────────────────────────');

    if (erros > 0) {
        console.log('\n❌ VALIDACAO_FALHOU — ' + erros + ' erro(s) encontrado(s)');
        process.exit(1);
    } else {
        console.log('\n✅ VALIDACAO_OK — todas as invariantes foram satisfeitas');
        process.exit(0);
    }
}

main();
