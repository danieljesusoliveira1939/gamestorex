const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const db = new sqlite3.Database(path.resolve(__dirname, 'database.sqlite'));

db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS games (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      category TEXT NOT NULL,
      price REAL NOT NULL,
      image TEXT NOT NULL,
      description TEXT,
      game_url TEXT
    )
  `);

  // Garante que o Shattered Pixel Dungeon esteja no banco de dados
  db.get("SELECT COUNT(*) as count FROM games", (err, row) => {
    if (row.count === 0) {
      const stmt = db.prepare("INSERT INTO games (title, category, price, image, description, game_url) VALUES (?, ?, ?, ?, ?, ?)");
      
      stmt.run(
        "Shattered Pixel Dungeon",
        "RPG",
        0.00,
        "https://raw.githubusercontent.com/00-Evan/shattered-pixel-dungeon/master/android/res/drawable-nodpi/banner.png",
        "Explore as profundezas do calabouço neste incrível RPG Roguelike gratuito e completo!",
        "https://pux0r3.github.io/shattered-pixel-dungeonweb/"
      );

      stmt.finalize();
    }
  });
});

module.exports = db;
