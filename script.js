// Attendance Predictor JavaScript

// Chart instance
let attendanceChart = null;

function calculateAttendance() {
    // Get input values
    const totalClasses = parseInt(document.getElementById('totalClasses').value) || 0;
    const attendedClasses = parseInt(document.getElementById('attendedClasses').value) || 0;
    const minAttendance = parseInt(document.getElementById('minAttendance').value) || 75;
    const futureClasses = parseInt(document.getElementById('futureClasses').value) || 0;

    // Validate inputs
    if (!validateInputs(totalClasses, attendedClasses, minAttendance, futureClasses)) {
        return;
    }

    // Calculate current attendance percentage
    const currentPercentage = (attendedClasses / totalClasses) * 100;

    // Calculate how many classes can be bunked
    const totalFutureClasses = totalClasses + futureClasses;
    const minClassesNeeded = Math.ceil((minAttendance / 100) * totalFutureClasses);
    const classesCanBunk = Math.max(0, attendedClasses + futureClasses - minClassesNeeded);

    // Calculate future attendance if all remaining classes are attended
    const futureAttendanceIfAllAttended = ((attendedClasses + futureClasses) / totalFutureClasses) * 100;

    // Display results
    displayResults(currentPercentage, classesCanBunk, totalClasses, attendedClasses, 
                  minAttendance, futureClasses, totalFutureClasses, minClassesNeeded);

    // Calculate scenarios
    calculateScenarios(attendedClasses, totalClasses, futureClasses, minAttendance);
}

function validateInputs(totalClasses, attendedClasses, minAttendance, futureClasses) {
    const inputs = [
        { element: document.getElementById('totalClasses'), value: totalClasses, min: 1, name: 'Total Classes' },
        { element: document.getElementById('attendedClasses'), value: attendedClasses, min: 0, name: 'Attended Classes' },
        { element: document.getElementById('minAttendance'), value: minAttendance, min: 1, max: 100, name: 'Minimum Attendance' },
        { element: document.getElementById('futureClasses'), value: futureClasses, min: 0, name: 'Future Classes' }
    ];

    let isValid = true;

    inputs.forEach(input => {
        input.element.classList.remove('error', 'valid');
        
        if (input.value < input.min || (input.max && input.value > input.max)) {
            input.element.classList.add('error');
            isValid = false;
        } else {
            input.element.classList.add('valid');
        }
    });

    // Check if attended classes > total classes
    if (attendedClasses > totalClasses) {
        document.getElementById('attendedClasses').classList.add('error');
        document.getElementById('totalClasses').classList.add('error');
        alert('Attended classes cannot be more than total classes!');
        isValid = false;
    }

    if (!isValid) {
        alert('Please enter valid values for all fields!');
    }

    return isValid;
}

function displayResults(currentPercentage, classesCanBunk, totalClasses, attendedClasses, 
                       minAttendance, futureClasses, totalFutureClasses, minClassesNeeded) {
    
    // Show results section
    document.getElementById('results').classList.remove('hidden');
    
    // Update current stats
    document.getElementById('currentPercentage').textContent = currentPercentage.toFixed(1) + '%';
    document.getElementById('classesCanBunk').textContent = classesCanBunk;
    
    // Update progress bar
    updateProgressBar(currentPercentage, minAttendance);
    
    // Update prediction card
    updatePredictionCard(currentPercentage, classesCanBunk, minAttendance, totalFutureClasses, 
                        attendedClasses, futureClasses);
    
    // Create/update chart
    createAttendanceChart(totalClasses, attendedClasses, futureClasses, minAttendance);
    
    // Save calculation for PWA offline use
    if (window.pwaManager) {
        window.pwaManager.saveCalculation({
            totalClasses,
            attendedClasses,
            minAttendance,
            futureClasses,
            currentPercentage,
            classesCanBunk
        });
    }
    
    // Scroll to results
    document.getElementById('results').scrollIntoView({ behavior: 'smooth' });
}

