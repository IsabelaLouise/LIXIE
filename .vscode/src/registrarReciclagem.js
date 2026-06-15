document.addEventListener('DOMContentLoaded', () => {

  // =============================================================
  // ESTADO
  // =============================================================
  let tipoSelecionado = '';
  let cepValido = false;


  // =============================================================
  // MENU MOBILE
  // =============================================================
  const menuToggle = document.getElementById('menuToggle');
  const navbar = document.getElementById('navbar');

  if (menuToggle && navbar) {
    menuToggle.addEventListener('click', () => {
      navbar.classList.toggle('active');
      menuToggle.classList.toggle('active');
    });

    document.querySelectorAll('.nav-link').forEach(link => {
      link.addEventListener('click', () => {
        navbar.classList.remove('active');
        menuToggle.classList.remove('active');
      });
    });

    window.addEventListener('resize', () => {
      if (window.innerWidth > 768) {
        navbar.classList.remove('active');
        menuToggle.classList.remove('active');
      }
    });
  }


  // =============================================================
  // FOTO DO USUÁRIO
  // =============================================================
  const email = localStorage.getItem('email');
  const fotoHome = document.getElementById('fotoHome');

  if (email && fotoHome) {
    fetch('http://localhost:8000/perfil', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: `email=${encodeURIComponent(email)}`
    })
      .then(res => res.json())
      .then(usuario => {
        fotoHome.src = usuario.foto?.trim().startsWith('http')
          ? usuario.foto.trim()
          : 'img/avatar.png';
      })
      .catch(err => console.error('Erro ao carregar foto:', err));
  }

  // Carrega pontos do usuário no card
  if (email) {
    fetch('http://localhost:8000/perfil', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: `email=${encodeURIComponent(email)}`
    })
      .then(res => res.json())
      .then(usuario => {
        const el = document.getElementById('totalPontos');
        if (el && usuario.pontos != null) {
          el.textContent = `${usuario.pontos} pts`;
        }
      })
      .catch(() => {});
  }


  // =============================================================
  // CONSTANTES
  // =============================================================
  const PONTOS_POR_MATERIAL = {
    plastico:   8,
    papel:      3,
    vidro:      6,
    metal:      15,
    organico:   7,
    pilhas:     10,
    eletronico: 20,
    tampinha:   2,
    cartela:    5,
    capsula:    4,
  };

  const KG_MULTIPLIER = { g: 1 / 1000, kg: 1, ton: 1000, un: 1 };


  // =============================================================
  // UTILITÁRIOS
  // =============================================================
  function converterParaKg(valor, unidade) {
    return valor * (KG_MULTIPLIER[unidade] ?? 1);
  }

  function setFeedback(el, classe, html) {
    if (!el) return;
    el.className = classe;
    el.innerHTML = html;
  }

  function limparFeedback(...els) {
    els.forEach(el => { if (el) { el.className = ''; el.innerHTML = ''; } });
  }


  // =============================================================
  // SELEÇÃO DE MATERIAL
  // =============================================================
  const botoesMaterial = document.querySelectorAll('#materiais button');
  const badge = document.getElementById('materialBadge');
  const badgeImg = document.getElementById('badgeImg');
  const badgeNome = document.getElementById('badgeNome');

  botoesMaterial.forEach(btn => {
    btn.addEventListener('click', () => {
      botoesMaterial.forEach(b => b.classList.remove('ativo'));
      btn.classList.add('ativo');
      tipoSelecionado = btn.dataset.tipo;

      // Atualiza badge no formulário
      if (badge && badgeImg && badgeNome) {
        const img = btn.querySelector('img');
        badgeImg.src = img?.src ?? '';
        badgeImg.alt = btn.textContent.trim();
        badgeNome.textContent = `${btn.textContent.trim()} selecionado`;
        badge.style.display = 'flex';
      }
    });
  });


  // =============================================================
  // CAMPO DE QUANTIDADE — Enter avança para CEP
  // =============================================================
  const quantidadeEl = document.getElementById('quantidade');
  const resultadoEl = document.getElementById('resultado');
  const cepEl = document.getElementById('cep');

  quantidadeEl?.addEventListener('keydown', e => {
    if (e.key !== 'Enter') return;
    e.preventDefault();

    const quantidade = parseFloat(quantidadeEl.value);

    if (!tipoSelecionado) {
      setFeedback(resultadoEl, 'erro', '⚠️ Selecione um material primeiro!');
      return;
    }
    if (!quantidade || quantidade <= 0) {
      setFeedback(resultadoEl, 'erro', '⚠️ Digite uma quantidade válida!');
      return;
    }

    limparFeedback(resultadoEl);
    cepEl?.focus();
  });


  // =============================================================
  // CEP — máscara + busca automática
  // =============================================================
  const erroCepEl = document.getElementById('erroCep');

  cepEl?.addEventListener('input', async e => {
    let valor = e.target.value.replace(/\D/g, '').slice(0, 8);
    if (valor.length > 5) valor = valor.slice(0, 5) + '-' + valor.slice(5);
    e.target.value = valor;

    cepValido = false;
    limparFeedback(erroCepEl);

    if (valor.replace(/\D/g, '').length < 8) return;

    try {
      const res = await fetch(`https://viacep.com.br/ws/${valor.replace(/\D/g, '')}/json/`);
      const data = await res.json();

      if (data.erro) {
        setFeedback(erroCepEl, 'erro', '❌ CEP não encontrado!');
        return;
      }

      e.target.value = `${data.logradouro} - ${data.localidade}, ${data.uf}`;
      cepValido = true;

    } catch {
      setFeedback(erroCepEl, 'erro', '❌ Erro ao buscar CEP. Tente novamente.');
    }
  });


  // =============================================================
  // UPLOAD — mostra nome do arquivo
  // =============================================================
  document.getElementById('foto')?.addEventListener('change', function () {
    const uploadNome = document.getElementById('uploadNome');
    if (uploadNome) {
      uploadNome.textContent = this.files[0]?.name ?? 'Nenhum arquivo escolhido';
    }
  });


  // =============================================================
  // SUBMIT
  // =============================================================
  document.getElementById('formReciclagem')?.addEventListener('submit', async e => {
    e.preventDefault();

    const quantidade = parseFloat(quantidadeEl?.value);
    const unidade = document.getElementById('unidade')?.value;

    limparFeedback(resultadoEl, erroCepEl);

    // Validações
    if (!tipoSelecionado) {
      setFeedback(resultadoEl, 'erro', '⚠️ Selecione um material!');
      return;
    }
    if (!quantidade || quantidade <= 0) {
      setFeedback(resultadoEl, 'erro', '⚠️ Digite uma quantidade válida!');
      return;
    }
    if (!cepValido) {
      setFeedback(erroCepEl, 'erro', '⚠️ Finalize o CEP antes de registrar.');
      return;
    }

    // Cálculo de pontos
    const quantidadeKg = converterParaKg(quantidade, unidade);
    const pontos = Math.round(quantidadeKg * (PONTOS_POR_MATERIAL[tipoSelecionado] ?? 0));

    // Envia para o backend
    try {
      const res = await fetch('http://localhost:8000/registrar-reciclagem', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          tipo: tipoSelecionado,
          quantidade,
          unidade,
          pontos,
          cep: cepEl?.value,
        }),
      });
      const data = await res.json();
      console.log('Salvo no backend:', data);

      // Atualiza card de pontos com valor real do backend
      const el = document.getElementById('totalPontos');
      if (el && data.pontos_totais != null) {
        el.textContent = `${data.pontos_totais} pts`;
      }

    } catch (err) {
      console.error('Erro ao salvar:', err);
    }

    // Mensagem de sucesso
    let mensagem = `✅ Registrado com sucesso!<br>
      ♻️ Material: ${tipoSelecionado}<br>
      ⚖️ Quantidade: ${quantidade} ${unidade}`;

    if (unidade !== 'un') {
      mensagem += `<br>📦 Equivalente: ${quantidadeKg.toFixed(2)} kg`;
    }
    mensagem += `<br>⭐ Pontos ganhos: ${pontos}`;

    setFeedback(resultadoEl, 'sucesso', mensagem);
    resultadoEl.style.display = 'block';

    // Reset do formulário
    quantidadeEl.value = '';
    if (cepEl) cepEl.value = '';
    document.getElementById('foto').value = '';
    const uploadNome = document.getElementById('uploadNome');
    if (uploadNome) uploadNome.textContent = 'JPG, PNG ou HEIC · máx. 10MB';
    limparFeedback(erroCepEl);
    cepValido = false;
    tipoSelecionado = '';
    botoesMaterial.forEach(b => b.classList.remove('ativo'));
    if (badge) badge.style.display = 'none';
  });

});