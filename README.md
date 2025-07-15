# Attendance Predictor - Can I Bunk Today? 🎓

A powerful Progressive Web App (PWA) that helps college students make informed decisions about their attendance by predicting whether they can safely skip classes while maintaining minimum attendance requirements.

## ✨ Features

### 📊 **Core Functionality**
- **Real-time Attendance Calculation**: Input your current attendance data and get instant predictions
- **Smart Bunking Calculator**: Find out exactly how many classes you can safely skip
- **Interactive Prediction Chart**: Visual charts showing attendance trends and future projections
- **Scenario Analysis**: See "what-if" scenarios for different bunking patterns
- **Progress Visualization**: Color-coded progress bars showing your attendance status

### 🎨 **User Experience**
- **Beautiful Modern UI**: Clean, responsive design with smooth animations
- **Dark Mode Toggle**: Switch between light and dark themes with persistent preference
- **Mobile-First Design**: Optimized for all screen sizes and touch interactions
- **Real-time Validation**: Smart input validation with visual feedback
- **Interactive Charts**: Powered by Chart.js for professional data visualization

### 📱 **Progressive Web App (PWA) Features**
- **📲 Install as Native App**: Add to home screen on mobile and desktop
- **📴 Offline Functionality**: Works completely without internet after first visit
- **🔔 Push Notifications**: Daily attendance reminders and updates
- **⚡ Fast Loading**: Intelligent caching for instant app startup
- **🔄 Auto-Updates**: Seamless updates with user notification
- **💾 Data Persistence**: Saves calculations locally for offline access

## 📖 How to Use

### � **Getting Started**
1. **Open the Website**: Open `index.html` in your web browser
2. **Install as App (Optional)**: Click the install button (⬇️) in the header to add to home screen
3. **Enable Notifications (Optional)**: Click the bell icon (🔔) to receive attendance reminders
4. **Enter Your Data**:
   - Total classes conducted so far
   - Classes you've attended
   - Minimum required attendance percentage (usually 75%)
   - Expected future classes in the semester
5. **Click Calculate**: Get instant predictions and recommendations
6. **Review Results**: See your current status, bunking allowance, and future scenarios

### 📱 **PWA Installation**
- **Mobile**: Tap "Add to Home Screen" when prompted, or use browser menu
- **Desktop**: Click the install button in the address bar or use the in-app install button
- **Benefits**: Faster loading, offline access, push notifications, native app experience

## What You'll Get 📊

### Current Status
- Your current attendance percentage
- Number of classes you can safely bunk
- Visual progress bar with color coding

### Predictions
- **Green**: You're safe to bunk some classes
- **Yellow**: Be careful, limited bunking allowed
- **Red**: You need to attend more classes to meet requirements

### Scenario Analysis
- Impact of bunking 1 class
- Impact of bunking 3 classes
- Result if you attend all remaining classes

## 📁 File Structure

```text
attendance-predictor/
├── index.html              # Main HTML file with PWA meta tags
├── style.css               # Responsive styling with dark mode & PWA styles
├── script.js               # Core functionality and chart generation
├── pwa.js                  # PWA management and offline functionality
├── sw.js                   # Service worker for caching and notifications
├── manifest.json           # PWA manifest for installation
├── icons/                  # App icons for PWA installation
│   └── icon.svg           # Template app icon
├── README.md              # This file
└── PWA-README.md          # Detailed PWA setup guide
```

## 🔧 Technical Features

### � **Core Technologies**
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile devices
- **Progressive Web App**: Full PWA implementation with offline support
- **Modern JavaScript**: ES6+ features with Chart.js integration
- **CSS Variables**: Dynamic theming system for light/dark modes
- **Service Worker**: Advanced caching and background sync capabilities
- **Web App Manifest**: Native app-like installation experience

### 📱 **PWA Capabilities**
- **Offline-First**: App shell architecture with intelligent caching
- **Push Notifications**: Background notifications with action buttons
- **Home Screen Install**: Native installation prompts and shortcuts
- **Background Sync**: Data synchronization when connectivity returns
- **App Updates**: Automatic update detection and user notification
- **Splash Screen**: Custom loading screen for app-like experience

### 📊 **Advanced Features**
- **Interactive Charts**: Real-time data visualization with Chart.js
- **Smart Caching**: Strategic caching of assets and user data
- **Form Validation**: Real-time input validation with visual feedback
- **URL Parameters**: Support for deep linking and shortcuts
- **Local Storage**: Persistent data storage for offline access
- **Theme Persistence**: User preference storage across sessions