function updateProgressBar(currentPercentage, minAttendance) {
    const progressFill = document.getElementById('progressFill');
    const progressText = document.getElementById('progressText');
    const minRequiredLabel = document.getElementById('minRequiredLabel');
    
    progressFill.style.width = Math.min(currentPercentage, 100) + '%';
    progressText.textContent = currentPercentage.toFixed(1) + '%';
    minRequiredLabel.textContent = minAttendance + '%';
    
    // Change color based on attendance
    if (currentPercentage >= minAttendance) {
        progressFill.style.background = 'linear-gradient(90deg, #28a745 0%, #20c997 100%)';
    } else if (currentPercentage >= minAttendance - 10) {
        progressFill.style.background = 'linear-gradient(90deg, #ffc107 0%, #fd7e14 100%)';
    } else {
        progressFill.style.background = 'linear-gradient(90deg, #dc3545 0%, #e74c3c 100%)';
    }
}

function updatePredictionCard(currentPercentage, classesCanBunk, minAttendance, 
                             totalFutureClasses, attendedClasses, futureClasses) {
    const predictionCard = document.getElementById('predictionCard');
    const predictionTitle = document.getElementById('predictionTitle');
    const predictionContent = document.getElementById('predictionContent');
    
    // Remove existing classes
    predictionCard.classList.remove('warning', 'danger');
    
    if (currentPercentage >= minAttendance && classesCanBunk > 0) {
        predictionTitle.innerHTML = '<i class="fas fa-check-circle"></i> Good News! You Can Bunk Some Classes';
        predictionContent.innerHTML = `
            <p><strong>✅ You can safely bunk ${classesCanBunk} classes</strong> and still maintain the minimum ${minAttendance}% attendance requirement.</p>
            <p>Your current attendance is <strong>${currentPercentage.toFixed(1)}%</strong>, which is above the required minimum.</p>
            <p><em>Remember: Even though you can bunk, attending classes helps with better understanding and grades!</em></p>
        `;
    } else if (currentPercentage >= minAttendance && classesCanBunk === 0) {
        predictionCard.classList.add('warning');
        predictionTitle.innerHTML = '<i class="fas fa-exclamation-triangle"></i> Be Careful!';
        predictionContent.innerHTML = `
            <p><strong>⚠️ You cannot afford to bunk any more classes.</strong></p>
            <p>Your current attendance is ${currentPercentage.toFixed(1)}%, which meets the requirement, but you need to attend all remaining ${futureClasses} classes to maintain it.</p>
            <p><em>Missing even one class might put you below the minimum requirement!</em></p>
        `;
    } else {
        predictionCard.classList.add('danger');
        const classesNeeded = Math.ceil((minAttendance / 100) * totalFutureClasses) - attendedClasses;
        predictionTitle.innerHTML = '<i class="fas fa-times-circle"></i> Alert: Below Minimum Attendance';
        predictionContent.innerHTML = `
            <p><strong>🚨 Your attendance is currently ${currentPercentage.toFixed(1)}%</strong>, which is below the required ${minAttendance}%.</p>
            <p>You need to attend <strong>at least ${Math.min(classesNeeded, futureClasses)} out of the next ${futureClasses} classes</strong> to meet the minimum requirement.</p>
            <p><em>Consider attending extra classes or speaking with your professor about makeup opportunities.</em></p>
        `;
    }
}

function calculateScenarios(attendedClasses, totalClasses, futureClasses, minAttendance) {
    const scenario1 = calculateScenario(attendedClasses, totalClasses, futureClasses, minAttendance, 1);
    const scenario3 = calculateScenario(attendedClasses, totalClasses, futureClasses, minAttendance, 3);
    const scenarioAll = calculateScenario(attendedClasses, totalClasses, futureClasses, minAttendance, 0);
    
    updateScenarioCard('scenario1', scenario1, 1, futureClasses);
    updateScenarioCard('scenario3', scenario3, 3, futureClasses);
    updateScenarioCard('scenarioAll', scenarioAll, 0, futureClasses);
}

