const fs = require('fs');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();

// Database path
const dbPath = path.join(__dirname, 'roles.db');
const db = new sqlite3.Database(dbPath);

// Read JSON file
const jsonDataPath = path.join(__dirname, 'roleAssignments.json');
const jsonData = JSON.parse(fs.readFileSync(jsonDataPath, 'utf8'));

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

// Add role assignments from JSON to database
const addRoleAssignmentsFromJson = (assignments) => {
    assignments.forEach(assignment => {
        db.run(`
            INSERT INTO role_assignments (userId, roleId, assignedDate)
            VALUES (?, ?, ?)
        `, [assignment.userId, assignment.roleId, assignment.assignedDate]);
    });
};

// Initialize database and import JSON data
initializeDatabase();
addRoleAssignmentsFromJson(jsonData);

console.log('Data imported successfully');
