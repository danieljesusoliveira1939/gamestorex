// --- ESTADO DA APLICAÇÃO ---
let games = JSON.parse(localStorage.getItem('gx_games')) || [
  { id: 1, title: 'Cyberpunk Quest', category: 'RPG', price: 129.90, image: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=500', description: 'Explore uma cidade futurista recheada de ação e tecnologia.' },
  { id: 2, title: 'Space Strategy X', category: 'Estratégia', price: 79.90, image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=500', description: 'Domine a galáxia construindo frotas e conquistando planetas.' },
  { id: 3, title: 'Warrior Legends', category: 'Ação', price: 49.90, image: 'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?w=500', description: 'Batalhas épicas em um mundo medieval sombrio.' }
];

let cart = JSON.parse(localStorage.getItem('gx_cart')) || [];
let myLibrary = JSON.parse(localStorage.getItem('gx_library')) || [];
let currentUser = JSON.parse(localStorage.getItem('gx_user')) || null;

// --- INICIALIZAÇÃO ---
document.addEventListener('DOMContentLoaded', () => {
  renderGames(games);
  updateCartUI();
  updateAuthUI();
});

// --- NAVEGAÇÃO ENTRE PÁGINAS ---
function showPage(pageId) {
  document.querySelectorAll('.page').forEach(page => page.classList.remove('active-page'));
  const targetPage = document.getElementById(pageId);
  if (targetPage) targetPage.classList.add('active-page');

  if (pageId === 'libraryPage') renderLibrary();
}

function switchAuthTab(tab) {
  document.getElementById('loginForm').classList.toggle('active-form', tab === 'login');
  document.getElementById('registerForm').classList.toggle('active-form', tab === 'register');
  document.getElementById('loginTabBtn').classList.toggle('active', tab === 'login');
  document.getElementById('registerTabBtn').classList.toggle('active', tab === 'register');
}

// --- RENDEREZAÇÃO DA VITRINE E FILTROS ---
function renderGames(gamesList) {
  const grid = document.getElementById('gamesGrid');
  grid.innerHTML = '';

  if (gamesList.length === 0) {
    grid.innerHTML = '<p>Nenhum jogo encontrado.</p>';
    return;
  }

  gamesList.forEach(game => {
    const card = document.createElement('div');
    card.className = 'game-card';
    card.innerHTML = `
      <img src="${game.image}" alt="${game.title}" onclick="openGameDetail(${game.id})">
      <div class="game-info">
        <h3>${game.title}</h3>
        <span class="badge">${game.category}</span>
        <p class="price">R$ ${game.price.toFixed(2)}</p>
        <button class="btn-primary" onclick="addToCart(${game.id})">Adicionar ao Carrinho</button>
      </div>
    `;
    grid.appendChild(card);
  });
}

function filterGames() {
  const search = document.getElementById('searchInput').value.toLowerCase();
  const category = document.getElementById('categoryFilter').value;
  const sort = document.getElementById('sortFilter').value;

  let filtered = games.filter(g => {
    const matchesSearch = g.title.toLowerCase().includes(search);
    const matchesCategory = category === 'all' || g.category === category;
    return matchesSearch && matchesCategory;
  });

  if (sort === 'lowPrice') filtered.sort((a, b) => a.price - b.price);
  if (sort === 'highPrice') filtered.sort((a, b) => b.price - a.price);
  if (sort === 'name') filtered.sort((a, b) => a.title.localeCompare(b.title));

  renderGames(filtered);
}

// --- CARRINHO DE COMPRAS ---
function addToCart(gameId) {
  const game = games.find(g => g.id === gameId);
  if (game && !cart.some(item => item.id === gameId)) {
    cart.push(game);
    saveCart();
    updateCartUI();
    alert(`"${game.title}" foi adicionado ao seu carrinho!`);
  } else {
    alert('Este jogo já está no seu carrinho.');
  }
}

function removeFromCart(gameId) {
  cart = cart.filter(item => item.id !== gameId);
  saveCart();
  updateCartUI();
}

function updateCartUI() {
  document.getElementById('cartCount').innerText = cart.length;
  const cartList = document.getElementById('cartItemsList');
  cartList.innerHTML = '';

  let total = 0;
  cart.forEach(item => {
    total += item.price;
    cartList.innerHTML += `
      <div class="cart-item">
        <span>${item.title} - R$ ${item.price.toFixed(2)}</span>
        <button class="btn-remove" onclick="removeFromCart(${item.id})">Remover</button>
      </div>
    `;
  });

  document.getElementById('cartTotal').innerText = total.toFixed(2);
}

function checkoutCart() {
  if (cart.length === 0) return alert('Seu carrinho está vazio.');
  if (!currentUser) {
    closeModal('cartModal');
    showPage('authPage');
    return alert('Faça login para concluir a compra.');
  }

  myLibrary.push(...cart);
  localStorage.setItem('gx_library', JSON.stringify(myLibrary));
  cart = [];
  saveCart();
  updateCartUI();
  closeModal('cartModal');
  alert('Compra realizada com sucesso! Os jogos estão disponíveis na sua Biblioteca.');
  showPage('libraryPage');
}

function saveCart() {
  localStorage.setItem('gx_cart', JSON.stringify(cart));
}

// --- BIBLIOTECA DE JOGOS ---
function renderLibrary() {
  const grid = document.getElementById('libraryGrid');
  grid.innerHTML = '';

  if (myLibrary.length === 0) {
    grid.innerHTML = '<p>Você ainda não possui nenhum jogo na biblioteca.</p>';
    return;
  }

  myLibrary.forEach(game => {
    grid.innerHTML += `
      <div class="game-card">
        <img src="${game.image}" alt="${game.title}">
        <div class="game-info">
          <h3>${game.title}</h3>
          <button class="btn-secondary" onclick="alert('Iniciando o download de ${game.title}...')">Baixar / Jogar</button>
        </div>
      </div>
    `;
  });
}

// --- MODAIS E DETALHES DO JOGO ---
function openGameDetail(gameId) {
  const game = games.find(g => g.id === gameId);
  if (!game) return;

  const content = document.getElementById('gameDetailContent');
  content.innerHTML = `
    <h2>${game.title}</h2>
    <img src="${game.image}" style="width:100%; border-radius:8px; margin: 10px 0;">
    <p><strong>Categoria:</strong> ${game.category}</p>
    <p>${game.description}</p>
    <h3>R$ ${game.price.toFixed(2)}</h3>
    <button class="btn-primary" onclick="addToCart(${game.id}); closeModal('gameDetailModal');">Adicionar ao Carrinho</button>
  `;
  openModal('gameDetailModal');
}

function openModal(id) { document.getElementById(id).style.display = 'block'; }
function closeModal(id) { document.getElementById(id).style.display = 'none'; }

// --- CADASTRO DE NOVOS JOGOS ---
function handleCreateGame(e) {
  e.preventDefault();
  const newGame = {
    id: Date.now(),
    title: document.getElementById('title').value,
    category: document.getElementById('category').value,
    price: parseFloat(document.getElementById('price').value),
    image: document.getElementById('imageUrl').value,
    description: document.getElementById('description').value
  };

  games.push(newGame);
  localStorage.setItem('gx_games', JSON.stringify(games));
  renderGames(games);
  showPage('storePage');
  e.target.reset();
  alert('Jogo publicado na loja com sucesso!');
}

// --- AUTENTICAÇÃO E TRATAMENTO GOOGLE ---
function handleLogin(e) {
  const email = document.getElementById('loginEmail').value;
  currentUser = { email: email, name: email.split('@')[0] };
  localStorage.setItem('gx_user', JSON.stringify(currentUser));
  updateAuthUI();
}

function handleRegister(e) {
  e.preventDefault();
  const name = document.getElementById('regName').value;
  const email = document.getElementById('regEmail').value;
  currentUser = { name, email };
  localStorage.setItem('gx_user', JSON.stringify(currentUser));
  updateAuthUI();
  showPage('storePage');
  alert('Conta criada com sucesso!');
}

function handleGoogleLogin() {
  const isCaptiveView = /wv|FBAN|FBAV|Instagram|MicroMessenger/i.test(navigator.userAgent);
  if (isCaptiveView) {
    alert("O Google não permite login direto na janela do Wi-Fi.\n\nPor favor, utilize o cadastro por e-mail ou abra o site no Chrome/Safari.");
  } else {
    alert("Redirecionando para autenticação do Google...");
  }
}

function updateAuthUI() {
  const authArea = document.getElementById('authArea');
  if (currentUser) {
    authArea.innerHTML = `
      <span>Olá, <strong>${currentUser.name}</strong></span>
      <button class="btn-secondary" onclick="logout()">Sair</button>
    `;
  } else {
    authArea.innerHTML = `<button class="btn-secondary" onclick="showPage('authPage')">Entrar / Registrar</button>`;
  }
}

function logout() {
  localStorage.removeItem('gx_user');
  currentUser = null;
  updateAuthUI();
  showPage('storePage');
}