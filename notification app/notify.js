document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const reminderForm = document.getElementById('reminder-form');
    const remindersList = document.getElementById('reminders-list');
    const searchInput = document.getElementById('search-input');
    const notificationModal = document.getElementById('notification-modal');
    const notificationContent = document.getElementById('notification-content');
    const dismissBtn = document.getElementById('dismiss-btn');
    const snoozeBtn = document.getElementById('snooze-btn');
    const closeModal = document.querySelector('.close-modal');
    const soundTestBtn = document.getElementById('sound-test-btn');
    const soundMuteBtn = document.getElementById('sound-mute-btn');
    const soundSelect = document.getElementById('sound-select');
    
    // Store reminders and settings
    let reminders = JSON.parse(localStorage.getItem('reminders')) || [];
    let activeNotification = null;
    let isMuted = localStorage.getItem('isMuted') === 'true' || false;
    let audioContext;
    
    try {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
    } catch (e) {
        console.log('Web Audio API not supported:', e);
    }
    
    // Initialize the app
    function init() {
        renderReminders();
        checkReminders();
        setInterval(checkReminders, 60000); // Check every minute
        
        // Load current time into time input for better UX
        const now = new Date();
        const hours = now.getHours().toString().padStart(2, '0');
        const minutes = now.getMinutes().toString().padStart(2, '0');
        document.getElementById('reminder-time').value = `${hours}:${minutes}`;
        
        // Initialize sound controls
        if (soundMuteBtn) {
            soundMuteBtn.innerHTML = isMuted ? 
                '<i class="fas fa-volume-mute"></i> Unmute' : 
                '<i class="fas fa-volume-up"></i> Mute';
        }
        
        // Load sound preferences
        if (soundSelect) {
            const savedSound = localStorage.getItem('notificationSound') || 'beep';
            soundSelect.value = savedSound;
        }
    }
    
    // Form submission
    reminderForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const patientName = document.getElementById('patient-name').value.trim();
        const medication = document.getElementById('medication').value.trim();
        const reminderTime = document.getElementById('reminder-time').value;
        const dosage = document.getElementById('dosage').value.trim();
        const soundType = soundSelect ? soundSelect.value : 'beep';
        
        const newReminder = {
            id: Date.now(),
            patientName,
            medication,
            reminderTime,
            dosage,
            soundType,
            snoozed: false
        };
        
        reminders.push(newReminder);
        saveReminders();
        renderReminders();
        reminderForm.reset();
        
        // Show success message
        showToast('Reminder added successfully!');
    });
    
    // Render reminders to the DOM
    function renderReminders(filteredReminders = null) {
        const remindersToRender = filteredReminders || reminders;
        
        if (remindersToRender.length === 0) {
            remindersList.innerHTML = '<p class="no-reminders">No reminders added yet.</p>';
            return;
        }
        
        remindersList.innerHTML = remindersToRender.map(reminder => `
            <div class="reminder-card" data-id="${reminder.id}">
                <div class="reminder-info">
                    <h3>${reminder.patientName}</h3>
                    <p><strong>Medication:</strong> ${reminder.medication}</p>
                    <p><strong>Dosage:</strong> ${reminder.dosage || 'Not specified'}</p>
                    <p><strong>Sound:</strong> ${formatSoundType(reminder.soundType)}</p>
                    <p class="reminder-time"><i class="far fa-clock"></i> ${formatTime(reminder.reminderTime)}</p>
                </div>
                <div class="reminder-actions">
                    <button class="btn btn-danger delete-btn"><i class="fas fa-trash"></i> Delete</button>
                </div>
            </div>
        `).join('');
        
        // Add event listeners to delete buttons
        document.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const card = this.closest('.reminder-card');
                const id = parseInt(card.dataset.id);
                deleteReminder(id);
            });
        });
    }
    
    // Delete a reminder
    function deleteReminder(id) {
        reminders = reminders.filter(reminder => reminder.id !== id);
        saveReminders();
        renderReminders();
        showToast('Reminder deleted successfully!');
    }
    
    // Save reminders to localStorage
    function saveReminders() {
        localStorage.setItem('reminders', JSON.stringify(reminders));
    }
    
    // Check if any reminders match current time
    function checkReminders() {
        const now = new Date();
        const currentHours = now.getHours().toString().padStart(2, '0');
        const currentMinutes = now.getMinutes().toString().padStart(2, '0');
        const currentTime = `${currentHours}:${currentMinutes}`;
        
        reminders.forEach(reminder => {
            if (reminder.reminderTime === currentTime && !reminder.snoozed) {
                showNotification(reminder);
            }
        });
    }
    
    // Show notification modal
    function showNotification(reminder) {
        activeNotification = reminder;
        notificationContent.innerHTML = `
            <p><strong>Patient:</strong> ${reminder.patientName}</p>
            <p><strong>Medication:</strong> ${reminder.medication}</p>
            <p><strong>Dosage:</strong> ${reminder.dosage || 'Not specified'}</p>
            <p><strong>Time:</strong> ${formatTime(reminder.reminderTime)}</p>
            <p>Please administer the medication now.</p>
        `;
        notificationModal.style.display = 'block';
        
        // Add flashing effect for visual notification
        notificationContent.classList.add('flashing');
        
        // Play notification sound if not muted
        if (!isMuted) {
            playNotificationSound(reminder.soundType);
        }
        
        // Vibrate if on mobile (optional)
        if ('vibrate' in navigator) {
            navigator.vibrate([200, 100, 200, 100, 200]);
        }
    }
    
    // Play notification sound based on type
    function playNotificationSound(soundType = 'beep') {
        if (isMuted || soundType === 'none') return;
        
        try {
            if (soundType === 'beep') {
                playBeepSound();
            } else if (soundType === 'chime') {
                playChimeSound();
            } else if (soundType === 'alarm') {
                playAlarmSound();
            }
        } catch (e) {
            console.log('Sound playback error:', e);
            // Fallback to simple beep if other sounds fail
            playBeepSound();
        }
    }
    
    // Different sound types
    function playBeepSound() {
        if (!audioContext) return;
        
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.type = 'sine';
        oscillator.frequency.value = 800;
        gainNode.gain.value = 0.5;
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.start();
        gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.5);
        oscillator.stop(audioContext.currentTime + 0.5);
    }
    
    function playChimeSound() {
        if (!audioContext) return;
        
        const frequencies = [784, 659, 523];
        const times = [0, 0.2, 0.4];
        
        frequencies.forEach((freq, i) => {
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            oscillator.type = 'sine';
            oscillator.frequency.value = freq;
            gainNode.gain.value = 0.3;
            
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            oscillator.start(audioContext.currentTime + times[i]);
            gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + times[i] + 0.3);
            oscillator.stop(audioContext.currentTime + times[i] + 0.3);
        });
    }
    
    function playAlarmSound() {
        if (!audioContext) return;
        
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.type = 'square';
        oscillator.frequency.setValueAtTime(440, audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(880, audioContext.currentTime + 0.1);
        gainNode.gain.value = 0.2;
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.start();
        gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.5);
        oscillator.stop(audioContext.currentTime + 0.5);
        
        // Repeat after a short delay
        setTimeout(() => {
            if (notificationModal.style.display === 'block') {
                playAlarmSound();
            }
        }, 600);
    }
    
    // Close modal
    function closeNotificationModal() {
        notificationModal.style.display = 'none';
        notificationContent.classList.remove('flashing');
    }
    
    // Dismiss notification
    dismissBtn.addEventListener('click', function() {
        if (activeNotification) {
            // Remove the reminder or mark it as completed
            reminders = reminders.filter(r => r.id !== activeNotification.id);
            saveReminders();
            renderReminders();
            activeNotification = null;
        }
        closeNotificationModal();
    });
    
    // Snooze notification
    snoozeBtn.addEventListener('click', function() {
        if (activeNotification) {
            // Mark as snoozed and update the time (+5 minutes)
            const reminderIndex = reminders.findIndex(r => r.id === activeNotification.id);
            if (reminderIndex !== -1) {
                const [hours, minutes] = activeNotification.reminderTime.split(':');
                const date = new Date();
                date.setHours(parseInt(hours));
                date.setMinutes(parseInt(minutes) + 5);
                
                const newHours = date.getHours().toString().padStart(2, '0');
                const newMinutes = date.getMinutes().toString().padStart(2, '0');
                
                reminders[reminderIndex].reminderTime = `${newHours}:${newMinutes}`;
                reminders[reminderIndex].snoozed = true;
                saveReminders();
                renderReminders();
                
                // Reset snoozed status after the new time passes
                setTimeout(() => {
                    const index = reminders.findIndex(r => r.id === activeNotification.id);
                    if (index !== -1) {
                        reminders[index].snoozed = false;
                        saveReminders();
                    }
                }, 5 * 60 * 1000); // 5 minutes
            }
            activeNotification = null;
        }
        closeNotificationModal();
        showToast('Reminder snoozed for 5 minutes');
    });
    
    // Close modal when clicking X
    closeModal.addEventListener('click', closeNotificationModal);
    
    // Close modal when clicking outside
    window.addEventListener('click', function(e) {
        if (e.target === notificationModal) {
            closeNotificationModal();
        }
    });
    
    // Sound test button
    if (soundTestBtn) {
        soundTestBtn.addEventListener('click', function() {
            const soundType = soundSelect ? soundSelect.value : 'beep';
            playNotificationSound(soundType);
        });
    }
    
    // Mute button
    if (soundMuteBtn) {
        soundMuteBtn.addEventListener('click', function() {
            isMuted = !isMuted;
            this.innerHTML = isMuted ? 
                '<i class="fas fa-volume-mute"></i> Unmute' : 
                '<i class="fas fa-volume-up"></i> Mute';
            localStorage.setItem('isMuted', isMuted);
            
            showToast(isMuted ? 'Notifications muted' : 'Notifications unmuted');
        });
    }
    
    // Sound selection change
    if (soundSelect) {
        soundSelect.addEventListener('change', function() {
            localStorage.setItem('notificationSound', this.value);
        });
    }
    
    // Search functionality
    searchInput.addEventListener('input', function() {
        const searchTerm = this.value.toLowerCase();
        if (searchTerm === '') {
            renderReminders();
            return;
        }
        
        const filteredReminders = reminders.filter(reminder => 
            reminder.patientName.toLowerCase().includes(searchTerm) || 
            reminder.medication.toLowerCase().includes(searchTerm)
        );
        
        renderReminders(filteredReminders);
    });
    
    // Helper functions
    function formatTime(timeString) {
        const [hours, minutes] = timeString.split(':');
        const hour = parseInt(hours);
        const ampm = hour >= 12 ? 'PM' : 'AM';
        const displayHour = hour % 12 || 12;
        return `${displayHour}:${minutes} ${ampm}`;
    }
    
    function formatSoundType(soundType) {
        const soundNames = {
            'beep': 'Default Beep',
            'chime': 'Gentle Chime',
            'alarm': 'Alarm Tone',
            'none': 'No Sound'
        };
        return soundNames[soundType] || soundType;
    }
    
    // Show toast notification
    function showToast(message) {
        const toast = document.createElement('div');
        toast.className = 'toast-notification';
        toast.textContent = message;
        document.body.appendChild(toast);
        
        setTimeout(() => {
            toast.classList.add('show');
            setTimeout(() => {
                toast.classList.remove('show');
                setTimeout(() => {
                    document.body.removeChild(toast);
                }, 300);
            }, 3000);
        }, 100);
    }
    
    // Add toast styles dynamically
    const style = document.createElement('style');
    style.textContent = `
        .toast-notification {
            position: fixed;
            bottom: 20px;
            left: 50%;
            transform: translateX(-50%);
            background-color: var(--primary-color);
            color: white;
            padding: 12px 24px;
            border-radius: var(--border-radius);
            box-shadow: var(--box-shadow);
            z-index: 1000;
            opacity: 0;
            transition: opacity 0.3s;
        }
        .toast-notification.show {
            opacity: 1;
        }
        .no-reminders {
            text-align: center;
            color: var(--gray-color);
            padding: 20px;
        }
    `;
    document.head.appendChild(style);
    
    // Initialize the app
    init();
});