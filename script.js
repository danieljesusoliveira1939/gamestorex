const API_URL = 'http://localhost:3000/api';

// Estado local inicializado com Shattered Pixel Dungeon
let games = JSON.parse(localStorage.getItem('gx_games')) || [
  {
    id: 100,
    title: 'Shattered Pixel Dungeon',
    category: 'RPG',
    price: 0.00,
    image: 'https://raw.githubusercontent.com/00-Evan/shattered-pixel-dungeon/master/android/res/drawable-nodpi/banner.png',
    description: 'Um RPG roguelike tradicional de masmorras incrivelmente divertido e completo para jogar diretamente no navegador!',
    game_url: 'https://pux0r3.github.io/shattered-pixel-dungeonweb/'
  }
];

let cart = JSON.parse(localStorage.getItem('gx_cart')) || [];
let myLibrary = JSON.parse(localStorage.getItem('gx_library')) || [];
let currentUser = JSON.parse(localStorage.getItem('gx_user')) || null;

document.addEventListener('DOMContentLoaded', () => {
  fetchGamesFromBackend();
  renderGames(games);
  updateCartUI();
  updateAuthUI();
});

// Buscar do Servidor / Banco de Dados
async function fetchGamesFromBackend() {
  try {
    const res = await fetch(`${API_URL}/games`);
    if (res.ok) {
      const dbGames = await res.json();
      if (dbGames.length > 0) {
        games = dbGames;
        renderGames(games);
      }
    }
  } catch (err) {
    console.log("Servidor local não respondendo, carregando banco local...");
  }
}

// Navegação
function showPage(pageId) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active-page'));
  document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
  
  const page = document.getElementById(pageId);
  if (page) page.classList.add('active-page');

  if (pageId === 'libraryPage') renderLibrary();
}

function switchAuthTab(tab) {
  document.getElementById('loginForm').classList.toggle('active-form', tab === 'login');
  document.getElementById('registerForm').classList.toggle('active-form', tab === 'register');
  document.getElementById('loginTabBtn').classList.toggle('active', tab === 'login');
  document.getElementById('registerTabBtn').classList.toggle('active', tab === 'register');
}

// Vitrine
function renderGames(list) {
  const grid = document.getElementById('gamesGrid');
  grid.innerHTML = '';

  list.forEach(game => {
    const isFree = game.price === 0;
    grid.innerHTML += `
      <div class="game-card">
        <img src="${game.image}" alt="${game.title}" onclick="openGameDetail(${game.id})">
        <div class="game-info">
          <span class="badge ${isFree ? 'free' : ''}">${game.category}</span>
          <h3>${game.title}</h3>
          <p class="price">${isFree ? 'GRÁTIS' : 'R$ ' + game.price.toFixed(2)}</p>
          <button class="btn-primary" onclick="addToCart(${game.id})">${isFree ? 'Resgatar Grátis' : 'Adicionar ao Carrinho'}</button>
        </div>
      </div>
    `;
  });
}

function filterGames() {
  const search = document.getElementById('searchInput').value.toLowerCase();
  const category = document.getElementById('categoryFilter').value;
  const sort = document.getElementById('sortFilter').value;

  let filtered = games.filter(g => {
    return g.title.toLowerCase().includes(search) && (category === 'all' || g.category === category);
  });

  if (sort === 'lowPrice') filtered.sort((a,b) => a.price - b.price);
  if (sort === 'highPrice') filtered.sort((a,b) => b.price - a.price);

  renderGames(filtered);
}

// Carrinho
function addToCart(gameId) {
  const game = games.find(g => g.id === gameId);
  if (!game) return;

  // Se o jogo for grátis, adiciona direto na biblioteca sem passar pelo Pix
  if (game.price === 0) {
    if (!myLibrary.some(item => item.id === game.id)) {
      myLibrary.push(game);
      localStorage.setItem('gx_library', JSON.stringify(myLibrary));
      alert(`"${game.title}" foi adicionado gratuitamente à sua Biblioteca!`);
      showPage('libraryPage');
    } else {
      alert('Este jogo já está na sua biblioteca!');
    }
    return;
  }

  if (!cart.some(item => item.id === gameId)) {
    cart.push(game);
    saveCart();
    updateCartUI();
    alert(`"${game.title}" foi adicionado ao carrinho!`);
  }
}

function updateCartUI() {
  document.getElementById('cartCount').innerText = cart.length;
  const cartList = document.getElementById('cartItemsList');
  cartList.innerHTML = '';

  let total = 0;
  cart.forEach(item => {
    total += item.price;
    cartList.innerHTML += `
      <div style="display:flex; justify-content:space-between; margin-bottom:10px; background:var(--bg-dark); padding:10px; border-radius:8px;">
        <span>${item.title}</span>
        <strong>R$ ${item.price.toFixed(2)}</strong>
      </div>
    `;
  });

  document.getElementById('cartTotal').innerText = total.toFixed(2);
}

function saveCart() { localStorage.setItem('gx_cart', JSON.stringify(cart)); }

// PAGAMENTO BANCO INTER (PIX COM CHAVE E-MAIL DANIELJESUSDEO@GMAIL.COM)
async function checkoutWithInterPix() {
  if (cart.length === 0) return alert('Seu carrinho está vazio.');
  const total = cart.reduce((sum, item) => sum + item.price, 0);

  try {
    const res = await fetch(`${API_URL}/checkout/inter-pix`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount: total })
    });
    const data = await res.json();

    closeModal('cartModal');
    showPixPaymentModal(data.pixKey, data.qrCodeUrl, total);
  } catch (err) {
    alert("Erro ao conectar com o gateway do Banco Inter.");
  }
}

