// Attendance Predictor JavaScript

// Chart instance
let attendanceChart = null;

// --- Subject Management ---
let subjects = [];
let selectedSubjectId = null;

function loadSubjects() {
    const stored = localStorage.getItem('subjects');
    subjects = stored ? JSON.parse(stored) : [];
    renderSubjectsList();
}

function saveSubjects() {
    localStorage.setItem('subjects', JSON.stringify(subjects));
}

function renderSubjectsList() {
    const list = document.getElementById('subjects-list');
    list.innerHTML = '';
    if (subjects.length === 0) {
        list.innerHTML = '<div class="help-text">No subjects added yet. Click "Add Subject" to begin.</div>';
        return;
    }
    subjects.forEach(subj => {
        const div = document.createElement('div');
        div.className = 'subject-item' + (subj.id === selectedSubjectId ? ' selected' : '');
        div.innerHTML = `
            <span>${subj.name}</span>
            <span class="subject-actions">
                <button title="Edit" onclick="editSubject('${subj.id}')"><i class="fas fa-edit"></i></button>
                <button title="Delete" onclick="deleteSubject('${subj.id}')"><i class="fas fa-trash"></i></button>
                <button title="Select" onclick="selectSubject('${subj.id}')"><i class="fas fa-check"></i></button>
            </span>
        `;
        list.appendChild(div);
    });
}

function showAddSubjectForm() {
    document.getElementById('subject-form').classList.remove('hidden');
    document.getElementById('subjectId').value = '';
    document.getElementById('subjectName').value = '';
    document.getElementById('subjectTotalClasses').value = '';
    document.getElementById('subjectAttendedClasses').value = '';
    document.getElementById('subjectMinAttendance').value = 75;
    document.getElementById('subjectFutureClasses').value = 20;
}

function hideSubjectForm() {
    document.getElementById('subject-form').classList.add('hidden');
}

function saveSubject(e) {
    e.preventDefault();
    const id = document.getElementById('subjectId').value || Date.now().toString();
    const name = document.getElementById('subjectName').value.trim();
    const totalClasses = parseInt(document.getElementById('subjectTotalClasses').value) || 0;
    const attendedClasses = parseInt(document.getElementById('subjectAttendedClasses').value) || 0;
    const minAttendance = parseInt(document.getElementById('subjectMinAttendance').value) || 75;
    const futureClasses = parseInt(document.getElementById('subjectFutureClasses').value) || 0;
    if (!name || totalClasses < 1 || attendedClasses < 0 || minAttendance < 1 || minAttendance > 100 || futureClasses < 0) {
        alert('Please enter valid values for all fields!');
        return;
    }
    const subj = { id, name, totalClasses, attendedClasses, minAttendance, futureClasses };
    const idx = subjects.findIndex(s => s.id === id);
    if (idx >= 0) {
        subjects[idx] = subj;
    } else {
        subjects.push(subj);
    }
    saveSubjects();
    hideSubjectForm();
    renderSubjectsList();
}

function editSubject(id) {
    const subj = subjects.find(s => s.id === id);
    if (!subj) return;
    document.getElementById('subject-form').classList.remove('hidden');
    document.getElementById('subjectId').value = subj.id;
    document.getElementById('subjectName').value = subj.name;
    document.getElementById('subjectTotalClasses').value = subj.totalClasses;
    document.getElementById('subjectAttendedClasses').value = subj.attendedClasses;
    document.getElementById('subjectMinAttendance').value = subj.minAttendance;
    document.getElementById('subjectFutureClasses').value = subj.futureClasses;
}

function deleteSubject(id) {
    if (!confirm('Delete this subject?')) return;
    subjects = subjects.filter(s => s.id !== id);
    if (selectedSubjectId === id) selectedSubjectId = null;
    saveSubjects();
    renderSubjectsList();
}

function selectSubject(id) {
    selectedSubjectId = id;
    const subj = subjects.find(s => s.id === id);
    if (!subj) return;
    // Populate attendance form
    document.getElementById('totalClasses').value = subj.totalClasses;
    document.getElementById('attendedClasses').value = subj.attendedClasses;
    document.getElementById('minAttendance').value = subj.minAttendance;
    document.getElementById('futureClasses').value = subj.futureClasses;
    renderSubjectsList();
}

