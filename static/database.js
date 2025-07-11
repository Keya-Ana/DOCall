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
        CREATE TABLE IF NOT EXISTS patients (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            first_name TEXT NOT NULL,
            last_name TEXT NOT NULL,
            dob TEXT NOT NULL,
            gender TEXT NOT NULL,
            address TEXT NOT NULL,
            phone TEXT NOT NULL,
            email TEXT,
            patient_type TEXT NOT NULL,
            admission_date TEXT NOT NULL,
            primary_condition TEXT NOT NULL,
            condition_severity TEXT NOT NULL,
            current_status TEXT NOT NULL,
            medications TEXT,
            notes TEXT,
            photo TEXT,
            created_at TEXT DEFAULT CURRENT_TIMESTAMP
        )
    `);
    
    // Insert some sample data if the database is empty
    const result = db.exec("SELECT COUNT(*) as count FROM patients");
    const count = result[0]?.values[0][0] || 0;
    
    if (count === 0) {
        insertSampleData();
    }
}

function insertSampleData() {
    const sampleData = [
        {
            first_name: 'John',
            last_name: 'Smith',
            dob: '1985-04-12',
            gender: 'Male',
            address: '123 Main St, Anytown',
            phone: '555-1234',
            email: 'john.smith@example.com',
            patient_type: 'Inpatient',
            admission_date: '2023-05-15',
            primary_condition: 'Pneumonia',
            condition_severity: 'Severe',
            current_status: 'Recovering',
            medications: 'Amoxicillin, Ibuprofen, Albuterol',
            notes: 'Patient responding well to treatment. Continue current medication regimen.',
            photo: 'https://randomuser.me/api/portraits/men/32.jpg'
        },
        {
            first_name: 'Emily',
            last_name: 'Johnson',
            dob: '1978-11-23',
            gender: 'Female',
            address: '456 Oak Ave, Somewhere',
            phone: '555-5678',
            email: 'emily.j@example.com',
            patient_type: 'Outpatient',
            admission_date: '2023-06-02',
            primary_condition: 'Hypertension',
            condition_severity: 'Moderate',
            current_status: 'Stable',
            medications: 'Lisinopril, Hydrochlorothiazide',
            notes: 'Blood pressure under control. Schedule follow-up in 2 weeks.',
            photo: 'https://randomuser.me/api/portraits/women/44.jpg'
        },
        {
            first_name: 'Michael',
            last_name: 'Williams',
            dob: '1992-07-30',
            gender: 'Male',
            address: '789 Pine Rd, Nowhere',
            phone: '555-9012',
            patient_type: 'Inpatient',
            admission_date: '2023-06-10',
            primary_condition: 'Appendicitis',
            condition_severity: 'Critical',
            current_status: 'Critical',
            medications: 'Morphine, Cefazolin, Metronidazole',
            notes: 'Post-op recovery. Monitor for infection. NPO until bowel sounds return.'
        },
        {
            first_name: 'Sarah',
            last_name: 'Brown',
            dob: '1965-09-14',
            gender: 'Female',
            address: '321 Elm St, Anywhere',
            phone: '555-3456',
            email: 'sarah.b@example.com',
            patient_type: 'Outpatient',
            admission_date: '2023-06-05',
            primary_condition: 'Type 2 Diabetes',
            condition_severity: 'Moderate',
            current_status: 'Stable',
            medications: 'Metformin, Insulin glargine',
            notes: 'Blood sugar levels improving. Continue current treatment and diet.'
        },
        {
            first_name: 'David',
            last_name: 'Jones',
            dob: '1958-12-03',
            gender: 'Male',
            address: '654 Maple Dr, Somewhere',
            phone: '555-7890',
            patient_type: 'Inpatient',
            admission_date: '2023-06-12',
            primary_condition: 'Heart Failure',
            condition_severity: 'Critical',
            current_status: 'Critical',
            medications: 'Furosemide, Carvedilol, Lisinopril',
            notes: 'Severe CHF. Monitor fluid intake/output closely. Cardiology consult ordered.'
        },
        {
            first_name: 'Lisa',
            last_name: 'Garcia',
            dob: '1980-03-25',
            gender: 'Female',
            address: '987 Cedar Ln, Nowhere',
            phone: '555-2345',
            email: 'lisa.g@example.com',
            patient_type: 'Outpatient',
            admission_date: '2023-06-08',
            primary_condition: 'Migraine',
            condition_severity: 'Mild',
            current_status: 'Recovering',
            medications: 'Sumatriptan, Naproxen',
            notes: 'Migraine frequency decreasing with current treatment. Consider preventive therapy if symptoms persist.'
        }
    ];
    
    sampleData.forEach(patient => {
        addPatientToDB(patient);
    });
}

// Database operations
function addPatientToDB(patientData) {
    return new Promise((resolve, reject) => {
        try {
            const stmt = db.prepare(`
                INSERT INTO patients (
                    first_name, last_name, dob, gender, address, phone, email,
                    patient_type, admission_date, primary_condition, condition_severity,
                    current_status, medications, notes, photo
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `);
            
            stmt.bind([
                patientData.first_name,
                patientData.last_name,
                patientData.dob,
                patientData.gender,
                patientData.address,
                patientData.phone,
                patientData.email || null,
                patientData.patient_type,
                patientData.admission_date,
                patientData.primary_condition,
                patientData.condition_severity,
                patientData.current_status,
                patientData.medications || null,
                patientData.notes || null,
                patientData.photo || null
            ]);
            
            stmt.step();
            stmt.free();
            resolve();
        } catch (error) {
            reject(error);
        }
    });
}

function getAllPatients() {
    return new Promise((resolve, reject) => {
        try {
            const stmt = db.prepare("SELECT * FROM patients ORDER BY admission_date DESC");
            
            const patients = [];
            while (stmt.step()) {
                patients.push(stmt.getAsObject());
            }
            
            stmt.free();
            resolve(patients);
        } catch (error) {
            reject(error);
        }
    });
}

function getPatientById(id) {
    return new Promise((resolve, reject) => {
        try {
            const stmt = db.prepare("SELECT * FROM patients WHERE id = ?");
            stmt.bind([id]);
            
            if (stmt.step()) {
                const row = stmt.getAsObject();
                stmt.free();
                resolve(row);
            } else {
                stmt.free();
                resolve(null);
            }
        } catch (error) {
            reject(error);
        }
    });
}

function getPatientCount(type = null) {
    return new Promise((resolve, reject) => {
        try {
            let query = "SELECT COUNT(*) as count FROM patients";
            let params = [];
            
            if (type) {
                query += " WHERE patient_type = ?";
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

function getPatientCountByStatus(status) {
    return new Promise((resolve, reject) => {
        try {
            const stmt = db.prepare("SELECT COUNT(*) as count FROM patients WHERE current_status = ?");
            stmt.bind([status]);
            
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

function getRecentPatients(limit = 5) {
    return new Promise((resolve, reject) => {
        try {
            const stmt = db.prepare(`
                SELECT * FROM patients 
                ORDER BY admission_date DESC 
                LIMIT ?
            `);
            
            stmt.bind([limit]);
            
            const patients = [];
            while (stmt.step()) {
                patients.push(stmt.getAsObject());
            }
            
            stmt.free();
            resolve(patients);
        } catch (error) {
            reject(error);
        }
    });
}

function removePatient(id) {
    return new Promise((resolve, reject) => {
        try {
            const stmt = db.prepare("DELETE FROM patients WHERE id = ?");
            stmt.bind([id]);
            stmt.step();
            stmt.free();
            resolve();
        } catch (error) {
            reject(error);
        }
    });
}