const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Cria ou abre o arquivo de banco de dados
const dbPath = path.resolve(__dirname, 'database.sqlite');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Erro ao conectar ao SQLite:', err.message);
  } else {
    console.log('Conectado ao banco de dados SQLite.');
  }
});

// Inicializa as tabelas do banco de dados
db.serialize(() => {
  // Tabela de Usuários
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL
    )
  `);

  // Tabela de Jogos
  db.run(`
    CREATE TABLE IF NOT EXISTS games (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      category TEXT NOT NULL,
      price REAL NOT NULL,
      image TEXT NOT NULL,
      description TEXT
    )
  `);

  // Tabela de Biblioteca (Compras)
  db.run(`
    CREATE TABLE IF NOT EXISTS library (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      game_id INTEGER NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users (id),
      FOREIGN KEY (game_id) REFERENCES games (id)
    )
  `);

  // Insere alguns jogos padrão caso a tabela esteja vazia
  db.get("SELECT COUNT(*) as count FROM games", (err, row) => {
    if (row.count === 0) {
      const stmt = db.prepare("INSERT INTO games (title, category, price, image, description) VALUES (?, ?, ?, ?, ?)");
      stmt.run("Cyberpunk Quest", "RPG", 129.90, "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=500", "Explore uma cidade futurista recheada de ação.");
      stmt.run("Space Strategy X", "Estratégia", 79.90, "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=500", "Domine a galáxia construindo frotas.");
      stmt.run("Warrior Legends", "Ação", 49.90, "https://images.unsplash.com/photo-1538481199705-c710c4e965fc?w=500", "Batalhas épicas em um mundo medieval sombrio.");
      stmt.finalize();
      console.log('Jogos iniciais cadastrados!');
    }
  });
});

module.exports = db;