// When attendance is calculated, save back to subject if selected
const originalCalculateAttendance = calculateAttendance;
calculateAttendance = function() {
    originalCalculateAttendance();
    if (selectedSubjectId) {
        // Save form values to subject
        const subj = subjects.find(s => s.id === selectedSubjectId);
        if (subj) {
            subj.totalClasses = parseInt(document.getElementById('totalClasses').value) || 0;
            subj.attendedClasses = parseInt(document.getElementById('attendedClasses').value) || 0;
            subj.minAttendance = parseInt(document.getElementById('minAttendance').value) || 75;
            subj.futureClasses = parseInt(document.getElementById('futureClasses').value) || 0;
            saveSubjects();
            renderSubjectsList();
        }
    }
};

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

// --- Grades Management ---
function getSelectedSubject() {
    return subjects.find(s => s.id === selectedSubjectId);
}

function renderGradesSection() {
    const gradesSection = document.getElementById('grades-section');
    const subj = getSelectedSubject();
    if (!subj) {
        gradesSection.classList.add('hidden');
        return;
    }
    gradesSection.classList.remove('hidden');
    if (!subj.grades) subj.grades = [];
    renderGradesList(subj.grades);
    renderGradesSummary(subj.grades);
}

function renderGradesList(grades) {
    const list = document.getElementById('grades-list');
    list.innerHTML = '';
    if (!grades || grades.length === 0) {
        list.innerHTML = '<div class="help-text">No grades added yet. Click "Add Grade" to begin.</div>';
        return;
    }
    grades.forEach(grade => {
        const div = document.createElement('div');
        div.className = 'grade-item';
        div.innerHTML = `
            <span><strong>${grade.type}:</strong> ${grade.title} (${grade.score}/${grade.maxScore}${grade.date ? ', ' + grade.date : ''})</span>
            <span class="grade-actions">
                <button title="Edit" onclick="editGrade('${grade.id}')"><i class="fas fa-edit"></i></button>
                <button title="Delete" onclick="deleteGrade('${grade.id}')"><i class="fas fa-trash"></i></button>
            </span>
        `;
        list.appendChild(div);
    });
}

function showAddGradeForm() {
    document.getElementById('grade-form').classList.remove('hidden');
    document.getElementById('gradeId').value = '';
    document.getElementById('gradeType').value = 'Assignment';
    document.getElementById('gradeTitle').value = '';
    document.getElementById('gradeScore').value = '';
    document.getElementById('gradeMaxScore').value = '';
    document.getElementById('gradeDate').value = '';
}

function hideGradeForm() {
    document.getElementById('grade-form').classList.add('hidden');
}

function saveGrade(e) {
    e.preventDefault();
    const subj = getSelectedSubject();
    if (!subj) return;
    if (!subj.grades) subj.grades = [];
    const id = document.getElementById('gradeId').value || Date.now().toString();
    const type = document.getElementById('gradeType').value;
    const title = document.getElementById('gradeTitle').value.trim();
    const score = parseFloat(document.getElementById('gradeScore').value);
    const maxScore = parseFloat(document.getElementById('gradeMaxScore').value);
    const date = document.getElementById('gradeDate').value;
    if (!title || isNaN(score) || isNaN(maxScore) || maxScore < 1 || score < 0 || score > maxScore) {
        alert('Please enter valid values for all fields!');
        return;
    }
    const grade = { id, type, title, score, maxScore, date };
    const idx = subj.grades.findIndex(g => g.id === id);
    if (idx >= 0) {
        subj.grades[idx] = grade;
    } else {
        subj.grades.push(grade);
    }
    saveSubjects();
    hideGradeForm();
    renderGradesSection();
}

function editGrade(id) {
    const subj = getSelectedSubject();
    if (!subj || !subj.grades) return;
    const grade = subj.grades.find(g => g.id === id);
    if (!grade) return;
    document.getElementById('grade-form').classList.remove('hidden');
    document.getElementById('gradeId').value = grade.id;
    document.getElementById('gradeType').value = grade.type;
    document.getElementById('gradeTitle').value = grade.title;
    document.getElementById('gradeScore').value = grade.score;
    document.getElementById('gradeMaxScore').value = grade.maxScore;
    document.getElementById('gradeDate').value = grade.date || '';
}

