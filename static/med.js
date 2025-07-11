// Backend Simulation
let medicalData = [];

// DOM Elements
const themeToggler = document.querySelector('.theme-toggler');
const articlesContainer = document.getElementById('articlesContainer');
const loadingElement = document.getElementById('loading');

// API Configuration - Using FDA API (no CORS proxy needed)
const API_URL = 'https://api.fda.gov/drug/event.json?limit=5';
const FALLBACK_DATA = [
  {
    "title": "Adverse Event Report",
    "description": "Report of adverse events related to medication use",
    "url": "https://www.fda.gov/safety/medwatch-fda-safety-information-and-adverse-event-reporting-program",
    "date": "2023-08-15"
  },
  {
    "title": "Drug Safety Communication",
    "description": "Important safety information about prescription medications",
    "url": "https://www.fda.gov/drugs/drug-safety-and-availability/drug-safety-communications",
    "date": "2023-07-22"
  },
  {
    "title": "Medication Guide",
    "description": "Patient information for safe medication use",
    "url": "https://www.fda.gov/drugs/drug-information-consumers/medication-guides",
    "date": "2023-06-10"
  }
];

// Notification System
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    const container = document.getElementById('notificationContainer');
    container.appendChild(notification);
    notification.style.display = 'block';
    
    setTimeout(() => {
        notification.remove();
    }, 5000);
}

// Theme Toggler
function toggleTheme() {
    document.body.classList.toggle('dark-theme-variables');
    document.querySelectorAll('.theme-toggler span').forEach(span => {
        span.classList.toggle('active');
    });
    localStorage.setItem('theme', document.body.classList.contains('dark-theme-variables') ? 'dark' : 'light');
}

// Backend Integration
async function fetchMedicalData() {
    try {
        showLoading();
        const response = await fetch(API_URL);
        
        if (!response.ok) throw new Error('Failed to fetch FDA data');
        
        const data = await response.json();
        
        // Transform FDA API response to our format
        medicalData = data.results.map(item => ({
            title: `FDA Report ${item.safetyreportid}`,
            description: `Report for ${item.patient.drug[0].medicinalproduct || 'unknown product'}`,
            url: `https://www.fda.gov/safety/medwatch-fda-safety-information-and-adverse-event-reporting-program`,
            date: item.receive_date || new Date().toISOString().split('T')[0]
        }));
        
        saveToLocalStorage();
        displayArticles();
    } catch (error) {
        showNotification(`Error: ${error.message} - Using fallback data`, 'error');
        useFallbackData();
    } finally {
        hideLoading();
    }
}

async function fetchDrugData(drugName) {
  try {
    const response = await fetch(`/api/drug-info?name=${encodeURIComponent(drugName)}`);
    const data = await response.json();

    if (!response.ok) {
      if (response.status === 404) {
        alert(data.error || "Drug not found.");
      } else {
        alert("An error occurred: " + (data.error || response.statusText));
      }
      return;
    }

    // ✅ Success — display data
    console.log("Drug Info:", data);
    displayDrugInfo(data); // or whatever function you're using
  } catch (error) {
    console.error("Fetch error:", error);
    alert("Failed to connect to the server.");
  }
}



function useFallbackData() {
    const cachedData = loadFromLocalStorage();
    if (cachedData && cachedData.length > 0) {
        medicalData = cachedData;
        displayArticles();
    } else {
        medicalData = FALLBACK_DATA;
        displayArticles();
        // Save fallback data to localStorage for next time
        saveToLocalStorage();
    }
}

function saveToLocalStorage() {
    localStorage.setItem('medicalData', JSON.stringify(medicalData));
}

function loadFromLocalStorage() {
    const data = localStorage.getItem('medicalData');
    if (data) {
        return JSON.parse(data);
    }
    return null;
}

function displayArticles() {
    articlesContainer.innerHTML = '';
    
    medicalData.forEach(article => {
        const articleCard = document.createElement('div');
        articleCard.className = 'article-card';
        articleCard.innerHTML = `
            <h2 class="article-title">${article.title}</h2>
            <div class="article-meta">${article.date}</div>
            <div class="article-body">
                ${article.description}
            </div>
            <a href="${article.url}" class="read-more" target="_blank" rel="noopener noreferrer">
                Read More →
            </a>
        `;
        articlesContainer.appendChild(articleCard);
    });
}

// UI Functions
function showLoading() {
    console.log("Loading...");
    if (loadingElement) loadingElement.style.display = 'block';
}

function hideLoading() {
    console.log("Done loading");
    if (loadingElement) loadingElement.style.display = 'none';
}

// Initialization
function initializeApp() {
    // Load theme
    if (localStorage.getItem('theme') === 'dark') {
        document.body.classList.add('dark-theme-variables');
        document.querySelector('.theme-toggler span:nth-child(2)').classList.add('active');
    }

    // Load data
    fetchMedicalData();
    fetchDrugData("Amoxicillin")
}

// Event Listeners
document.addEventListener('DOMContentLoaded', initializeApp);
if (themeToggler) {
    themeToggler.addEventListener('click', toggleTheme);
}