function calculateScenario(attendedClasses, totalClasses, futureClasses, minAttendance, bunkedClasses) {
    const totalFutureClasses = totalClasses + futureClasses;
    const attendedFutureClasses = attendedClasses + (futureClasses - bunkedClasses);
    const finalPercentage = (attendedFutureClasses / totalFutureClasses) * 100;
    
    return {
        percentage: finalPercentage,
        safe: finalPercentage >= minAttendance,
        attendedTotal: attendedFutureClasses,
        totalClasses: totalFutureClasses
    };
}

function updateScenarioCard(elementId, scenario, bunkedClasses, futureClasses) {
    const element = document.getElementById(elementId);
    const card = element.parentElement;
    
    // Remove existing classes
    card.classList.remove('good', 'warning', 'danger');
    
    let status = '';
    let icon = '';
    
    if (scenario.safe) {
        card.classList.add('good');
        status = 'Safe ✅';
        icon = '✅';
    } else {
        card.classList.add('danger');
        status = 'Risky ❌';
        icon = '❌';
    }
    
    if (bunkedClasses === 0) {
        element.innerHTML = `
            ${icon} Final attendance: <strong>${scenario.percentage.toFixed(1)}%</strong><br>
            Status: <strong>${status}</strong><br>
            <em>Attending all ${futureClasses} remaining classes</em>
        `;
    } else {
        element.innerHTML = `
            ${icon} Final attendance: <strong>${scenario.percentage.toFixed(1)}%</strong><br>
            Status: <strong>${status}</strong><br>
            <em>Total classes attended: ${scenario.attendedTotal}/${scenario.totalClasses}</em>
        `;
    }
}

// Chart creation and management
function createAttendanceChart(totalClasses, attendedClasses, futureClasses, minAttendance) {
    const ctx = document.getElementById('attendanceChart').getContext('2d');
    
    // Destroy existing chart
    if (attendanceChart) {
        attendanceChart.destroy();
    }
    
    // Generate data points
    const dataPoints = generateChartData(totalClasses, attendedClasses, futureClasses, minAttendance);
    
    // Get theme colors
    const isDark = document.body.getAttribute('data-theme') === 'dark';
    const textColor = isDark ? '#ecf0f1' : '#333';
    const gridColor = isDark ? '#34495e' : '#e1e1e1';
    
    attendanceChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: dataPoints.labels,
            datasets: [
                {
                    label: 'Current Attendance',
                    data: dataPoints.current,
                    borderColor: '#28a745',
                    backgroundColor: 'rgba(40, 167, 69, 0.1)',
                    borderWidth: 3,
                    fill: true,
                    tension: 0.4
                },
                {
                    label: 'Predicted (All Classes)',
                    data: dataPoints.predicted,
                    borderColor: '#667eea',
                    backgroundColor: 'rgba(102, 126, 234, 0.1)',
                    borderWidth: 3,
                    borderDash: [5, 5],
                    fill: false,
                    tension: 0.4
                },
                {
                    label: 'Minimum Required',
                    data: dataPoints.minimum,
                    borderColor: '#ffc107',
                    backgroundColor: 'rgba(255, 193, 7, 0.1)',
                    borderWidth: 2,
                    fill: false
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false // Using custom legend
                },
                tooltip: {
                    backgroundColor: isDark ? '#2c3e50' : 'white',
                    titleColor: textColor,
                    bodyColor: textColor,
                    borderColor: gridColor,
                    borderWidth: 1
                }
            },
            scales: {
                x: {
                    title: {
                        display: true,
                        text: 'Classes',
                        color: textColor
                    },
                    ticks: {
                        color: textColor
                    },
                    grid: {
                        color: gridColor
                    }
                },
                y: {
                    title: {
                        display: true,
                        text: 'Attendance %',
                        color: textColor
                    },
                    ticks: {
                        color: textColor,
                        callback: function(value) {
                            return value + '%';
                        }
                    },
                    grid: {
                        color: gridColor
                    },
                    min: 0,
                    max: 100
                }
            }
        }
    });
}