function deleteGrade(id) {
    if (!confirm('Delete this grade?')) return;
    const subj = getSelectedSubject();
    if (!subj || !subj.grades) return;
    subj.grades = subj.grades.filter(g => g.id !== id);
    saveSubjects();
    renderGradesSection();
}

function renderGradesSummary(grades) {
    const summary = document.getElementById('grades-summary');
    if (!grades || grades.length === 0) {
        summary.innerHTML = '';
        return;
    }
    const total = grades.reduce((acc, g) => acc + g.score, 0);
    const max = grades.reduce((acc, g) => acc + g.maxScore, 0);
    const avg = (total / max) * 100;
    summary.innerHTML = `
        <strong>Total:</strong> ${total} / ${max}<br>
        <strong>Average:</strong> ${avg.toFixed(1)}%
    `;
}

// --- Timetable Management ---
function renderTimetableSection() {
    const timetableSection = document.getElementById('timetable-section');
    const subj = getSelectedSubject();
    if (!subj) {
        timetableSection.classList.add('hidden');
        return;
    }
    timetableSection.classList.remove('hidden');
    if (!subj.timetable) subj.timetable = [];
    renderTimetableList(subj.timetable);
}

function renderTimetableList(timetable) {
    const list = document.getElementById('timetable-list');
    list.innerHTML = '';
    if (!timetable || timetable.length === 0) {
        list.innerHTML = '<div class="help-text">No class times added yet. Click "Add Class Time" to begin.</div>';
        return;
    }
    timetable.forEach(entry => {
        const div = document.createElement('div');
        div.className = 'timetable-item';
        div.innerHTML = `
            <span><strong>${entry.day}:</strong> ${entry.start} - ${entry.end}</span>
            <span class="timetable-actions">
                <button title="Edit" onclick="editTimetableEntry('${entry.id}')"><i class="fas fa-edit"></i></button>
                <button title="Delete" onclick="deleteTimetableEntry('${entry.id}')"><i class="fas fa-trash"></i></button>
            </span>
        `;
        list.appendChild(div);
    });
}

function showAddTimetableForm() {
    document.getElementById('timetable-form').classList.remove('hidden');
    document.getElementById('timetableId').value = '';
    document.getElementById('timetableDay').value = 'Monday';
    document.getElementById('timetableStart').value = '';
    document.getElementById('timetableEnd').value = '';
}

function hideTimetableForm() {
    document.getElementById('timetable-form').classList.add('hidden');
}

function saveTimetableEntry(e) {
    e.preventDefault();
    const subj = getSelectedSubject();
    if (!subj) return;
    if (!subj.timetable) subj.timetable = [];
    const id = document.getElementById('timetableId').value || Date.now().toString();
    const day = document.getElementById('timetableDay').value;
    const start = document.getElementById('timetableStart').value;
    const end = document.getElementById('timetableEnd').value;
    if (!day || !start || !end || start >= end) {
        alert('Please enter valid values for all fields!');
        return;
    }
    const entry = { id, day, start, end };
    const idx = subj.timetable.findIndex(t => t.id === id);
    if (idx >= 0) {
        subj.timetable[idx] = entry;
    } else {
        subj.timetable.push(entry);
    }
    saveSubjects();
    hideTimetableForm();
    renderTimetableSection();
}

function editTimetableEntry(id) {
    const subj = getSelectedSubject();
    if (!subj || !subj.timetable) return;
    const entry = subj.timetable.find(t => t.id === id);
    if (!entry) return;
    document.getElementById('timetable-form').classList.remove('hidden');
    document.getElementById('timetableId').value = entry.id;
    document.getElementById('timetableDay').value = entry.day;
    document.getElementById('timetableStart').value = entry.start;
    document.getElementById('timetableEnd').value = entry.end;
}

function deleteTimetableEntry(id) {
    if (!confirm('Delete this class time?')) return;
    const subj = getSelectedSubject();
    if (!subj || !subj.timetable) return;
    subj.timetable = subj.timetable.filter(t => t.id !== id);
    saveSubjects();
    renderTimetableSection();
}

// --- Reminders Management ---
function renderRemindersSection() {
    const remindersSection = document.getElementById('reminders-section');
    const subj = getSelectedSubject();
    if (!subj) {
        remindersSection.classList.add('hidden');
        return;
    }
    remindersSection.classList.remove('hidden');
    if (!subj.reminders) subj.reminders = [];
    renderRemindersList(subj.reminders);
}

