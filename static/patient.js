document.addEventListener('DOMContentLoaded', function() {
    // Initialize database
    initDatabase().then(() => {
        // Load dashboard data
        loadDashboard();
        
        // Set up event listeners
        setupEventListeners();
        
        // Check for theme preference
        checkThemePreference();
    });
});

// Theme functionality (same as before)
function checkThemePreference() {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const savedTheme = localStorage.getItem('theme');
    
    if (savedTheme) {
        setTheme(savedTheme);
    } else if (prefersDark) {
        setTheme('dark');
    }
}

function setTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
    
    const themeBtn = document.getElementById('themeBtn');
    if (theme === 'dark') {
        themeBtn.innerHTML = '<i class="fas fa-sun"></i><span>Light Mode</span>';
    } else {
        themeBtn.innerHTML = '<i class="fas fa-moon"></i><span>Dark Mode</span>';
    }
}

// Navigation
function setupEventListeners() {
    // Theme toggle
    document.getElementById('themeBtn').addEventListener('click', function() {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        if (currentTheme === 'dark') {
            setTheme('light');
        } else {
            setTheme('dark');
        }
    });
    
    // Navigation tabs
    document.querySelectorAll('nav a').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Update active tab
            document.querySelectorAll('nav a').forEach(navLink => {
                navLink.classList.remove('active');
            });
            this.classList.add('active');
            
            // Show corresponding section
            const sectionId = this.getAttribute('data-section');
            document.querySelectorAll('.content-section').forEach(section => {
                section.classList.remove('active');
            });
            document.getElementById(sectionId).classList.add('active');
            
            // Load data for the section
            switch(sectionId) {
                case 'dashboard':
                    loadDashboard();
                    break;
                case 'patients':
                    loadPatients();
                    break;
                case 'medications':
                    loadMedications();
                    break;
                case 'conditions':
                    loadConditions();
                    break;
            }
        });
    });
    
    // Patient search and filter
    document.getElementById('patientSearch').addEventListener('input', function() {
        filterPatients();
    });
    
    document.getElementById('patientStatus').addEventListener('change', function() {
        filterPatients();
    });
    
    document.getElementById('patientType').addEventListener('change', function() {
        filterPatients();
    });
    
    // Medication search
    document.getElementById('medicationSearch').addEventListener('input', function() {
        filterMedications(this.value);
    });
    
    // Condition search and filter
    document.getElementById('conditionSearch').addEventListener('input', function() {
        filterConditions();
    });
    
    document.getElementById('conditionSeverity').addEventListener('change', function() {
        filterConditions();
    });
    
    // Add patient form submission
    document.getElementById('addPatientForm').addEventListener('submit', function(e) {
        e.preventDefault();
        addPatient();
    });
}

// Dashboard functions
function loadDashboard() {
    // Load counts
    getPatientCount().then(count => {
        document.getElementById('patientCount').textContent = count;
    });
    
    getPatientCount('Inpatient').then(count => {
        document.getElementById('inpatientCount').textContent = count;
    });
    
    getPatientCountByStatus('Critical').then(count => {
        document.getElementById('criticalCount').textContent = count;
    });
    
    getPatientCountByStatus('Discharged').then(count => {
        document.getElementById('recoveredCount').textContent = count;
    });
    
    // Load recent patients
    getRecentPatients().then(patients => {
        const recentPatientsContainer = document.getElementById('recentPatients');
        recentPatientsContainer.innerHTML = '';
        
        if (patients.length === 0) {
            recentPatientsContainer.innerHTML = '<p>No recent patient admissions found.</p>';
            return;
        }
        
        patients.forEach(patient => {
            recentPatientsContainer.appendChild(createPatientCard(patient));
        });
    });
}

// Patient functions
function loadPatients() {
    getAllPatients().then(patients => {
        const patientsList = document.getElementById('patientsList');
        patientsList.innerHTML = '';
        getAllPatients().then(patients => {
        patients.forEach(setupMedicationReminders);
        });
        if (patients.length === 0) {
            patientsList.innerHTML = '<p>No patients found.</p>';
            return;
        }
        
        patients.forEach(patient => {
            patientsList.appendChild(createPatientCard(patient));
        });
    });
}