function generateChartData(totalClasses, attendedClasses, futureClasses, minAttendance) {
    const totalFutureClasses = totalClasses + futureClasses;
    const labels = [];
    const current = [];
    const predicted = [];
    const minimum = [];
    
    // Generate points for current attendance
    for (let i = 1; i <= totalClasses; i++) {
        labels.push(i);
        const attendedSoFar = Math.min(attendedClasses, i);
        current.push((attendedSoFar / i) * 100);
        predicted.push(null);
        minimum.push(minAttendance);
    }
    
    // Generate points for predicted attendance (if attending all future classes)
    for (let i = totalClasses + 1; i <= totalFutureClasses; i++) {
        labels.push(i);
        current.push(null);
        const futureAttended = attendedClasses + (i - totalClasses);
        predicted.push((futureAttended / i) * 100);
        minimum.push(minAttendance);
    }
    
    return { labels, current, predicted, minimum };
}

function updateChartTheme() {
    if (!attendanceChart) return;
    
    const isDark = document.body.getAttribute('data-theme') === 'dark';
    const textColor = isDark ? '#ecf0f1' : '#333';
    const gridColor = isDark ? '#34495e' : '#e1e1e1';
    
    // Update chart colors
    attendanceChart.options.scales.x.title.color = textColor;
    attendanceChart.options.scales.x.ticks.color = textColor;
    attendanceChart.options.scales.x.grid.color = gridColor;
    
    attendanceChart.options.scales.y.title.color = textColor;
    attendanceChart.options.scales.y.ticks.color = textColor;
    attendanceChart.options.scales.y.grid.color = gridColor;
    
    attendanceChart.options.plugins.tooltip.backgroundColor = isDark ? '#2c3e50' : 'white';
    attendanceChart.options.plugins.tooltip.titleColor = textColor;
    attendanceChart.options.plugins.tooltip.bodyColor = textColor;
    attendanceChart.options.plugins.tooltip.borderColor = gridColor;
    
    attendanceChart.update();
}

// Dark mode functionality
function toggleTheme() {
    const body = document.body;
    const themeIcon = document.getElementById('themeIcon');
    
    if (body.getAttribute('data-theme') === 'dark') {
        body.removeAttribute('data-theme');
        themeIcon.className = 'fas fa-moon';
        localStorage.setItem('theme', 'light');
    } else {
        body.setAttribute('data-theme', 'dark');
        themeIcon.className = 'fas fa-sun';
        localStorage.setItem('theme', 'dark');
    }
    
    // Update chart if it exists
    if (attendanceChart) {
        updateChartTheme();
    }
}

// Load theme on page load
function loadTheme() {
    const savedTheme = localStorage.getItem('theme');
    const themeIcon = document.getElementById('themeIcon');
    
    if (savedTheme === 'dark') {
        document.body.setAttribute('data-theme', 'dark');
        themeIcon.className = 'fas fa-sun';
    }
}

// PWA Integration Functions
function loadSavedCalculation() {
    if (window.pwaManager) {
        const saved = window.pwaManager.getSavedCalculation();
        if (saved && !navigator.onLine) {
            showOfflineDataBanner(saved);
        }
    }
}

function showOfflineDataBanner(data) {
    const banner = document.createElement('div');
    banner.className = 'offline-data-banner';
    banner.innerHTML = `
        <div class="offline-banner-content">
            <i class="fas fa-wifi-slash"></i>
            <span>Showing last calculated data (offline)</span>
            <button onclick="loadOfflineData()" class="load-offline-btn">Load Data</button>
            <button onclick="dismissOfflineBanner()" class="dismiss-btn">&times;</button>
        </div>
    `;
    document.body.appendChild(banner);
    window.offlineData = data;
}

