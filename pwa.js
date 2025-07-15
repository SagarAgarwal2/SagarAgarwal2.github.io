// PWA Installation and Notification Handler
class PWAManager {
    constructor() {
        this.deferredPrompt = null;
        this.isInstalled = false;
        this.notificationPermission = 'default';
        this.init();
    }

    async init() {
        await this.registerServiceWorker();
        this.setupInstallPrompt();
        this.setupNotifications();
        this.checkInstallStatus();
        this.addPWAUI();
    }

    // Service Worker Registration
    async registerServiceWorker() {
        if ('serviceWorker' in navigator) {
            try {
                const registration = await navigator.serviceWorker.register('/sw.js');
                console.log('PWA: Service Worker registered successfully', registration);
                
                // Listen for service worker updates
                registration.addEventListener('updatefound', () => {
                    const newWorker = registration.installing;
                    newWorker.addEventListener('statechange', () => {
                        if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                            this.showUpdateNotification();
                        }
                    });
                });

                return registration;
            } catch (error) {
                console.error('PWA: Service Worker registration failed', error);
            }
        }
    }

    // Install Prompt Setup
    setupInstallPrompt() {
        window.addEventListener('beforeinstallprompt', (e) => {
            console.log('PWA: Install prompt available');
            e.preventDefault();
            this.deferredPrompt = e;
            this.showInstallButton();
        });

        window.addEventListener('appinstalled', () => {
            console.log('PWA: App installed successfully');
            this.isInstalled = true;
            this.hideInstallButton();
            this.showInstalledMessage();
        });
    }

    // Show Install Button
    showInstallButton() {
        const installBtn = document.getElementById('installBtn');
        if (installBtn) {
            installBtn.style.display = 'block';
            installBtn.addEventListener('click', () => this.installApp());
        }
    }

    // Hide Install Button
    hideInstallButton() {
        const installBtn = document.getElementById('installBtn');
        if (installBtn) {
            installBtn.style.display = 'none';
        }
    }

    // Install App
    async installApp() {
        if (this.deferredPrompt) {
            this.deferredPrompt.prompt();
            const { outcome } = await this.deferredPrompt.userChoice;
            console.log('PWA: Install prompt result:', outcome);
            
            if (outcome === 'accepted') {
                console.log('PWA: User accepted install prompt');
            } else {
                console.log('PWA: User dismissed install prompt');
            }
            
            this.deferredPrompt = null;
        }
    }

    // Check if app is installed
    checkInstallStatus() {
        // Check if running as PWA
        if (window.matchMedia('(display-mode: standalone)').matches || 
            window.navigator.standalone === true) {
            this.isInstalled = true;
            console.log('PWA: App is running as installed PWA');
        }
    }

    // Notification Setup
    async setupNotifications() {
        if ('Notification' in window) {
            this.notificationPermission = Notification.permission;
            
            if (this.notificationPermission === 'default') {
                this.showNotificationPermissionPrompt();
            }
        }
    }

    // Request Notification Permission
    async requestNotificationPermission() {
        if ('Notification' in window) {
            const permission = await Notification.requestPermission();
            this.notificationPermission = permission;
            
            if (permission === 'granted') {
                console.log('PWA: Notification permission granted');
                this.setupPushNotifications();
                this.scheduleAttendanceReminders();
            } else {
                console.log('PWA: Notification permission denied');
            }
            
            return permission;
        }
    }

    // Setup Push Notifications
    async setupPushNotifications() {
        try {
            const registration = await navigator.serviceWorker.ready;
            
            // Subscribe to push notifications
            const subscription = await registration.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: this.urlBase64ToUint8Array('your-vapid-public-key-here')
            });
            
            console.log('PWA: Push subscription successful', subscription);
            
            // Send subscription to server (in a real app)
            // await this.sendSubscriptionToServer(subscription);
            
        } catch (error) {
            console.error('PWA: Push subscription failed', error);
        }
    }

    // Schedule Attendance Reminders
    scheduleAttendanceReminders() {
        // Set up periodic reminders
        if ('serviceWorker' in navigator && 'sync' in window.ServiceWorkerRegistration.prototype) {
            navigator.serviceWorker.ready.then(registration => {
                // Schedule daily reminder
                setInterval(() => {
                    this.sendAttendanceReminder();
                }, 24 * 60 * 60 * 1000); // 24 hours
            });
        }
    }

    // Send Attendance Reminder
    sendAttendanceReminder() {
        if (this.notificationPermission === 'granted') {
            const lastCheck = localStorage.getItem('lastAttendanceCheck');
            const daysSinceCheck = lastCheck ? 
                (Date.now() - parseInt(lastCheck)) / (1000 * 60 * 60 * 24) : 999;
            
            if (daysSinceCheck >= 1) {
                new Notification('Attendance Reminder', {
                    body: 'Time to check your attendance status!',
                    icon: '/icons/icon-192x192.png',
                    badge: '/icons/icon-72x72.png',
                    tag: 'attendance-reminder',
                    vibrate: [200, 100, 200],
                    actions: [
                        {
                            action: 'check',
                            title: 'Check Now'
                        }
                    ]
                });
            }
        }
    }

    // Add PWA UI Elements
    addPWAUI() {
        // Add install button to header
        const headerControls = document.querySelector('.header-controls');
        if (headerControls && !document.getElementById('installBtn')) {
            const installBtn = document.createElement('button');
            installBtn.id = 'installBtn';
            installBtn.className = 'pwa-btn install-btn';
            installBtn.innerHTML = '<i class="fas fa-download"></i>';
            installBtn.title = 'Install App';
            installBtn.style.display = 'none';
            headerControls.appendChild(installBtn);
        }

        // Add notification button
        if (headerControls && !document.getElementById('notificationBtn')) {
            const notificationBtn = document.createElement('button');
            notificationBtn.id = 'notificationBtn';
            notificationBtn.className = 'pwa-btn notification-btn';
            notificationBtn.innerHTML = '<i class="fas fa-bell"></i>';
            notificationBtn.title = 'Enable Notifications';
            notificationBtn.addEventListener('click', () => this.requestNotificationPermission());
            headerControls.appendChild(notificationBtn);
        }

        // Add offline indicator
        this.addOfflineIndicator();
    }

    // Add Offline Indicator
    addOfflineIndicator() {
        const indicator = document.createElement('div');
        indicator.id = 'offlineIndicator';
        indicator.className = 'offline-indicator hidden';
        indicator.innerHTML = '<i class="fas fa-wifi-slash"></i> Offline Mode';
        document.body.appendChild(indicator);

        // Listen for online/offline events
        window.addEventListener('online', () => {
            indicator.classList.add('hidden');
            this.showToast('Back online!', 'success');
        });

        window.addEventListener('offline', () => {
            indicator.classList.remove('hidden');
            this.showToast('You are offline. App will work with cached data.', 'warning');
        });
    }

    // Show Toast Notification
    showToast(message, type = 'info') {
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.textContent = message;
        document.body.appendChild(toast);

        setTimeout(() => {
            toast.classList.add('show');
        }, 100);

        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => {
                document.body.removeChild(toast);
            }, 300);
        }, 3000);
    }

    // Show Update Notification
    showUpdateNotification() {
        this.showToast('New version available! Refresh to update.', 'info');
    }

    // Show Installed Message
    showInstalledMessage() {
        this.showToast('App installed successfully!', 'success');
    }

    // Show Notification Permission Prompt
    showNotificationPermissionPrompt() {
        setTimeout(() => {
            const shouldAsk = confirm('Enable notifications to get attendance reminders and updates?');
            if (shouldAsk) {
                this.requestNotificationPermission();
            }
        }, 3000); // Ask after 3 seconds
    }

    // Utility function for VAPID key
    urlBase64ToUint8Array(base64String) {
        const padding = '='.repeat((4 - base64String.length % 4) % 4);
        const base64 = (base64String + padding)
            .replace(/-/g, '+')
            .replace(/_/g, '/');

        const rawData = window.atob(base64);
        const outputArray = new Uint8Array(rawData.length);

        for (let i = 0; i < rawData.length; ++i) {
            outputArray[i] = rawData.charCodeAt(i);
        }
        return outputArray;
    }

    // Save calculation for offline use
    saveCalculation(data) {
        const calculation = {
            ...data,
            timestamp: Date.now(),
            offline: !navigator.onLine
        };
        
        localStorage.setItem('lastCalculation', JSON.stringify(calculation));
        localStorage.setItem('lastAttendanceCheck', Date.now().toString());
    }

    // Get saved calculation
    getSavedCalculation() {
        const saved = localStorage.getItem('lastCalculation');
        return saved ? JSON.parse(saved) : null;
    }
}

// Initialize PWA Manager
const pwaManager = new PWAManager();

// Export for use in main script
window.pwaManager = pwaManager;
