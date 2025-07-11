// Theme Toggle - This should be placed FIRST in your script
function setupThemeToggle() {
    const themeToggle = document.getElementById('theme-toggle');
    if (!themeToggle) return;

    const savedTheme = localStorage.getItem('theme') || 
                      (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    
    document.body.classList.toggle('dark-theme', savedTheme === 'dark');
    themeToggle.checked = savedTheme === 'dark';

    themeToggle.addEventListener('change', function() {
        const isDark = this.checked;
        document.body.classList.toggle('dark-theme', isDark);
        localStorage.setItem('theme', isDark ? 'dark' : 'light');
    });
}

// Password Strength Calculator
function calculatePasswordStrength(password) {
    const hasLower = /[a-z]/.test(password);
    const hasUpper = /[A-Z]/.test(password);
    const hasNumber = /\d/.test(password);
    const hasSpecial = /[^A-Za-z0-9]/.test(password);
    const length = password.length;

    let strength = 0;

    if (length > 0) strength += 1;
    if (length >= 8) strength += 1;
    if (hasLower && hasUpper) strength += 1;
    if (hasNumber) strength += 1;
    if (hasSpecial) strength += 1;

    if (strength <= 2) {
        return {
            level: strength,
            color: 'var(--clr-danger)',
            text: 'Weak'
        };
    } else if (strength <= 4) {
        return {
            level: strength,
            color: 'var(--clr-warning)',
            text: 'Medium'
        };
    } else {
        return {
            level: strength,
            color: 'var(--clr-success)',
            text: 'Strong'
        };
    }
}

// All other functionality - placed AFTER theme setup
function setupFormHandlers() {
    const showSignup = document.getElementById('showSignup');
    const showLogin = document.getElementById('showLogin');
    
    if (showSignup && showLogin) {
        showSignup.addEventListener('click', (e) => {
            e.preventDefault();
            document.getElementById('loginForm').style.display = 'none';
            document.getElementById('signupForm').style.display = 'block';
        });
        
        showLogin.addEventListener('click', (e) => {
            e.preventDefault();
            document.getElementById('signupForm').style.display = 'none';
            document.getElementById('loginForm').style.display = 'block';
        });
    }

    // Password visibility toggles
    document.querySelectorAll('.password-toggle').forEach(toggle => {
        toggle.addEventListener('click', function() {
            const input = this.parentElement.querySelector('input');
            if (!input) return;
            input.type = input.type === 'password' ? 'text' : 'password';
            this.classList.toggle('fa-eye-slash');
            this.classList.toggle('fa-eye');
        });
    });

    // Password Strength Indicator
    const passwordInput = document.getElementById('signup-password');
    const strengthBars = document.querySelectorAll('.strength-bar');
    const strengthText = document.querySelector('.strength-text');

    if (passwordInput && strengthBars.length && strengthText) {
        passwordInput.addEventListener('input', function() {
            const password = this.value;
            const strength = calculatePasswordStrength(password);

            // Reset all bars
            strengthBars.forEach(bar => {
                bar.style.backgroundColor = '';
            });

            // Update bars based on strength
            for (let i = 0; i < strength.level; i++) {
                strengthBars[i].style.backgroundColor = strength.color;
            }

            strengthText.textContent = strength.text;
            strengthText.style.color = strength.color;
        });
    }

    // Form submission
    const signupForm = document.getElementById('signupForm');
    if (signupForm) {
        signupForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const password = document.getElementById('signup-password').value;
            const confirm = document.getElementById('signup-confirm').value;
            
            if (password !== confirm) {
                alert('Passwords do not match!');
                return;
            }

            if (!document.getElementById('terms').checked) {
                alert('You must agree to the terms');
                return;
            }

            this.submit();
        });
    }
}

// Initialize everything when DOM loads
document.addEventListener('DOMContentLoaded', function() {
    setupThemeToggle();  // This MUST run first
    setupFormHandlers(); // This runs after

    console.log('Initialized - Theme toggle and form handlers set');
});
