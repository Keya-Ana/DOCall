// SQL.js library will be loaded via CDN in HTML
let db;

// Initialize the database
async function initDatabase() {
    // Load SQL.js
    const SQL = await initSqlJs({
        locateFile: file => `https://cdn.jsdelivr.net/npm/sql.js@1.8.0/dist/${file}`
    });
    
    // Create a new database
    db = new SQL.Database();
    
    // Create tables if they don't exist
    db.run(`
        CREATE TABLE IF NOT EXISTS staff (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            type TEXT NOT NULL,
            first_name TEXT NOT NULL,
            last_name TEXT NOT NULL,
            email TEXT NOT NULL,
            phone TEXT NOT NULL,
            hire_date TEXT NOT NULL,
            photo TEXT,
            role_info TEXT NOT NULL,
            created_at TEXT DEFAULT CURRENT_TIMESTAMP
        )
    `);
    
    // Insert some sample data if the database is empty
    const result = db.exec("SELECT COUNT(*) as count FROM staff");
    const count = result[0]?.values[0][0] || 0;
    
    if (count === 0) {
        insertSampleData();
    }
}

function insertSampleData() {
    const sampleData = [
        {
            type: 'Doctor',
            first_name: 'Sarah',
            last_name: 'Johnson',
            email: 'sarah.johnson@hospital.com',
            phone: '555-0101',
            hire_date: '2020-05-15',
            photo: 'https://randomuser.me/api/portraits/women/65.jpg',
            role_info: {
                specialization: 'Cardiology',
                department: 'Cardiology',
                license_number: 'MD123456'
            }
        },
        {
            type: 'Doctor',
            first_name: 'Michael',
            last_name: 'Chen',
            email: 'michael.chen@hospital.com',
            phone: '555-0102',
            hire_date: '2019-08-22',
            photo: 'https://randomuser.me/api/portraits/men/32.jpg',
            role_info: {
                specialization: 'Neurology',
                department: 'Neurology',
                license_number: 'MD654321'
            }
        },
        {
            type: 'Nurse',
            first_name: 'Emily',
            last_name: 'Rodriguez',
            email: 'emily.rodriguez@hospital.com',
            phone: '555-0201',
            hire_date: '2021-02-10',
            photo: 'https://randomuser.me/api/portraits/women/44.jpg',
            role_info: {
                ward: 'ICU',
                nursing_license: 'RN789012',
                shift: 'Night'
            }
        },
        {
            type: 'Nurse',
            first_name: 'David',
            last_name: 'Wilson',
            email: 'david.wilson@hospital.com',
            phone: '555-0202',
            hire_date: '2022-06-18',
            role_info: {
                ward: 'Emergency',
                nursing_license: 'RN345678',
                shift: 'Morning'
            }
        },
        {
            type: 'Support',
            first_name: 'James',
            last_name: 'Brown',
            email: 'james.brown@hospital.com',
            phone: '555-0301',
            hire_date: '2018-11-05',
            role_info: {
                role: 'Janitor',
                shift: 'Afternoon'
            }
        },
        {
            type: 'Support',
            first_name: 'Linda',
            last_name: 'Martinez',
            email: 'linda.martinez@hospital.com',
            phone: '555-0302',
            hire_date: '2020-09-14',
            photo: 'https://randomuser.me/api/portraits/women/28.jpg',
            role_info: {
                role: 'Security',
                shift: 'Night'
            }
        },
        {
            type: 'Vendor',
            first_name: 'Robert',
            last_name: 'Taylor',
            email: 'robert.taylor@medsupplies.com',
            phone: '555-0401',
            hire_date: '2021-04-30',
            role_info: {
                vendor_type: 'Medical Supplies',
                company: 'MedSupply Inc.',
                service_hours: 'Mon-Fri 8AM-4PM'
            }
        }
    ];
    
    sampleData.forEach(staff => {
        addStaff(staff);
    });
}

// Database operations
function addStaff(staffData) {
    return new Promise((resolve, reject) => {
        try {
            const stmt = db.prepare(`
                INSERT INTO staff (type, first_name, last_name, email, phone, hire_date, photo, role_info)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            `);
            
            stmt.bind([
                staffData.type,
                staffData.first_name,
                staffData.last_name,
                staffData.email,
                staffData.phone,
                staffData.hire_date,
                staffData.photo || null,
                typeof staffData.role_info === 'string' ? staffData.role_info : JSON.stringify(staffData.role_info)
            ]);
            
            stmt.step();
            stmt.free();
            resolve();
        } catch (error) {
            reject(error);
        }
    });
}

function getAllStaff(type = null) {
    return new Promise((resolve, reject) => {
        try {
            let query = "SELECT * FROM staff";
            let params = [];
            
            if (type) {
                query += " WHERE type = ?";
                params = [type];
            }
            
            query += " ORDER BY created_at DESC";
            
            const stmt = db.prepare(query);
            stmt.bind(params);
            
            const staff = [];
            while (stmt.step()) {
                const row = stmt.getAsObject();
                staff.push({
                    ...row,
                    role_info: JSON.parse(row.role_info)
                });
            }
            
            stmt.free();
            resolve(staff);
        } catch (error) {
            reject(error);
        }
    });
}

function getStaffById(id) {
    return new Promise((resolve, reject) => {
        try {
            const stmt = db.prepare("SELECT * FROM staff WHERE id = ?");
            stmt.bind([id]);
            
            if (stmt.step()) {
                const row = stmt.getAsObject();
                stmt.free();
                resolve({
                    ...row,
                    role_info: JSON.parse(row.role_info)
                });
            } else {
                stmt.free();
                resolve(null);
            }
        } catch (error) {
            reject(error);
        }
    });
}

function getStaffCount(type = null) {
    return new Promise((resolve, reject) => {
        try {
            let query = "SELECT COUNT(*) as count FROM staff";
            let params = [];
            
            if (type) {
                query += " WHERE type = ?";
                params = [type];
            }
            
            const stmt = db.prepare(query);
            stmt.bind(params);
            
            if (stmt.step()) {
                const row = stmt.getAsObject();
                stmt.free();
                resolve(row.count);
            } else {
                stmt.free();
                resolve(0);
            }
        } catch (error) {
            reject(error);
        }
    });
}

function getRecentStaff(limit = 5) {
    return new Promise((resolve, reject) => {
        try {
            const stmt = db.prepare(`
                SELECT * FROM staff 
                ORDER BY created_at DESC 
                LIMIT ?
            `);
            
            stmt.bind([limit]);
            
            const staff = [];
            while (stmt.step()) {
                const row = stmt.getAsObject();
                staff.push({
                    ...row,
                    role_info: JSON.parse(row.role_info)
                });
            }
            
            stmt.free();
            resolve(staff);
        } catch (error) {
            reject(error);
        }
    });
}

function removeStaff(id) {
    return new Promise((resolve, reject) => {
        try {
            const stmt = db.prepare("DELETE FROM staff WHERE id = ?");
            stmt.bind([id]);
            stmt.step();
            stmt.free();
            resolve();
        } catch (error) {
            reject(error);
        }
    });
}