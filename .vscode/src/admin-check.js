// admin-check.js
// Requer: localStorage.permissao deve existir
(function(){
  const perm = localStorage.getItem('permissao');
  if (perm !== 'admin') {
    // bloqueia acesso e redireciona para home
    try { alert('Acesso restrito: área administrativa'); } catch(e){}
    window.location.href = '/.vscode/src/homeNaoLogado.html';
  }
})();