function filterPatients() {
    const searchTerm = document.getElementById('patientSearch').value.toLowerCase();
    const statusFilter = document.getElementById('patientStatus').value;
    const typeFilter = document.getElementById('patientType').value;
    
    const patientsList = document.getElementById('patientsList');
    const cards = patientsList.querySelectorAll('.patient-card');
    
    cards.forEach(card => {
        const name = card.querySelector('.patient-name').textContent.toLowerCase();
        const matchesSearch = name.includes(searchTerm);
        
        const status = card.dataset.status;
        const matchesStatus = !statusFilter || status === statusFilter;
        
        const type = card.dataset.type;
        const matchesType = !typeFilter || type === typeFilter;
        
        if (matchesSearch && matchesStatus && matchesType) {
            card.style.display = 'block';
        } else {
            card.style.display = 'none';
        }
    });
}

// Patient card creation
function createPatientCard(patient) {
    const card = document.createElement('div');
    card.className = 'patient-card';
    card.dataset.id = patient.id;
    card.dataset.status = patient.current_status;
    card.dataset.type = patient.patient_type;
    
    const photoUrl = patient.photo || '';
    const photoDisplay = photoUrl ? 
        `<img src="${photoUrl}" alt="${patient.first_name} ${patient.last_name}" class="patient-photo">` :
        `<div class="patient-photo">${patient.first_name.charAt(0)}${patient.last_name.charAt(0)}</div>`;
    
    // Format medications for display
    let medicationsDisplay = 'None';
    if (patient.medications && patient.medications.length > 0) {
        medicationsDisplay = patient.medications.split(',').map(med => med.trim()).join(', ');
    }
    
    // Determine status badge color
    let statusClass = '';
    switch(patient.current_status) {
        case 'Critical':
            statusClass = 'status-critical';
            break;
        case 'Stable':
            statusClass = 'status-stable';
            break;
        case 'Recovering':
            statusClass = 'status-recovering';
            break;
        case 'Discharged':
            statusClass = 'status-discharged';
            break;
    }
    
    card.innerHTML = `
        <div class="patient-card-header ${patient.patient_type.toLowerCase()}">
            ${photoDisplay}
            <div class="patient-status ${statusClass}">${patient.current_status}</div>
        </div>
        <div class="patient-card-body">
            <h3 class="patient-name">${patient.first_name} ${patient.last_name}</h3>
            <p class="patient-info">
                <span>${calculateAge(patient.dob)} yrs</span> • 
                <span>${patient.gender}</span> • 
                <span>${patient.patient_type}</span>
            </p>
            <div class="patient-details">
                <div class="patient-detail">
                    <i class="fas fa-diagnoses"></i>
                    <span><strong>Condition:</strong> ${patient.primary_condition}</span>
                </div>
                <div class="patient-detail">
                    <i class="fas fa-thermometer-half"></i>
                    <span><strong>Severity:</strong> ${patient.condition_severity}</span>
                </div>
                <div class="patient-detail">
                    <i class="fas fa-calendar-alt"></i>
                    <span><strong>Admitted:</strong> ${new Date(patient.admission_date).toLocaleDateString()}</span>
                </div>
                <div class="patient-detail">
                    <i class="fas fa-pills"></i>
                    <span><strong>Medications:</strong> ${medicationsDisplay}</span>
                </div>
            </div>
        </div>
        <div class="patient-card-footer">
            <button class="btn btn-primary btn-sm" onclick="viewPatientDetails(${patient.id})">
                <i class="fas fa-eye"></i> View
            </button>
            <button class="btn btn-danger btn-sm" onclick="deletePatient(${patient.id})">
                <i class="fas fa-trash"></i> Delete
            </button>
        </div>
    `;
    
    return card;
}

function calculateAge(dob) {
    const birthDate = new Date(dob);
    const diff = Date.now() - birthDate.getTime();
    const ageDate = new Date(diff);
    return Math.abs(ageDate.getUTCFullYear() - 1970);
}

