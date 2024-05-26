const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'roles.db');
const db = new sqlite3.Database(dbPath);

// Initialize database tables
const initializeDatabase = () => {
    db.serialize(() => {
        db.run(`
            CREATE TABLE IF NOT EXISTS role_assignments (
                userId TEXT,
                roleId TEXT,
                assignedDate TEXT
            )
        `);
    });
};

// Add a new role assignment
const addRoleAssignment = (userId, roleId, assignedDate) => {
    return new Promise((resolve, reject) => {
        db.run(`
            INSERT INTO role_assignments (userId, roleId, assignedDate)
            VALUES (?, ?, ?)
        `, [userId, roleId, assignedDate], function(err) {
            if (err) {
                return reject(err);
            }
            resolve(`A row has been inserted with rowid ${this.lastID}`);
        });
    });
};

// Get all role assignments
const getAllAssignments = () => {
    return new Promise((resolve, reject) => {
        db.all(`
            SELECT * FROM role_assignments
        `, (err, rows) => {
            if (err) {
                return reject(err);
            }
            resolve(rows);
        });
    });
};

// Get a specific role assignment
const getAssignment = (userId, roleId) => {
    return new Promise((resolve, reject) => {
        db.get(`
            SELECT * FROM role_assignments
            WHERE userId = ? AND roleId = ?
        `, [userId, roleId], (err, row) => {
            if (err) {
                return reject(err);
            }
            resolve(row);
        });
    });
};

// Helper function to add days to a date
function addDays(date, days) {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
}

// Get remaining time for a role assignment
const getRemainingTime = (userId, roleId) => {
    return new Promise((resolve, reject) => {
        db.get(`
            SELECT assignedDate FROM role_assignments
            WHERE userId = ? AND roleId = ?
        `, [userId, roleId], (err, row) => {
            if (err) {
                return reject(err);
            }
            if (!row) {
                return resolve(null);
            }

            const assignedDate = new Date(row.assignedDate).getTime();
            const sixMonthsInMilliseconds = 6 * 32 * 24 * 60 * 60 * 1000; // 6 months
            const expirationDate = assignedDate + sixMonthsInMilliseconds;
            const now = Date.now();

            const remainingTime = expirationDate - now;
            resolve(remainingTime > 0 ? remainingTime : null);
        });
    });
};

// Remove expired role assignments
const removeRoleAssignment = (userId, roleId) => {
    return new Promise((resolve, reject) => {
        db.run(`
            DELETE FROM role_assignments
            WHERE userId = ? AND roleId = ?
        `, [userId, roleId], function(err) {
            if (err) {
                return reject(err);
            }
            resolve(`Row(s) deleted ${this.changes}`);
        });
    });
};

// Extend expiration date
const extendRoleAssignment = (userId, roleId, newAssignedDate) => {
    return new Promise((resolve, reject) => {
        db.run(`
            UPDATE role_assignments
            SET assignedDate = ?
            WHERE userId = ? AND roleId = ?
        `, [newAssignedDate, userId, roleId], function(err) {
            if (err) {
                return reject(err);
            }
            resolve(`Role assignment for user ${userId} and role ${roleId} extended.`);
        });
    });
};

initializeDatabase();

module.exports = {
    addRoleAssignment,
    getAllAssignments,
    getAssignment,
    getRemainingTime,
    removeRoleAssignment,
    extendRoleAssignment
};
