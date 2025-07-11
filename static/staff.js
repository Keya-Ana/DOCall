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

// Theme functionality
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
                case 'doctors':
                    loadDoctors();
                    break;
                case 'nurses':
                    loadNurses();
                    break;
                case 'support':
                    loadSupportStaff();
                    break;
                case 'vendors':
                    loadVendors();
                    break;
            }
        });
    });
    
    // Staff type change in form
    document.getElementById('staffType').addEventListener('change', function() {
        updateRoleSpecificFields(this.value);
    });
    
    // Add staff form submission
    document.getElementById('addStaffForm').addEventListener('submit', function(e) {
        e.preventDefault();
        addStaffMember();
    });
    
    // Search functionality
    document.getElementById('doctorSearch').addEventListener('input', function() {
        filterStaff('doctorsList', this.value, document.getElementById('doctorDepartment').value);
    });
    
    document.getElementById('doctorDepartment').addEventListener('change', function() {
        filterStaff('doctorsList', document.getElementById('doctorSearch').value, this.value);
    });
    
    document.getElementById('nurseSearch').addEventListener('input', function() {
        filterStaff('nursesList', this.value, document.getElementById('nurseWard').value, 'ward');
    });
    
    document.getElementById('nurseWard').addEventListener('change', function() {
        filterStaff('nursesList', document.getElementById('nurseSearch').value, this.value, 'ward');
    });
    
    document.getElementById('supportSearch').addEventListener('input', function() {
        filterStaff('supportList', this.value, document.getElementById('supportRole').value, 'role');
    });
    
    document.getElementById('supportRole').addEventListener('change', function() {
        filterStaff('supportList', document.getElementById('supportSearch').value, this.value, 'role');
    });
    
    document.getElementById('vendorSearch').addEventListener('input', function() {
        filterStaff('vendorsList', this.value, document.getElementById('vendorType').value, 'vendor_type');
    });
    
    document.getElementById('vendorType').addEventListener('change', function() {
        filterStaff('vendorsList', document.getElementById('vendorSearch').value, this.value, 'vendor_type');
    });
}

function updateRoleSpecificFields(staffType) {
    const roleSpecificGroup = document.getElementById('roleSpecificGroup');
    roleSpecificGroup.innerHTML = '';
    
    switch(staffType) {
        case 'Doctor':
            roleSpecificGroup.innerHTML = `
                <div class="form-group">
                    <label for="specialization">Specialization</label>
                    <input type="text" id="specialization" required>
                </div>
                <div class="form-group">
                    <label for="department">Department</label>
                    <select id="department" required>
                        <option value="">Select Department</option>
                        <option value="Cardiology">Cardiology</option>
                        <option value="Neurology">Neurology</option>
                        <option value="Pediatrics">Pediatrics</option>
                        <option value="Oncology">Oncology</option>
                        <option value="Orthopedics">Orthopedics</option>
                        <option value="General">General</option>
                    </select>
                </div>
                <div class="form-group">
                    <label for="licenseNumber">License Number</label>
                    <input type="text" id="licenseNumber" required>
                </div>
            `;
            break;
            
        case 'Nurse':
            roleSpecificGroup.innerHTML = `
                <div class="form-group">
                    <label for="ward">Ward</label>
                    <select id="ward" required>
                        <option value="">Select Ward</option>
                        <option value="Emergency">Emergency</option>
                        <option value="ICU">ICU</option>
                        <option value="Pediatrics">Pediatrics</option>
                        <option value="Maternity">Maternity</option>
                        <option value="General">General</option>
                    </select>
                </div>
                <div class="form-group">
                    <label for="nursingLicense">Nursing License</label>
                    <input type="text" id="nursingLicense" required>
                </div>
                <div class="form-group">
                    <label for="shift">Shift</label>
                    <select id="shift" required>
                        <option value="">Select Shift</option>
                        <option value="Morning">Morning (7AM - 3PM)</option>
                        <option value="Afternoon">Afternoon (3PM - 11PM)</option>
                        <option value="Night">Night (11PM - 7AM)</option>
                        <option value="Flexible">Flexible</option>
                    </select>
                </div>
            `;
            break;
            
        case 'Support':
            roleSpecificGroup.innerHTML = `
                <div class="form-group">
                    <label for="role">Role</label>
                    <select id="role" required>
                        <option value="">Select Role</option>
                        <option value="Janitor">Janitor</option>
                        <option value="Security">Security</option>
                        <option value="Maintenance">Maintenance</option>
                        <option value="Administrative">Administrative</option>
                    </select>
                </div>
                <div class="form-group">
                    <label for="shift">Shift</label>
                    <select id="shift" required>
                        <option value="">Select Shift</option>
                        <option value="Morning">Morning (7AM - 3PM)</option>
                        <option value="Afternoon">Afternoon (3PM - 11PM)</option>
                        <option value="Night">Night (11PM - 7AM)</option>
                        <option value="Flexible">Flexible</option>
                    </select>
                </div>
            `;
            break;
            
        case 'Vendor':
            roleSpecificGroup.innerHTML = `
                <div class="form-group">
                    <label for="vendorType">Vendor Type</label>
                    <select id="vendorType" required>
                        <option value="">Select Vendor Type</option>
                        <option value="Medical Supplies">Medical Supplies</option>
                        <option value="Pharmaceutical">Pharmaceutical</option>
                        <option value="Food Service">Food Service</option>
                        <option value="Equipment">Equipment</option>
                    </select>
                </div>
                <div class="form-group">
                    <label for="company">Company</label>
                    <input type="text" id="company" required>
                </div>
                <div class="form-group">
                    <label for="serviceHours">Service Hours</label>
                    <input type="text" id="serviceHours" placeholder="e.g. Mon-Fri 9AM-5PM" required>
                </div>
            `;
            break;
    }
}