// Medications functions
function loadMedications() {
    getAllPatients().then(patients => {
        const medicationsList = document.getElementById('medicationsList');
        medicationsList.innerHTML = '';
        
        if (patients.length === 0) {
            medicationsList.innerHTML = '<p>No medications found.</p>';
            return;
        }
        
        // Extract all medications from patients
        const allMedications = [];
        patients.forEach(patient => {
            if (patient.medications) {
                const meds = patient.medications.split(',').map(med => med.trim());
                meds.forEach(med => {
                    if (med && !allMedications.includes(med)) {
                        allMedications.push(med);
                    }
                });
            }
        });
        
        if (allMedications.length === 0) {
            medicationsList.innerHTML = '<p>No medications found.</p>';
            return;
        }
        
        // Create medication cards
        allMedications.sort().forEach(med => {
            medicationsList.appendChild(createMedicationCard(med, patients));
        });
    });
}

function filterMedications(searchTerm) {
    const medicationsList = document.getElementById('medicationsList');
    const cards = medicationsList.querySelectorAll('.medication-card');
    
    cards.forEach(card => {
        const name = card.querySelector('.medication-name').textContent.toLowerCase();
        const matchesSearch = name.includes(searchTerm.toLowerCase());
        
        if (matchesSearch) {
            card.style.display = 'block';
        } else {
            card.style.display = 'none';
        }
    });
}

function createMedicationCard(medication, patients) {
    const card = document.createElement('div');
    card.className = 'medication-card';
    
    // Find patients taking this medication
    const patientsTaking = patients.filter(patient => 
        patient.medications && patient.medications.split(',').map(m => m.trim()).includes(medication)
    );
    
    card.innerHTML = `
        <div class="medication-card-header">
            <i class="fas fa-pills"></i>
        </div>
        <div class="medication-card-body">
            <h3 class="medication-name">${medication}</h3>
            <p class="medication-count">Prescribed to ${patientsTaking.length} patients</p>
            <div class="medication-patients">
                ${patientsTaking.slice(0, 3).map(patient => `
                    <span class="patient-tag">${patient.first_name} ${patient.last_name}</span>
                `).join('')}
                ${patientsTaking.length > 3 ? `<span class="patient-tag">+${patientsTaking.length - 3} more</span>` : ''}
            </div>
        </div>
    `;
    
    return card;
}

// Conditions functions
function loadConditions() {
    getAllPatients().then(patients => {
        const conditionsList = document.getElementById('conditionsList');
        conditionsList.innerHTML = '';
        
        if (patients.length === 0) {
            conditionsList.innerHTML = '<p>No conditions found.</p>';
            return;
        }
        
        // Group conditions by type and severity
        const conditionsMap = {};
        patients.forEach(patient => {
            const condition = patient.primary_condition;
            const severity = patient.condition_severity;
            
            if (!conditionsMap[condition]) {
                conditionsMap[condition] = {
                    Mild: 0,
                    Moderate: 0,
                    Severe: 0,
                    Critical: 0,
                    total: 0
                };
            }
            
            conditionsMap[condition][severity]++;
            conditionsMap[condition].total++;
        });
        
        // Create condition cards
        Object.entries(conditionsMap).forEach(([condition, stats]) => {
            conditionsList.appendChild(createConditionCard(condition, stats, patients));
        });
    });
}

function filterConditions() {
    const searchTerm = document.getElementById('conditionSearch').value.toLowerCase();
    const severityFilter = document.getElementById('conditionSeverity').value;
    
    const conditionsList = document.getElementById('conditionsList');
    const cards = conditionsList.querySelectorAll('.condition-card');
    
    cards.forEach(card => {
        const name = card.querySelector('.condition-name').textContent.toLowerCase();
        const matchesSearch = name.includes(searchTerm);
        
        const matchesSeverity = !severityFilter || 
            card.querySelector(`.severity-${severityFilter.toLowerCase()}`)?.textContent !== '0';
        
        if (matchesSearch && matchesSeverity) {
            card.style.display = 'block';
        } else {
            card.style.display = 'none';
        }
    });
}

