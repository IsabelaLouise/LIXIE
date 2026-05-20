const email = localStorage.getItem("email");

// ✅ FOTO DO USUÁRIO
fetch("http://localhost:8000/perfil", {
  method: "POST",
  headers: {
    "Content-Type": "application/x-www-form-urlencoded"
  },
  body: `email=${encodeURIComponent(email)}`
})
.then(res => res.json())
.then(usuario => {
  const fotoHome = document.getElementById("fotoHome");
  if (usuario.foto && usuario.foto.trim().startsWith("http")) {
    fotoHome.src = usuario.foto.trim();
  } else {
    fotoHome.src = "img/avatar.png";
  }
})
.catch(err => console.error("Erro ao carregar foto:", err));
  

// MAPA

const map = L.map('map').setView([-25.4284, -49.2733], 12);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '&copy; OpenStreetMap'
}).addTo(map);

// PONTOS


const pontos = [

  {
    nome:"Ecoponto Centro",
    tipo:"plastico",
    bairro:"Centro",
    lat:-25.4284,
    lng:-49.2733
  },

  {
    nome:"Coleta Boqueirão",
    tipo:"vidro",
    bairro:"Boqueirão",
    lat:-25.486836, 
    lng:-49.235297
  },

  {
    nome:"Ponto Sustentável",
    tipo:"metal",
    bairro:"Água Verde",
    lat:-25.458238,
    lng:-49.277576
  },

  {
    nome:"Eco Verde",
    tipo:"papel",
    bairro:"Santa Felicidade",
    lat:-25.411096, 
    lng:-49.323046
  },

  {
    nome:"Ponto de Coleta Portão",
    tipo:"eletronico",
    bairro:"Portão",
    lat:-25.473779,  
    lng:-49.291437
  },

  {
    nome:"Ponto de Coleta Batel",
    tipo:"organico",
    bairro:"Batel",
    lat:-25.44,
    lng:-49.29
  }, 

  {
    nome:"Coleta Sustentável",
    tipo:"pilhas",
    bairro:"Rebouças",
    lat:-25.444582, 
    lng:-49.267097
  },

  {
    nome:"Ecoponto Boqueirão",
    tipo:"tampinha",
    bairro:"Boqueirão",
    lat:-25.504399, 
    lng:-49.231274
  },

  {
    nome:"Ponto Verde",
    tipo:"cartela",
    bairro:"Santa Felicidade",
    lat:-25.399802,
    lng:-49.333139
  },

  {
    nome:"Recicla Fácil",
    tipo:"capsula",
    bairro:"Portão",
    lat:-25.477240,
    lng:-49.293439
  }



];

// MARCADORES


let markers = [];


// MOSTRAR PONTOS


function mostrarPontos(lista){

  // remover marcadores antigos

  markers.forEach(marker => {
    map.removeLayer(marker);
  });

  markers = [];

  // adicionar novos

  lista.forEach(ponto => {

    const marker = L.marker([ponto.lat, ponto.lng])
      .addTo(map)
      .bindPopup(`
        <b>${ponto.nome}</b><br>
        Material: ${ponto.tipo}<br>
        Bairro: ${ponto.bairro}
      `);

    markers.push(marker);

  });

  // atualizar contador

  document.querySelector(".info-text h3").innerText =
    `${lista.length} pontos de coleta encontrados`;

}

// mostrar tudo no início

mostrarPontos(pontos);

// FILTRO MATERIAL


const botoesMaterial =
  document.querySelectorAll(".material-btn");

let materialSelecionado = "Todos";

botoesMaterial.forEach(botao => {

  botao.addEventListener("click", () => {

    materialSelecionado =
      botao.dataset.tipo;

    aplicarFiltros();

  });

});

// FILTRO BAIRRO


const bairroSelect =
  document.getElementById("bairroSelect");

bairroSelect.addEventListener("change", () => {

  aplicarFiltros();

});

// FUNÇÃO FILTRAR


function aplicarFiltros(){

  const bairroSelecionado =
    bairroSelect.value;

  let filtrados = pontos;

  // filtrar material

  if(materialSelecionado !== "Todos"){

    filtrados = filtrados.filter(p =>
      p.tipo === materialSelecionado
    );

  }

  // filtrar bairro

  if(bairroSelecionado !== "Todos os bairros"){

    filtrados = filtrados.filter(p =>
      p.bairro === bairroSelecionado
    );

  }

  mostrarPontos(filtrados);

}

// LIMPAR FILTROS


document.querySelector(".clear-btn")
.addEventListener("click", () => {

  materialSelecionado = "Todos";

  bairroSelect.value = "Todos os bairros";

  mostrarPontos(pontos);

});