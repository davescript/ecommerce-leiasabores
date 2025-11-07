// Script para forçar atualização do cache na rota /admin
// Este script é injetado no index.html apenas quando acessa /admin

(function() {
  'use strict';
  
  // Verificar se estamos na rota admin
  if (window.location.pathname.startsWith('/admin')) {
    console.log('🔧 [Cache Buster] Detectado acesso a /admin - limpando cache...');
    
    // 1. Desregistrar todos os service workers
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistrations().then(function(registrations) {
        registrations.forEach(function(registration) {
          console.log('🔧 [Cache Buster] Desregistrando SW:', registration.scope);
          registration.unregister().catch(function(err) {
            console.error('Erro ao desregistrar SW:', err);
          });
        });
      });
    }
    
    // 2. Limpar todos os caches
    if ('caches' in window) {
      caches.keys().then(function(cacheNames) {
        cacheNames.forEach(function(cacheName) {
          console.log('🔧 [Cache Buster] Deletando cache:', cacheName);
          caches.delete(cacheName).catch(function(err) {
            console.error('Erro ao deletar cache:', err);
          });
        });
      });
    }
    
    // 3. Limpar localStorage (apenas se necessário)
    // localStorage.removeItem('admin_token'); // Não remover token, apenas cache
    
    // 4. Forçar reload após 500ms se ainda estiver na página antiga
    setTimeout(function() {
      // Verificar se o AdminLayout foi renderizado (procura por classe específica)
      var hasAdminLayout = document.querySelector('.min-h-screen.bg-gray-50') !== null;
      var hasOldHeader = document.querySelector('header') !== null && document.querySelector('header').textContent.includes('Leia Sabores');
      
      if (!hasAdminLayout && hasOldHeader) {
        console.log('🔧 [Cache Buster] Página antiga detectada - forçando reload...');
        window.location.reload(true);
      }
    }, 1000);
  }
})();