function createConditionCard(condition, stats, patients) {
    const card = document.createElement('div');
    card.className = 'condition-card';
    
    // Find patients with this condition
    const patientsWithCondition = patients.filter(p => p.primary_condition === condition);
    
    // Get most common severity
    let mostCommonSeverity = 'Mild';
    let maxCount = stats.Mild;
    
    if (stats.Moderate > maxCount) {
        mostCommonSeverity = 'Moderate';
        maxCount = stats.Moderate;
    }
    if (stats.Severe > maxCount) {
        mostCommonSeverity = 'Severe';
        maxCount = stats.Severe;
    }
    if (stats.Critical > maxCount) {
        mostCommonSeverity = 'Critical';
    }
    
    card.innerHTML = `
        <div class="condition-card-header ${mostCommonSeverity.toLowerCase()}">
            <i class="fas fa-diagnoses"></i>
        </div>
        <div class="condition-card-body">
            <h3 class="condition-name">${condition}</h3>
            <p class="condition-count">${stats.total} cases</p>
            
            <div class="condition-severities">
                <div class="severity-row">
                    <span class="severity-label mild">Mild:</span>
                    <span class="severity-count severity-mild">${stats.Mild}</span>
                </div>
                <div class="severity-row">
                    <span class="severity-label moderate">Moderate:</span>
                    <span class="severity-count severity-moderate">${stats.Moderate}</span>
                </div>
                <div class="severity-row">
                    <span class="severity-label severe">Severe:</span>
                    <span class="severity-count severity-severe">${stats.Severe}</span>
                </div>
                <div class="severity-row">
                    <span class="severity-label critical">Critical:</span>
                    <span class="severity-count severity-critical">${stats.Critical}</span>
                </div>
            </div>
            
            <div class="condition-patients">
                ${patientsWithCondition.slice(0, 3).map(patient => `
                    <span class="patient-tag">${patient.first_name} ${patient.last_name}</span>
                `).join('')}
                ${patientsWithCondition.length > 3 ? `<span class="patient-tag">+${patientsWithCondition.length - 3} more</span>` : ''}
            </div>
        </div>
    `;
    
    return card;
}

// Patient details modal
function viewPatientDetails(id) {
    getPatientById(id).then(patient => {
        if (!patient) {
            alert('Patient not found');
            return;
        }
        
        // Format medications
        let medicationsDisplay = 'None';
        if (patient.medications && patient.medications.length > 0) {
            medicationsDisplay = patient.medications.split(',').map(med => 
                `<li>${med.trim()}</li>`
            ).join('');
            medicationsDisplay = `<ul>${medicationsDisplay}</ul>`;
        }
        
        // Format notes
        let notesDisplay = patient.notes || 'No notes available';
        if (notesDisplay.includes('\n')) {
            notesDisplay = notesDisplay.split('\n').map(para => 
                `<p>${para}</p>`
            ).join('');
        }
        
        const modalContent = document.getElementById('modalContent');
        modalContent.innerHTML = `
            <div class="modal-patient-header">
                <div class="modal-patient-photo">
                    ${patient.photo ? 
                        `<img src="${patient.photo}" alt="${patient.first_name} ${patient.last_name}">` :
                        `<div class="photo-placeholder">${patient.first_name.charAt(0)}${patient.last_name.charAt(0)}</div>`
                    }
                </div>
                <div class="modal-patient-info">
                    <h2>${patient.first_name} ${patient.last_name}</h2>
                    <p>${calculateAge(patient.dob)} years • ${patient.gender} • ${patient.patient_type}</p>
                    <p><strong>Status:</strong> <span class="status-${patient.current_status.toLowerCase()}">${patient.current_status}</span></p>
                </div>
            </div>
            
            <div class="modal-patient-details">
                <div class="detail-section">
                    <h3><i class="fas fa-info-circle"></i> Basic Information</h3>
                    <p><strong>Address:</strong> ${patient.address}</p>
                    <p><strong>Phone:</strong> ${patient.phone}</p>
                    <p><strong>Email:</strong> ${patient.email || 'Not provided'}</p>
                    <p><strong>Date of Birth:</strong> ${new Date(patient.dob).toLocaleDateString()}</p>
                    <p><strong>Admission Date:</strong> ${new Date(patient.admission_date).toLocaleDateString()}</p>
                </div>
                
                <div class="detail-section">
                    <h3><i class="fas fa-diagnoses"></i> Medical Information</h3>
                    <p><strong>Primary Condition:</strong> ${patient.primary_condition}</p>
                    <p><strong>Condition Severity:</strong> ${patient.condition_severity}</p>
                    <p><strong>Current Status:</strong> ${patient.current_status}</p>
                </div>
                
                <div class="detail-section">
                    <h3><i class="fas fa-pills"></i> Medications</h3>
                    ${medicationsDisplay}
                </div>
                
                <div class="detail-section">
                    <h3><i class="fas fa-file-medical"></i> Doctor's Notes</h3>
                    <div class="patient-notes">${notesDisplay}</div>
                </div>
            </div>
            
            <div class="form-actions">
                <button class="btn btn-secondary" onclick="closeModal()">
                    <i class="fas fa-times"></i> Close
                </button>
            </div>
        `;
        
        document.getElementById('patientModal').style.display = 'flex';
    });
}