// Dashboard functions
function loadDashboard() {
    // Load counts
    getStaffCount('Doctor').then(count => {
        document.getElementById('doctorCount').textContent = count;
    });
    
    getStaffCount('Nurse').then(count => {
        document.getElementById('nurseCount').textContent = count;
    });
    
    getStaffCount('Support').then(count => {
        document.getElementById('supportCount').textContent = count;
    });
    
    getStaffCount('Vendor').then(count => {
        document.getElementById('vendorCount').textContent = count;
    });
    
    // Load recent staff
    getRecentStaff().then(staff => {
        const recentStaffContainer = document.getElementById('recentStaff');
        recentStaffContainer.innerHTML = '';
        
        if (staff.length === 0) {
            recentStaffContainer.innerHTML = '<p>No recent staff additions found.</p>';
            return;
        }
        
        staff.forEach(member => {
            recentStaffContainer.appendChild(createStaffCard(member));
        });
    });
}

// Staff loading functions
function loadDoctors() {
    getAllStaff('Doctor').then(doctors => {
        const doctorsList = document.getElementById('doctorsList');
        doctorsList.innerHTML = '';
        
        if (doctors.length === 0) {
            doctorsList.innerHTML = '<p>No doctors found.</p>';
            return;
        }
        
        doctors.forEach(doctor => {
            doctorsList.appendChild(createStaffCard(doctor));
        });
    });
}

function loadNurses() {
    getAllStaff('Nurse').then(nurses => {
        const nursesList = document.getElementById('nursesList');
        nursesList.innerHTML = '';
        
        if (nurses.length === 0) {
            nursesList.innerHTML = '<p>No nurses found.</p>';
            return;
        }
        
        nurses.forEach(nurse => {
            nursesList.appendChild(createStaffCard(nurse));
        });
    });
}

function loadSupportStaff() {
    getAllStaff('Support').then(staff => {
        const supportList = document.getElementById('supportList');
        supportList.innerHTML = '';
        
        if (staff.length === 0) {
            supportList.innerHTML = '<p>No support staff found.</p>';
            return;
        }
        
        staff.forEach(member => {
            supportList.appendChild(createStaffCard(member));
        });
    });
}

function loadVendors() {
    getAllStaff('Vendor').then(vendors => {
        const vendorsList = document.getElementById('vendorsList');
        vendorsList.innerHTML = '';
        
        if (vendors.length === 0) {
            vendorsList.innerHTML = '<p>No vendors found.</p>';
            return;
        }
        
        vendors.forEach(vendor => {
            vendorsList.appendChild(createStaffCard(vendor));
        });
    });
}

function filterStaff(containerId, searchTerm, filterValue, filterField = 'department') {
    const container = document.getElementById(containerId);
    const cards = container.querySelectorAll('.staff-card');
    
    cards.forEach(card => {
        const name = card.querySelector('.staff-name').textContent.toLowerCase();
        const matchesSearch = name.includes(searchTerm.toLowerCase());
        
        let matchesFilter = true;
        if (filterValue) {
            const roleInfo = JSON.parse(card.dataset.roleInfo);
            matchesFilter = roleInfo[filterField] === filterValue;
        }
        
        if (matchesSearch && matchesFilter) {
            card.style.display = 'block';
        } else {
            card.style.display = 'none';
        }
    });
}

