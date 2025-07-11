// script.js
document.addEventListener('DOMContentLoaded', function() {
    // Initialize last updated timestamp
    const now = new Date();
    document.getElementById('lastUpdated').textContent = `Last updated: ${now.toLocaleString()}`;
    document.getElementById('data-source-date').textContent = now.toLocaleDateString();

    // Initialize map
    const map = L.map('disease-map').setView([20, 0], 2);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    // Sample data for markers (replace with real API data)
    const sampleData = [
        { lat: 40.7128, lng: -74.0060, cases: 10000, country: "USA", disease: "COVID-19" },
        { lat: 51.5074, lng: -0.1278, cases: 8000, country: "UK", disease: "COVID-19" },
        { lat: 35.6762, lng: 139.6503, cases: 5000, country: "Japan", disease: "COVID-19" },
        { lat: -33.8688, lng: 151.2093, cases: 3000, country: "Australia", disease: "COVID-19" }
    ];

    // Add markers to map
    sampleData.forEach(location => {
        const marker = L.circleMarker([location.lat, location.lng], {
            radius: Math.log(location.cases) * 2,
            fillColor: "#ff7800",
            color: "#000",
            weight: 1,
            opacity: 1,
            fillOpacity: 0.8
        }).addTo(map);

        marker.bindPopup(`
            <strong>${location.country}</strong><br>
            Disease: ${location.disease}<br>
            Cases: ${location.cases.toLocaleString()}
        `);
    });

    // Initialize charts
    const trendCtx = document.getElementById('trendChart').getContext('2d');
    const treatmentCtx = document.getElementById('treatmentChart').getContext('2d');
    const ageCtx = document.getElementById('ageChart').getContext('2d');
    const genderCtx = document.getElementById('genderChart').getContext('2d');

    // Trend Chart (Line)
    new Chart(trendCtx, {
        type: 'line',
        data: {
            labels: Array(30).fill().map((_, i) => `Day ${i+1}`),
            datasets: [{
                label: 'Confirmed Cases',
                data: Array(30).fill().map(() => Math.floor(Math.random() * 1000)),
                borderColor: 'rgba(75, 192, 192, 1)',
                backgroundColor: 'rgba(75, 192, 192, 0.2)',
                tension: 0.3,
                fill: true
            }, {
                label: 'Deaths',
                data: Array(30).fill().map(() => Math.floor(Math.random() * 100)),
                borderColor: 'rgba(255, 99, 132, 1)',
                backgroundColor: 'rgba(255, 99, 132, 0.2)',
                tension: 0.3,
                fill: true
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'top',
                },
                tooltip: {
                    mode: 'index',
                    intersect: false,
                }
            },
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });

    // Treatment Chart (Bar)
    new Chart(treatmentCtx, {
        type: 'bar',
        data: {
            labels: ['Vaccine A', 'Vaccine B', 'Antiviral X', 'Antiviral Y'],
            datasets: [{
                label: 'Recovery Rate (%)',
                data: [85, 78, 65, 72],
                backgroundColor: [
                    'rgba(54, 162, 235, 0.7)',
                    'rgba(54, 162, 235, 0.7)',
                    'rgba(255, 159, 64, 0.7)',
                    'rgba(255, 159, 64, 0.7)'
                ],
                borderColor: [
                    'rgba(54, 162, 235, 1)',
                    'rgba(54, 162, 235, 1)',
                    'rgba(255, 159, 64, 1)',
                    'rgba(255, 159, 64, 1)'
                ],
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    max: 100
                }
            }
        }
    });

    // Age Distribution Chart (Doughnut)
    new Chart(ageCtx, {
        type: 'doughnut',
        data: {
            labels: ['0-18', '19-35', '36-50', '51-65', '65+'],
            datasets: [{
                data: [15, 25, 30, 20, 10],
                backgroundColor: [
                    'rgba(255, 99, 132, 0.7)',
                    'rgba(54, 162, 235, 0.7)',
                    'rgba(255, 206, 86, 0.7)',
                    'rgba(75, 192, 192, 0.7)',
                    'rgba(153, 102, 255, 0.7)'
                ],
                borderColor: [
                    'rgba(255, 99, 132, 1)',
                    'rgba(54, 162, 235, 1)',
                    'rgba(255, 206, 86, 1)',
                    'rgba(75, 192, 192, 1)',
                    'rgba(153, 102, 255, 1)'
                ],
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'right',
                }
            }
        }
    });

    // Gender Distribution Chart (Pie)
    new Chart(genderCtx, {
        type: 'pie',
        data: {
            labels: ['Male', 'Female', 'Other'],
            datasets: [{
                data: [48, 50, 2],
                backgroundColor: [
                    'rgba(54, 162, 235, 0.7)',
                    'rgba(255, 99, 132, 0.7)',
                    'rgba(153, 102, 255, 0.7)'
                ],
                borderColor: [
                    'rgba(54, 162, 235, 1)',
                    'rgba(255, 99, 132, 1)',
                    'rgba(153, 102, 255, 1)'
                ],
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'right',
                }
            }
        }
    });

    // Update quick stats
    document.getElementById('global-cases').textContent = '12,456,789';
    document.getElementById('recovery-rate').textContent = '89.2%';
    document.getElementById('active-countries').textContent = '142';

    // Filter functionality
    document.getElementById('apply-filters').addEventListener('click', function() {
        const disease = document.getElementById('disease-select').value;
        const timeRange = document.getElementById('time-range').value;
        
        // In a real app, this would fetch new data based on filters
        alert(`Filters applied: Disease - ${disease}, Time Range - ${timeRange} days`);
    });

    // Simulate live data updates
    setInterval(() => {
        const now = new Date();
        document.getElementById('lastUpdated').textContent = `Last updated: ${now.toLocaleString()}`;
    }, 60000); // Update every minute
});