## Calculation Logic 🧮

The app uses this formula to determine if you can bunk classes:

```
Required Classes = (Minimum Attendance % × Total Future Classes) / 100
Classes You Can Bunk = (Attended + Future Classes) - Required Classes
```

## 🌐 Browser Compatibility

### 📱 **Mobile Support**
- ✅ Android Chrome (Full PWA support)
- ✅ iOS Safari (Limited PWA features)
- ✅ Samsung Internet
- ✅ Firefox Mobile
- ✅ Edge Mobile

### 💻 **Desktop Support**
- ✅ Chrome/Chromium (Full PWA support)
- ✅ Microsoft Edge (Full PWA support)
- ✅ Opera (Full PWA support)
- ⚠️ Firefox (Limited PWA features)
- ⚠️ Safari (Basic functionality only)

### 🔋 **PWA Feature Support**
- **Installation**: Chrome, Edge, Opera, Samsung Internet
- **Offline Mode**: All modern browsers
- **Push Notifications**: Chrome, Edge, Firefox (with limitations)
- **Background Sync**: Chrome, Edge, Opera

## 🚀 Getting Started

### � **Installation Options**

#### **Option 1: Download and Run Locally**
1. Download all files to a folder on your computer
2. Open `index.html` in any modern web browser
3. Start calculating your attendance!

#### **Option 2: Install as PWA (Recommended)**
1. Open the website in Chrome, Edge, or Opera
2. Look for the install button (⬇️) in the header
3. Click "Install" to add to your home screen/desktop
4. Enjoy the native app experience!

#### **Option 3: Serve with HTTPS (For Full PWA Features)**
```bash
# Using Python
python -m http.server 8000

# Using Node.js serve
npx serve -s .

# Using live-server
npx live-server
```

### 🎯 **Quick Start Guide**
1. **Enter your attendance data** in the input fields
2. **Set your minimum attendance requirement** (usually 75%)
3. **Add expected future classes** for the semester
4. **Click Calculate** to see your predictions
5. **Review the chart and scenarios** to make informed decisions
6. **Enable notifications** for regular attendance reminders

## 💡 Tips for Students

### � **Academic Best Practices**
- **Maintain 85%+ attendance** for optimal academic performance
- **Track multiple subjects** separately for better planning
- **Keep medical documentation** ready for excused absences
- **Build relationships with classmates** for note sharing when absent
- **Check professor policies** - some may have stricter requirements than institutional minimums

### 📱 **App Usage Tips**
- **Install as PWA** for the best experience and offline access
- **Enable notifications** to get daily attendance reminders
- **Use dark mode** for comfortable viewing in low light
- **Check the chart regularly** to visualize your attendance trends
- **Save calculations offline** - the app works without internet

### ⚠️ **Important Reminders**
- **This tool is for guidance only** - always verify with your institution's policies
- **Regular attendance improves understanding** and academic performance
- **Attendance often correlates with grades** - don't just aim for the minimum
- **Some courses may have stricter requirements** than the general institutional policy
- **Plan ahead** - don't wait until you're already below the minimum

## 🤝 Contributing

We welcome contributions to improve the Attendance Predictor! Here are some ways you can help:

### 🔧 **Development**
- Add new calculation features (weighted attendance, credit-based calculations)
- Improve the user interface and user experience
- Add more chart types and data visualizations
- Enhance PWA features and offline capabilities
- Add multi-language support

### 🐛 **Bug Reports & Suggestions**
- Report bugs or issues you encounter
- Suggest new features or improvements
- Share feedback on the user experience
- Help with testing on different devices and browsers

### 📖 **Documentation**
- Improve the README and documentation
- Add tutorials or video guides
- Translate the app into other languages
- Create user guides and best practices

## ⚠️ Disclaimer

This tool is for educational and planning purposes only. Always:

- **Verify attendance policies** with your specific institution
- **Consult academic advisors** when in doubt about attendance requirements
- **Keep official records** of your attendance for verification
- **Remember that regular attendance** is crucial for academic success beyond just meeting minimum requirements
- **Consider the impact** of attendance on your learning, grades, and overall academic performance

**Regular attendance is key to academic success - use this tool to stay informed, not to minimize your class participation!**

---

**Made with ❤️ for students who want to make smart attendance decisions!**