// Staff card creation
function createStaffCard(staff) {
    const card = document.createElement('div');
    card.className = 'staff-card';
    card.dataset.id = staff.id;
    
    // Add role-specific info as data attribute
    card.dataset.roleInfo = JSON.stringify(staff.role_info);
    
    let headerClass = staff.type.toLowerCase();
    if (staff.type === 'Support') {
        headerClass = staff.role_info.role.toLowerCase();
    }
    
    const photoUrl = staff.photo || '';
    const photoDisplay = photoUrl ? 
        `<img src="${photoUrl}" alt="${staff.first_name} ${staff.last_name}" class="staff-photo">` :
        `<div class="staff-photo">${staff.first_name.charAt(0)}${staff.last_name.charAt(0)}</div>`;
    
    let roleSpecificInfo = '';
    if (staff.type === 'Doctor') {
        roleSpecificInfo = `
            <div class="staff-detail">
                <i class="fas fa-stethoscope"></i>
                <span>${staff.role_info.specialization}</span>
            </div>
            <div class="staff-detail">
                <i class="fas fa-building"></i>
                <span>${staff.role_info.department}</span>
            </div>
            <div class="staff-detail">
                <i class="fas fa-id-card"></i>
                <span>License: ${staff.role_info.license_number}</span>
            </div>
        `;
    } else if (staff.type === 'Nurse') {
        roleSpecificInfo = `
            <div class="staff-detail">
                <i class="fas fa-procedures"></i>
                <span>${staff.role_info.ward} Ward</span>
            </div>
            <div class="staff-detail">
                <i class="fas fa-id-card"></i>
                <span>License: ${staff.role_info.nursing_license}</span>
            </div>
            <div class="staff-detail">
                <i class="fas fa-clock"></i>
                <span>${staff.role_info.shift} Shift</span>
            </div>
        `;
    } else if (staff.type === 'Support') {
        roleSpecificInfo = `
            <div class="staff-detail">
                <i class="fas fa-broom"></i>
                <span>${staff.role_info.role}</span>
            </div>
            <div class="staff-detail">
                <i class="fas fa-clock"></i>
                <span>${staff.role_info.shift} Shift</span>
            </div>
        `;
    } else if (staff.type === 'Vendor') {
        roleSpecificInfo = `
            <div class="staff-detail">
                <i class="fas fa-tag"></i>
                <span>${staff.role_info.vendor_type}</span>
            </div>
            <div class="staff-detail">
                <i class="fas fa-building"></i>
                <span>${staff.role_info.company}</span>
            </div>
            <div class="staff-detail">
                <i class="fas fa-clock"></i>
                <span>${staff.role_info.service_hours}</span>
            </div>
        `;
    }
    
    card.innerHTML = `
        <div class="staff-card-header ${headerClass}">
            ${photoDisplay}
        </div>
        <div class="staff-card-body">
            <h3 class="staff-name">${staff.first_name} ${staff.last_name}</h3>
            <p class="staff-role">${staff.type}${staff.type === 'Support' ? ` (${staff.role_info.role})` : ''}</p>
            <div class="staff-details">
                <div class="staff-detail">
                    <i class="fas fa-envelope"></i>
                    <span>${staff.email}</span>
                </div>
                <div class="staff-detail">
                    <i class="fas fa-phone"></i>
                    <span>${staff.phone}</span>
                </div>
                <div class="staff-detail">
                    <i class="fas fa-calendar-alt"></i>
                    <span>Joined: ${new Date(staff.hire_date).toLocaleDateString()}</span>
                </div>
                ${roleSpecificInfo}
            </div>
        </div>
        <div class="staff-card-footer">
            <button class="btn btn-primary btn-sm" onclick="viewStaffDetails(${staff.id})">
                <i class="fas fa-eye"></i> View
            </button>
            <button class="btn btn-danger btn-sm" onclick="deleteStaff(${staff.id})">
                <i class="fas fa-trash"></i> Delete
            </button>
        </div>
    `;
    
    return card;
}

// Staff details modal
function viewStaffDetails(id) {
    getStaffById(id).then(staff => {
        if (!staff) {
            alert('Staff member not found');
            return;
        }
        
        const modalContent = document.getElementById('modalContent');
        modalContent.innerHTML = `
            <h2>${staff.first_name} ${staff.last_name}</h2>
            <p><strong>Role:</strong> ${staff.type}${staff.type === 'Support' ? ` (${staff.role_info.role})` : ''}</p>
            <p><strong>Email:</strong> ${staff.email}</p>
            <p><strong>Phone:</strong> ${staff.phone}</p>
            <p><strong>Hire Date:</strong> ${new Date(staff.hire_date).toLocaleDateString()}</p>
            
            <h3>Role Details</h3>
            ${renderRoleDetails(staff)}
            
            <div class="form-actions">
                <button class="btn btn-secondary" onclick="closeModal()">
                    <i class="fas fa-times"></i> Close
                </button>
            </div>
        `;
        
        document.getElementById('staffModal').style.display = 'flex';
    });
}