function showPixPaymentModal(pixKey, qrCodeUrl, amount) {
  const content = document.getElementById('gameDetailContent');
  content.innerHTML = `
    <span class="close-btn" onclick="closeModal('gameDetailModal')">&times;</span>
    <h2 style="text-align:center;">Pagamento via Pix (Banco Inter)</h2>
    <p style="text-align:center; color:var(--text-muted); margin-top:5px;">Chave Pix: <strong>${pixKey}</strong></p>
    
    <div style="text-align: center; margin: 20px 0;">
      <img src="${qrCodeUrl}" style="width: 220px; height: 220px; border-radius:12px; border: 4px solid var(--accent-purple);">
      <h3 style="margin-top:10px; color:var(--accent-green);">Valor: R$ ${amount.toFixed(2)}</h3>
    </div>

    <div class="form-group">
      <label>Chave Pix Copia e Cola / E-mail:</label>
      <input type="text" id="pixKeyInput" value="${pixKey}" readonly>
    </div>
    <button class="btn-primary" style="width:100%;" onclick="copyPixKey()">Copiar Chave Pix</button>
    <br><br>
    <button class="btn-submit" onclick="confirmPaymentAndRelease()">Já Realizei o Pagamento</button>
  `;
  openModal('gameDetailModal');
}

function copyPixKey() {
  const input = document.getElementById('pixKeyInput');
  input.select();
  document.execCommand('copy');
  alert("Chave Pix (danieljesusdeo@gmail.com) copiada com sucesso!");
}

function confirmPaymentAndRelease() {
  myLibrary.push(...cart);
  localStorage.setItem('gx_library', JSON.stringify(myLibrary));
  cart = [];
  saveCart();
  updateCartUI();
  closeModal('gameDetailModal');
  alert("Pagamento confirmado! Jogos liberados na sua Biblioteca.");
  showPage('libraryPage');
}

// BIBLIOTECA E PLAYER DE JOGOS
function renderLibrary() {
  const grid = document.getElementById('libraryGrid');
  grid.innerHTML = '';

  if (myLibrary.length === 0) {
    grid.innerHTML = '<p>Sua biblioteca está vazia.</p>';
    return;
  }

  myLibrary.forEach(game => {
    grid.innerHTML += `
      <div class="game-card">
        <img src="${game.image}" alt="${game.title}">
        <div class="game-info">
          <h3>${game.title}</h3>
          <button class="btn-primary" onclick="playGame('${game.game_url}', '${game.title}')">▶ JOGAR AGORA</button>
        </div>
      </div>
    `;
  });
}

function playGame(url, title) {
  const content = document.getElementById('gameDetailContent');
  content.innerHTML = `
    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px;">
      <h2>${title}</h2>
      <button class="btn-secondary" onclick="closeModal('gameDetailModal')">✖ Fechar Jogo</button>
    </div>
    <div style="width:100%; height:75vh; border-radius:12px; overflow:hidden; border: 1px solid var(--border-color);">
      <iframe src="${url}" style="width:100%; height:100%; border:none;" allow="fullscreen; autoplay"></iframe>
    </div>
  `;
  openModal('gameDetailModal');
}

function openGameDetail(id) {
  const game = games.find(g => g.id === id);
  if (!game) return;
  const content = document.getElementById('gameDetailContent');
  content.innerHTML = `
    <span class="close-btn" onclick="closeModal('gameDetailModal')">&times;</span>
    <h2>${game.title}</h2>
    <br>
    <img src="${game.image}" style="width:100%; height:250px; object-fit:cover; border-radius:12px;">
    <br><br>
    <p>${game.description}</p>
    <br>
    <button class="btn-primary" onclick="addToCart(${game.id}); closeModal('gameDetailModal');">Adicionar ao Carrinho</button>
  `;
  openModal('gameDetailModal');
}

function openModal(id) { document.getElementById(id).style.display = 'block'; }
function closeModal(id) { document.getElementById(id).style.display = 'none'; }

function handleCreateGame(e) {
  e.preventDefault();
  const newGame = {
    id: Date.now(),
    title: document.getElementById('title').value,
    category: document.getElementById('category').value,
    price: parseFloat(document.getElementById('price').value),
    image: document.getElementById('imageUrl').value,
    game_url: document.getElementById('gameUrl').value,
    description: document.getElementById('description').value
  };

  games.push(newGame);
  localStorage.setItem('gx_games', JSON.stringify(games));
  renderGames(games);
  showPage('storePage');
  alert('Jogo cadastrado na vitrine!');
}

function handleLogin(e) {
  const email = document.getElementById('loginEmail').value;
  currentUser = { name: email.split('@')[0], email };
  localStorage.setItem('gx_user', JSON.stringify(currentUser));
  updateAuthUI();
}

function handleRegister(e) {
  e.preventDefault();
  currentUser = { name: document.getElementById('regName').value, email: document.getElementById('regEmail').value };
  localStorage.setItem('gx_user', JSON.stringify(currentUser));
  updateAuthUI();
  showPage('storePage');
}

function handleGoogleLogin() {
  alert("Para efetuar o login com o Google no Wi-Fi, abra a página diretamente no navegador (Chrome/Safari) do seu dispositivo.");
}

function updateAuthUI() {
  const area = document.getElementById('authArea');
  if (currentUser) {
    area.innerHTML = `<span>Olá, <strong>${currentUser.name}</strong></span> <button class="btn-secondary" onclick="logout()">Sair</button>`;
  } else {
    area.innerHTML = `<button class="btn-secondary" onclick="showPage('authPage')">Entrar / Registrar</button>`;
  }
}

function logout() {
  localStorage.removeItem('gx_user');
  currentUser = null;
  updateAuthUI();
                             }
    
