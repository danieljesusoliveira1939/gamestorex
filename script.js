// DADOS DE DICIONÁRIO PARA SUPORTE A IDIOMAS
const translations = {
  pt: {
    subtitle: "Sua Loja de Jogos Indie",
    navAddGame: "+ Anunciar Jogo",
    loginBtn: "Entrar / Registrar",
    featuredTitle: "Jogos em Destaque",
    backBtn: "← Voltar para a Loja",
    createGameTitle: "Cadastrar Novo Jogo para Venda",
    createGameDesc: "Preencha os detalhes do seu jogo para exibi-lo na vitrine da Pixel Vault.",
    labelTitle: "Nome do Jogo",
    labelPrice: "Preço (R$)",
    labelImage: "URL da Imagem PNG (Capa)",
    labelDesc: "Descrição Breve",
    btnPublish: "Publicar Jogo",
    authTitle: "Acesse sua Conta",
    googleLogin: "Entrar com o Google",
    orDivider: "ou",
    btnLogin: "Entrar",
    settingsTitle: "Configurações da Conta",
    labelProfilePic: "URL da Foto de Perfil (PNG/JPG)",
    btnSavePic: "Salvar Foto",
    themeLabel: "Aparência / Tema",
    themeDark: "Modo Escuro (Padrão)",
    themeLight: "Modo Claro",
    langLabel: "Idioma",
    buyBtn: "Comprar Agora"
  },
  en: {
    subtitle: "Your Indie Game Store",
    navAddGame: "+ Sell Game",
    loginBtn: "Login / Register",
    featuredTitle: "Featured Games",
    backBtn: "← Back to Store",
    createGameTitle: "Publish New Game for Sale",
    createGameDesc: "Fill in the details of your game to display it in the Pixel Vault store.",
    labelTitle: "Game Title",
    labelPrice: "Price ($)",
    labelImage: "PNG Image URL (Cover)",
    labelDesc: "Short Description",
    btnPublish: "Publish Game",
    authTitle: "Access Your Account",
    googleLogin: "Sign in with Google",
    orDivider: "or",
    btnLogin: "Login",
    settingsTitle: "Account Settings",
    labelProfilePic: "Profile Picture URL (PNG/JPG)",
    btnSavePic: "Save Picture",
    themeLabel: "Appearance / Theme",
    themeDark: "Dark Mode (Default)",
    themeLight: "Light Mode",
    langLabel: "Language",
    buyBtn: "Buy Now"
  }
};

let currentLang = 'pt';

// ESTADO INICIAL DOS JOGOS
const games = [
  {
    title: "Cyberpunk Quest",
    price: "129.90",
    imageUrl: "https://via.placeholder.com/300x180/8257e5/ffffff?text=Cyberpunk+PNG",
    description: "Um RPG futurista repleto de ação e mistérios neon."
  },
  {
    title: "Fantasy RPG",
    price: "89.90",
    imageUrl: "https://via.placeholder.com/300x180/04d361/ffffff?text=Fantasy+RPG+PNG",
    description: "Explore terras mágicas e enfrente dragões lendários."
  }
];

// NAVEGAÇÃO SPA (Troca de Telas)
function showPage(pageId) {
  document.querySelectorAll('.page').forEach(page => page.classList.remove('active-page'));
  document.getElementById(pageId).classList.add('active-page');
}

// MODAIS
function openModal(modalId) {
  document.getElementById(modalId).style.display = 'flex';
}

function closeModal(modalId) {
  document.getElementById(modalId).style.display = 'none';
}

// RENDERIZAR JOGOS
function renderGames() {
  const gamesGrid = document.getElementById('gamesGrid');
  gamesGrid.innerHTML = '';

  games.forEach(game => {
    const card = document.createElement('div');
    card.className = 'game-card';
    card.innerHTML = `
      <img src="${game.imageUrl}" alt="${game.title}" onerror="this.src='https://via.placeholder.com/300x180/29292e/ffffff?text=Imagem+Indisponivel'">
      <div class="game-info">
        <div>
          <h3 class="game-title">${game.title}</h3>
          <p class="game-desc">${game.description || ''}</p>
          <p class="game-price">R$ ${parseFloat(game.price).toFixed(2).replace('.', ',')}</p>
        </div>
        <button class="btn-primary" onclick="alert('Item adicionado ao carrinho!')" data-i18n="buyBtn">${translations[currentLang].buyBtn}</button>
      </div>
    `;
    gamesGrid.appendChild(card);
  });
}

// LÓGICA DE CADASTRO DE JOGOS
document.getElementById('gameForm').addEventListener('submit', function(e) {
  e.preventDefault();
  
  const newGame = {
    title: document.getElementById('title').value,
    price: document.getElementById('price').value,
    imageUrl: document.getElementById('imageUrl').value,
    description: document.getElementById('description').value
  };

  games.push(newGame);
  renderGames();
  this.reset();
  showPage('storePage'); // Redireciona de volta para a loja
});

// AUTENTICAÇÃO E PERFIL DA CONTA
function handleLogin(e) {
  e.preventDefault();
  closeModal('authModal');
  setupLoggedInUser("https://via.placeholder.com/100/8257e5/ffffff?text=User");
}

function loginWithGoogle() {
  // Verifica se o login está rodando dentro do captive portal do celular
  alert("Para entrar com o Google, certifique-se de abrir esta página no navegador do seu celular (Chrome ou Safari).");
  
  // Redireciona para o fluxo OAuth do Google (se configurado no seu servidor backend)
  window.location.href = "https://accounts.google.com/o/oauth2/v2/auth?...";
}

function setupLoggedInUser(avatarUrl) {
  const authArea = document.getElementById('authArea');
  authArea.innerHTML = `
    <img src="${avatarUrl}" id="userAvatar" class="user-avatar-btn" onclick="openModal('settingsModal')" alt="Perfil">
  `;
  document.getElementById('profilePreview').src = avatarUrl;
}

function updateProfilePic() {
  const url = document.getElementById('profileUrlInput').value;
  if(url) {
    document.getElementById('userAvatar').src = url;
    document.getElementById('profilePreview').src = url;
  }
}

// ALTERNAR TEMA (DARK / LIGHT MODE)
function changeTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
}

// ALTERNAR IDIOMA
function changeLanguage(lang) {
  currentLang = lang;
  document.querySelectorAll('[data-i18n]').forEach(element => {
    const key = element.getAttribute('data-i18n');
    if (translations[lang][key]) {
      element.innerText = translations[lang][key];
    }
  });
  renderGames(); // Recarrega os textos dinâmicos dos cards
}

// INICIALIZAÇÃO DA PÁGINA
renderGames();