function renderRemindersList(reminders) {
    const list = document.getElementById('reminders-list');
    list.innerHTML = '';
    if (!reminders || reminders.length === 0) {
        list.innerHTML = '<div class="help-text">No reminders added yet. Click "Add Reminder" to begin.</div>';
        return;
    }
    reminders.forEach(reminder => {
        const div = document.createElement('div');
        div.className = 'reminder-item';
        div.innerHTML = `
            <span><strong>${reminder.type}:</strong> ${reminder.title} (${reminder.date}${reminder.notes ? ', ' + reminder.notes : ''})</span>
            <span class="reminder-actions">
                <button title="Edit" onclick="editReminder('${reminder.id}')"><i class="fas fa-edit"></i></button>
                <button title="Delete" onclick="deleteReminder('${reminder.id}')"><i class="fas fa-trash"></i></button>
            </span>
        `;
        list.appendChild(div);
    });
}

function showAddReminderForm() {
    document.getElementById('reminder-form').classList.remove('hidden');
    document.getElementById('reminderId').value = '';
    document.getElementById('reminderType').value = 'Assignment';
    document.getElementById('reminderTitle').value = '';
    document.getElementById('reminderDate').value = '';
    document.getElementById('reminderNotes').value = '';
}

function hideReminderForm() {
    document.getElementById('reminder-form').classList.add('hidden');
}

function saveReminder(e) {
    e.preventDefault();
    const subj = getSelectedSubject();
    if (!subj) return;
    if (!subj.reminders) subj.reminders = [];
    const id = document.getElementById('reminderId').value || Date.now().toString();
    const type = document.getElementById('reminderType').value;
    const title = document.getElementById('reminderTitle').value.trim();
    const date = document.getElementById('reminderDate').value;
    const notes = document.getElementById('reminderNotes').value.trim();
    if (!title || !date) {
        alert('Please enter valid values for all fields!');
        return;
    }
    const reminder = { id, type, title, date, notes };
    const idx = subj.reminders.findIndex(r => r.id === id);
    if (idx >= 0) {
        subj.reminders[idx] = reminder;
    } else {
        subj.reminders.push(reminder);
    }
    saveSubjects();
    hideReminderForm();
    renderRemindersSection();
}

function editReminder(id) {
    const subj = getSelectedSubject();
    if (!subj || !subj.reminders) return;
    const reminder = subj.reminders.find(r => r.id === id);
    if (!reminder) return;
    document.getElementById('reminder-form').classList.remove('hidden');
    document.getElementById('reminderId').value = reminder.id;
    document.getElementById('reminderType').value = reminder.type;
    document.getElementById('reminderTitle').value = reminder.title;
    document.getElementById('reminderDate').value = reminder.date;
    document.getElementById('reminderNotes').value = reminder.notes || '';
}

function deleteReminder(id) {
    if (!confirm('Delete this reminder?')) return;
    const subj = getSelectedSubject();
    if (!subj || !subj.reminders) return;
    subj.reminders = subj.reminders.filter(r => r.id !== id);
    saveSubjects();
    renderRemindersSection();
}

// --- Attendance Rules Management ---
function renderAttendanceRulesSection() {
    const rulesSection = document.getElementById('attendance-rules-section');
    const subj = getSelectedSubject();
    if (!subj) {
        rulesSection.classList.add('hidden');
        return;
    }
    rulesSection.classList.remove('hidden');
    if (!subj.attendanceRules) {
        subj.attendanceRules = { weighted: false, components: [], excludeDays: [] };
    }
    document.getElementById('weightedAttendance').checked = !!subj.attendanceRules.weighted;
    renderComponentsList(subj.attendanceRules.components, subj.attendanceRules.weighted);
    document.querySelector('.add-component-btn').classList.toggle('hidden', !subj.attendanceRules.weighted);
    document.getElementById('excludeDays').value = (subj.attendanceRules.excludeDays || []).join(', ');
}

function toggleWeightedAttendance() {
    const subj = getSelectedSubject();
    if (!subj) return;
    subj.attendanceRules.weighted = document.getElementById('weightedAttendance').checked;
    saveSubjects();
    renderAttendanceRulesSection();
}

