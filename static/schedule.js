// Theme Toggle Functionality
const themeToggle = document.getElementById('theme-toggle');
const body = document.body;

// Check for saved theme preference or use preferred color scheme
const savedTheme = localStorage.getItem('theme') || 
                   (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');

// Apply the saved theme
if (savedTheme === 'dark') {
    body.classList.add('dark-theme');
    themeToggle.checked = true;
}

// Theme toggle event
themeToggle.addEventListener('change', function() {
    if (this.checked) {
        body.classList.add('dark-theme');
        localStorage.setItem('theme', 'dark');
    } else {
        body.classList.remove('dark-theme');
        localStorage.setItem('theme', 'light');
    }
});

// Display current date
function updateCurrentDate() {
    const now = new Date();
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    document.getElementById('current-date').textContent = now.toLocaleDateString('en-US', options);
}

// Initialize the dashboard
function initDashboard() {
    updateCurrentDate();
    // Update date every minute (in case the page stays open past midnight)
    setInterval(updateCurrentDate, 60000);
}

document.addEventListener('DOMContentLoaded', () => {
  const popupOverlays = document.querySelectorAll('.popup-overlay');
  const closeBtns = document.querySelectorAll('.close-popup');

  // Identify plus buttons
  const addButtons = document.querySelectorAll('.btn-add');
  const appointmentPopup = document.getElementById('appointmentPopup');
  const medicationPopup = document.getElementById('medicationPopup');

  // Show correct popup on plus icon click
  addButtons[0].addEventListener('click', () => appointmentPopup.classList.remove('hidden'));
  addButtons[1].addEventListener('click', () => medicationPopup.classList.remove('hidden'));

  // Close popups
  closeBtns.forEach(btn =>
    btn.addEventListener('click', () => popupOverlays.forEach(p => p.classList.add('hidden')))
  );

  // Add Appointment
  document.getElementById('addAppointment').addEventListener('click', () => {
    const time = document.getElementById('apptTime').value;
    const doctor = document.getElementById('apptDoctor').value;
    const reason = document.getElementById('apptReason').value;

    if (!time || !doctor || !reason) return alert('Please fill all fields.');

    const list = document.querySelector('.appointments-list');
    const li = document.createElement('li');
    li.innerHTML = `
      <div class="appointment-time">${time}</div>
      <div class="appointment-details">
        <h3>${doctor}</h3>
        <p>${reason}</p>
      </div>
      <button class="btn-remind"><i class="fas fa-bell"></i></button>
    `;
    list.appendChild(li);
    appointmentPopup.classList.add('hidden');
  });

  // Schedule Medication
 document.getElementById('scheduleMed').addEventListener('click', () => {
  const time = document.getElementById('medTime').value;
  const name = document.getElementById('medName').value;
  const desc = document.getElementById('medDesc').value;

  if (!time || !name || !desc) return alert('Please fill all fields.');

  const scheduled = JSON.parse(localStorage.getItem('scheduledMeds') || '[]');
  scheduled.push({ time, name, desc });
  localStorage.setItem('scheduledMeds', JSON.stringify(scheduled));

  const redirectURL = document.getElementById('scheduleMed').dataset.redirect;
  window.location.href = redirectURL;
});

});

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', initDashboard);