function closeModal() {
    document.getElementById('patientModal').style.display = 'none';
}

// Add patient function
function addPatient() {
    const firstName = document.getElementById('firstName').value;
    const lastName = document.getElementById('lastName').value;
    const dob = document.getElementById('dob').value;
    const gender = document.getElementById('gender').value;
    const address = document.getElementById('address').value;
    const phone = document.getElementById('phone').value;
    const email = document.getElementById('email').value;
    const patientType = document.getElementById('patientTypeForm').value;
    const admissionDate = document.getElementById('admissionDate').value;
    const primaryCondition = document.getElementById('primaryCondition').value;
    const conditionSeverity = document.getElementById('conditionSeverityForm').value;
    const currentStatus = document.getElementById('currentStatus').value;
    const medications = document.getElementById('medications').value;
    const notes = document.getElementById('notes').value;
    const photo = document.getElementById('photo').value;
    
    const patientData = {
        first_name: firstName,
        last_name: lastName,
        dob: dob,
        gender: gender,
        address: address,
        phone: phone,
        email: email,
        patient_type: patientType,
        admission_date: admissionDate,
        primary_condition: primaryCondition,
        condition_severity: conditionSeverity,
        current_status: currentStatus,
        medications: medications,
        notes: notes,
        photo: photo || null
    };
    
    addPatientToDB(patientData).then(() => {
        alert('Patient added successfully!');
        document.getElementById('addPatientForm').reset();
        
        // Reload the appropriate sections
        loadDashboard();
        loadPatients();
        loadMedications();
        loadConditions();
    }).catch(error => {
        console.error('Error adding patient:', error);
        alert('Failed to add patient. Please try again.');
    });
}

// Delete patient function
function deletePatient(id) {
    if (!confirm('Are you sure you want to delete this patient record?')) {
        return;
    }
    
    removePatient(id).then(() => {
        // Remove the card from the UI
        const card = document.querySelector(`.patient-card[data-id="${id}"]`);
        if (card) {
            card.remove();
        }
        
        // Update dashboard and other sections
        loadDashboard();
        loadMedications();
        loadConditions();
    }).catch(error => {
        console.error('Error deleting patient:', error);
        alert('Failed to delete patient. Please try again.');
    });
}

// Close modal when clicking outside
window.addEventListener('click', function(event) {
    const modal = document.getElementById('patientModal');
    if (event.target === modal) {
        closeModal();
    }
});

function setupMedicationReminders(patient) {
  if (!patient.medication_times) return;
  
  const times = patient.medication_times.split(',');
  times.forEach(time => {
    const [hours, minutes] = time.trim().split(':');
    const now = new Date();
    const reminderTime = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
      hours, minutes
    );
    
    if (reminderTime < now) reminderTime.setDate(reminderTime.getDate() + 1);
    
    setTimeout(() => {
      notifier.show(
        `💊 ${patient.first_name}'s medication time: ${patient.medications}`,
        'warning'
      );
    }, reminderTime - now);
  });
}