function renderComponentsList(components, weighted) {
    const list = document.getElementById('attendance-components-list');
    list.innerHTML = '';
    if (!weighted) {
        list.innerHTML = '<div class="help-text">Weighted attendance is off. All classes are treated equally.</div>';
        return;
    }
    if (!components || components.length === 0) {
        list.innerHTML = '<div class="help-text">No components added yet. Click "Add Component" to begin.</div>';
        return;
    }
    components.forEach(comp => {
        const div = document.createElement('div');
        div.className = 'component-item';
        div.innerHTML = `
            <span><strong>${comp.type}:</strong> Weight: ${comp.weight}, Min %: ${comp.minPercent}</span>
            <span class="component-actions">
                <button title="Edit" onclick="editComponent('${comp.id}')"><i class="fas fa-edit"></i></button>
                <button title="Delete" onclick="deleteComponent('${comp.id}')"><i class="fas fa-trash"></i></button>
            </span>
        `;
        list.appendChild(div);
    });
}

function showAddComponentForm() {
    document.getElementById('component-form').classList.remove('hidden');
    document.getElementById('componentId').value = '';
    document.getElementById('componentType').value = '';
    document.getElementById('componentWeight').value = 1;
    document.getElementById('componentMinPercent').value = 75;
}

function hideComponentForm() {
    document.getElementById('component-form').classList.add('hidden');
}

function saveComponent(e) {
    e.preventDefault();
    const subj = getSelectedSubject();
    if (!subj) return;
    if (!subj.attendanceRules) subj.attendanceRules = { weighted: false, components: [], excludeDays: [] };
    const id = document.getElementById('componentId').value || Date.now().toString();
    const type = document.getElementById('componentType').value.trim();
    const weight = parseInt(document.getElementById('componentWeight').value) || 1;
    const minPercent = parseInt(document.getElementById('componentMinPercent').value) || 75;
    if (!type || weight < 1 || minPercent < 1 || minPercent > 100) {
        alert('Please enter valid values for all fields!');
        return;
    }
    const comp = { id, type, weight, minPercent };
    const idx = subj.attendanceRules.components.findIndex(c => c.id === id);
    if (idx >= 0) {
        subj.attendanceRules.components[idx] = comp;
    } else {
        subj.attendanceRules.components.push(comp);
    }
    saveSubjects();
    hideComponentForm();
    renderAttendanceRulesSection();
}

function editComponent(id) {
    const subj = getSelectedSubject();
    if (!subj || !subj.attendanceRules) return;
    const comp = subj.attendanceRules.components.find(c => c.id === id);
    if (!comp) return;
    document.getElementById('component-form').classList.remove('hidden');
    document.getElementById('componentId').value = comp.id;
    document.getElementById('componentType').value = comp.type;
    document.getElementById('componentWeight').value = comp.weight;
    document.getElementById('componentMinPercent').value = comp.minPercent;
}

function deleteComponent(id) {
    if (!confirm('Delete this component?')) return;
    const subj = getSelectedSubject();
    if (!subj || !subj.attendanceRules) return;
    subj.attendanceRules.components = subj.attendanceRules.components.filter(c => c.id !== id);
    saveSubjects();
    renderAttendanceRulesSection();
}

function saveExcludeDays() {
    const subj = getSelectedSubject();
    if (!subj || !subj.attendanceRules) return;
    const val = document.getElementById('excludeDays').value;
    subj.attendanceRules.excludeDays = val.split(',').map(s => s.trim()).filter(Boolean);
    saveSubjects();
}

// Show/hide attendance rules section when subject changes
const originalSelectSubject4 = selectSubject;
selectSubject = function(id) {
    originalSelectSubject4(id);
    renderGradesSection();
    renderTimetableSection();
    renderRemindersSection();
    renderAttendanceRulesSection();
};

document.addEventListener('DOMContentLoaded', function() {
    loadSubjects();
    renderAttendanceRulesSection && renderAttendanceRulesSection();
    renderRemindersSection && renderRemindersSection();
    renderTimetableSection && renderTimetableSection();
    renderGradesSection && renderGradesSection();
    renderAchievementsSection && renderAchievementsSection();
    checkAchievements && checkAchievements();
});








