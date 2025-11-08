#!/usr/bin/env node
/**
 * Script para corrigir todos os testes E2E
 * Remove adminToken dos construtores AdminAPIHelper e adiciona login()
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const EMAIL = 'admin@leiasabores.pt';
const PASSWORD = 'admin123';

function fixFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;

  // Padrão 1: new AdminAPIHelper(adminApi, URL, adminToken)
  const pattern1 = /new AdminAPIHelper\s*\(\s*adminApi\s*,\s*([^,)]+)\s*,\s*adminToken\s*\)/g;
  if (pattern1.test(content)) {
    content = content.replace(pattern1, (match, url) => {
      modified = true;
      return `new AdminAPIHelper(adminApi, ${url})`;
    });
  }

  // Padrão 2: const apiHelper = new AdminAPIHelper(adminApi, URL, adminToken)
  // Adicionar login após se não existir
  const lines = content.split('\n');
  const newLines = [];
  let i = 0;
  
  while (i < lines.length) {
    const line = lines[i];
    
    // Se encontrar criação de AdminAPIHelper sem login na próxima linha
    if (line.includes('new AdminAPIHelper(adminApi,') && 
        !line.includes('adminToken') && 
        (i + 1 >= lines.length || !lines[i + 1].includes('await apiHelper.login'))) {
      newLines.push(line);
      // Adicionar login na próxima linha
      const indent = line.match(/^(\s*)/)[1];
      newLines.push(`${indent}await apiHelper.login('${EMAIL}', '${PASSWORD}')`);
      modified = true;
    } else {
      newLines.push(line);
    }
    
    i++;
  }
  
  if (modified) {
    fs.writeFileSync(filePath, newLines.join('\n'), 'utf8');
    console.log(`✅ Corrigido: ${filePath}`);
    return true;
  }
  
  return false;
}

// Encontrar todos os arquivos .spec.ts
const testDir = path.join(__dirname);
const files = execSync(`find ${testDir} -name "*.spec.ts" -type f`, { encoding: 'utf8' })
  .trim()
  .split('\n')
  .filter(f => f);

let fixed = 0;
files.forEach(file => {
  if (fixFile(file)) {
    fixed++;
  }
});

console.log(`\n✅ ${fixed} arquivos corrigidos!`);