function renderRoleDetails(staff) {
    if (staff.type === 'Doctor') {
        return `
            <p><strong>Specialization:</strong> ${staff.role_info.specialization}</p>
            <p><strong>Department:</strong> ${staff.role_info.department}</p>
            <p><strong>License Number:</strong> ${staff.role_info.license_number}</p>
        `;
    } else if (staff.type === 'Nurse') {
        return `
            <p><strong>Ward:</strong> ${staff.role_info.ward}</p>
            <p><strong>Nursing License:</strong> ${staff.role_info.nursing_license}</p>
            <p><strong>Shift:</strong> ${staff.role_info.shift}</p>
        `;
    } else if (staff.type === 'Support') {
        return `
            <p><strong>Role:</strong> ${staff.role_info.role}</p>
            <p><strong>Shift:</strong> ${staff.role_info.shift}</p>
        `;
    } else if (staff.type === 'Vendor') {
        return `
            <p><strong>Vendor Type:</strong> ${staff.role_info.vendor_type}</p>
            <p><strong>Company:</strong> ${staff.role_info.company}</p>
            <p><strong>Service Hours:</strong> ${staff.role_info.service_hours}</p>
        `;
    }
    return '';
}

function closeModal() {
    document.getElementById('staffModal').style.display = 'none';
}

// Add staff function
function addStaffMember() {
    const staffType = document.getElementById('staffType').value;
    const firstName = document.getElementById('firstName').value;
    const lastName = document.getElementById('lastName').value;
    const email = document.getElementById('email').value;
    const phone = document.getElementById('phone').value;
    const hireDate = document.getElementById('hireDate').value;
    const photo = document.getElementById('photo').value;
    
    let roleInfo = {};
    
    switch(staffType) {
        case 'Doctor':
            roleInfo = {
                specialization: document.getElementById('specialization').value,
                department: document.getElementById('department').value,
                license_number: document.getElementById('licenseNumber').value
            };
            break;
            
        case 'Nurse':
            roleInfo = {
                ward: document.getElementById('ward').value,
                nursing_license: document.getElementById('nursingLicense').value,
                shift: document.getElementById('shift').value
            };
            break;
            
        case 'Support':
            roleInfo = {
                role: document.getElementById('role').value,
                shift: document.getElementById('shift').value
            };
            break;
            
        case 'Vendor':
            roleInfo = {
                vendor_type: document.getElementById('vendorType').value,
                company: document.getElementById('company').value,
                service_hours: document.getElementById('serviceHours').value
            };
            break;
    }
    
    const staffData = {
        type: staffType,
        first_name: firstName,
        last_name: lastName,
        email: email,
        phone: phone,
        hire_date: hireDate,
        photo: photo,
        role_info: JSON.stringify(roleInfo)
    };
    
    addStaff(staffData).then(() => {
        alert('Staff member added successfully!');
        document.getElementById('addStaffForm').reset();
        
        // Reload the appropriate section
        switch(staffType) {
            case 'Doctor':
                loadDoctors();
                break;
            case 'Nurse':
                loadNurses();
                break;
            case 'Support':
                loadSupportStaff();
                break;
            case 'Vendor':
                loadVendors();
                break;
        }
        
        // Also update dashboard
        loadDashboard();
    }).catch(error => {
        console.error('Error adding staff:', error);
        alert('Failed to add staff member. Please try again.');
    });
}

// Delete staff function
function deleteStaff(id) {
    if (!confirm('Are you sure you want to delete this staff member?')) {
        return;
    }
    
    removeStaff(id).then(() => {
        // Remove the card from the UI
        const card = document.querySelector(`.staff-card[data-id="${id}"]`);
        if (card) {
            card.remove();
        }
        
        // Update dashboard counts
        loadDashboard();
    }).catch(error => {
        console.error('Error deleting staff:', error);
        alert('Failed to delete staff member. Please try again.');
    });
}

// Close modal when clicking outside
window.addEventListener('click', function(event) {
    const modal = document.getElementById('staffModal');
    if (event.target === modal) {
        closeModal();
    }
});