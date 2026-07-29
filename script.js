// --- LISTA INICIAL DE JOGOS (DADOS DE EXEMPLO) ---
const initialGames = [
  {
    title: "Cyberpunk Quest",
    price: "129.90",
    imageUrl: "https://via.placeholder.com/300x180/8257e5/ffffff?text=Cyberpunk+PNG"
  },
  {
    title: "Fantasy RPG",
    price: "89.90",
    imageUrl: "https://via.placeholder.com/300x180/04d361/ffffff?text=Fantasy+RPG+PNG"
  },
  {
    title: "Space Odyssey",
    price: "59.90",
    imageUrl: "https://via.placeholder.com/300x180/e16e0e/ffffff?text=Space+Odyssey+PNG"
  }
];

const gamesGrid = document.getElementById('gamesGrid');
const gameForm = document.getElementById('gameForm');

// Função para renderizar um card de jogo na tela
function createGameCard(game) {
  const card = document.createElement('div');
  card.className = 'game-card';

  card.innerHTML = `
    <img src="${game.imageUrl}" alt="Capa de ${game.title}" onerror="this.src='https://via.placeholder.com/300x180/29292e/ffffff?text=Imagem+Indisponivel'">
    <div class="game-info">
      <div>
        <h3 class="game-title">${game.title}</h3>
        <p class="game-price">R$ ${parseFloat(game.price).toFixed(2).replace('.', ',')}</p>
      </div>
      <button class="btn-buy" onclick="alert('Item adicionado ao carrinho!')">Comprar Agora</button>
    </div>
  `;

  gamesGrid.appendChild(card);
}

// Carrega os jogos iniciais ao abrir a página
initialGames.forEach(createGameCard);

// --- LÓGICA PARA ADICIONAR NOVO JOGO VIA FORMULÁRIO ---
gameForm.addEventListener('submit', function(e) {
  e.preventDefault(); // Impede o recarregamento da página

  // Pega os valores digitados nos inputs
  const newGame = {
    title: document.getElementById('title').value,
    price: document.getElementById('price').value,
    imageUrl: document.getElementById('imageUrl').value
  };

  // Cria o card do novo jogo na loja
  createGameCard(newGame);

  // Limpa os campos do formulário
  gameForm.reset();
});