function loadOfflineData() {
    if (window.offlineData) {
        const data = window.offlineData;
        document.getElementById('totalClasses').value = data.totalClasses;
        document.getElementById('attendedClasses').value = data.attendedClasses;
        document.getElementById('minAttendance').value = data.minAttendance;
        document.getElementById('futureClasses').value = data.futureClasses;
        calculateAttendance();
        dismissOfflineBanner();
    }
}

function dismissOfflineBanner() {
    const banner = document.querySelector('.offline-data-banner');
    if (banner) {
        banner.remove();
    }
}

function checkURLParameters() {
    const urlParams = new URLSearchParams(window.location.search);
    const action = urlParams.get('action');
    
    if (action === 'calculate') {
        const firstInput = document.getElementById('totalClasses');
        if (firstInput) {
            firstInput.focus();
        }
    }
}

// Add some interactive features
document.addEventListener('DOMContentLoaded', function() {
    // Add Enter key support for inputs
    const inputs = document.querySelectorAll('input');
    inputs.forEach(input => {
        input.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                calculateAttendance();
            }
        });
        
        // Add real-time validation
        input.addEventListener('input', function() {
            this.classList.remove('error', 'valid');
        });
    });
    
    // Add button loading state
    const calculateBtn = document.querySelector('.calculate-btn');
    calculateBtn.addEventListener('click', function() {
        this.classList.add('loading');
        setTimeout(() => {
            this.classList.remove('loading');
        }, 500);
    });
});

// Add some helpful tips
function showTips() {
    const tips = [
        "💡 Tip: Maintain attendance above 80% for better academic standing!",
        "💡 Tip: Some professors may have stricter attendance policies than the institution minimum.",
        "💡 Tip: Medical emergencies are usually excused - keep documentation ready.",
        "💡 Tip: Group study sessions can help when you miss classes.",
        "💡 Tip: Building good relationships with classmates helps with notes sharing.",
        "💡 Tip: Use the chart to visualize your attendance trends!",
        "💡 Tip: Toggle dark mode for comfortable viewing in low light!"
    ];
    
    const randomTip = tips[Math.floor(Math.random() * tips.length)];
    console.log(randomTip);
}

// Initialize tips
showTips();

checkURLParameters();
loadSavedCalculation();
loadTheme();

// AdSense Integration Functions
function initializeAds() {
    // Initialize AdSense ads
    if (typeof adsbygoogle !== 'undefined') {
        // Push ads that are already on the page
        const ads = document.querySelectorAll('.adsbygoogle');
        ads.forEach(ad => {
            if (!ad.hasAttribute('data-adsbygoogle-status')) {
                adsbygoogle.push({});
            }
        });
    }
    
    // Add loading animation to ad containers
    const adContainers = document.querySelectorAll('.ad-container');
    adContainers.forEach(container => {
        container.classList.add('loading');
        
        // Remove loading animation after 3 seconds
        setTimeout(() => {
            container.classList.remove('loading');
        }, 3000);
    });
}

// Lazy load ads for better performance
function lazyLoadAds() {
    const adContainers = document.querySelectorAll('.ad-container');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const adElement = entry.target.querySelector('.adsbygoogle');
                if (adElement && !adElement.hasAttribute('data-adsbygoogle-status')) {
                    if (typeof adsbygoogle !== 'undefined') {
                        adsbygoogle.push({});
                    }
                }
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.1
    });
    
    adContainers.forEach(container => {
        observer.observe(container);
    });
}

// Initialize ads when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    // Wait for AdSense script to load
    setTimeout(() => {
        initializeAds();
        lazyLoadAds();
    }, 1000);
});
