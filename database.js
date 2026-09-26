const sqlite3 = require("sqlite3").verbose();

const db = new sqlite3.Database("./mturk.db", (err) => {
    if (err) {
        console.error("Database connection error:", err.message);
    } else {
        console.log("Connected to MTurk database.");
    }
});

db.serialize(() => {

    // Users table
    db.run(`
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            email TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL,
            role TEXT NOT NULL DEFAULT 'worker',
            balance REAL DEFAULT 0,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `);

    // Tasks table
    db.run(`
        CREATE TABLE IF NOT EXISTS tasks (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            description TEXT NOT NULL,
            category TEXT NOT NULL,
            payment REAL NOT NULL,
            deadline TEXT NOT NULL,
            requester_id INTEGER NOT NULL,
            status TEXT DEFAULT 'available',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (requester_id) REFERENCES users(id)
        )
    `);

    // Applications table
    db.run(`
        CREATE TABLE IF NOT EXISTS applications (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            task_id INTEGER NOT NULL,
            worker_id INTEGER NOT NULL,
            status TEXT DEFAULT 'applied',
            applied_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            completed_at DATETIME,
            FOREIGN KEY (task_id) REFERENCES tasks(id),
            FOREIGN KEY (worker_id) REFERENCES users(id)
        )
    `);

    // Earnings table
    db.run(`
        CREATE TABLE IF NOT EXISTS earnings (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            worker_id INTEGER NOT NULL,
            task_id INTEGER NOT NULL,
            amount REAL NOT NULL,
            status TEXT DEFAULT 'pending',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (worker_id) REFERENCES users(id),
            FOREIGN KEY (task_id) REFERENCES tasks(id)
        )
    `);

        // Reviews table
    db.run(`
        CREATE TABLE IF NOT EXISTS reviews (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            task_id INTEGER NOT NULL,
            worker_id INTEGER NOT NULL,
            rating INTEGER NOT NULL,
            review TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `);

    // Create sample users
    db.run(`
        INSERT OR IGNORE INTO users
        (id, name, email, password, role, balance)
        VALUES
        (1, 'Task Requester', 'requester@mturkclone.com', '123456', 'requester', 0)
    `);

    db.run(`
        INSERT OR IGNORE INTO users
        (id, name, email, password, role, balance)
        VALUES
        (2, 'Test Worker', 'worker@mturkclone.com', '123456', 'worker', 0)
    `);

    // Create sample tasks
    db.run(`
        INSERT OR IGNORE INTO tasks
        (id, title, description, category, payment, deadline, requester_id, status)
        VALUES
        (1, 'Image Classification', 'Classify images according to the provided categories.', 'Data Entry', 2.50, '2026-09-30', 1, 'available')
    `);

    db.run(`
        INSERT OR IGNORE INTO tasks
        (id, title, description, category, payment, deadline, requester_id, status)
        VALUES
        (2, 'Online Survey', 'Complete a short survey about online shopping habits.', 'Surveys', 1.50, '2026-10-02', 1, 'available')
    `);

    db.run(`
        INSERT OR IGNORE INTO tasks
        (id, title, description, category, payment, deadline, requester_id, status)
        VALUES
        (3, 'Text Transcription', 'Transcribe a short audio recording into text.', 'Transcription', 4.00, '2026-10-05', 1, 'available')
    `);

    db.run(`
        INSERT OR IGNORE INTO tasks
        (id, title, description, category, payment, deadline, requester_id, status)
        VALUES
        (4, 'Data Verification', 'Check a list of data entries and verify their accuracy.', 'Data Entry', 3.00, '2026-10-08', 1, 'available')
    `);

    db.run(`
        INSERT OR IGNORE INTO tasks
        (id, title, description, category, payment, deadline, requester_id, status)
        VALUES
        (5, 'Product Research', 'Research product information and record the results.', 'Research', 5.00, '2026-10-10', 1, 'available')
    `);

    console.log("Sample users and tasks are ready.");

    console.log("Database tables are ready.");
});

module.exports = db;