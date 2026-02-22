# Windows 98 Personal Homepage

A nostalgic Windows 98-style personal homepage built with HTML, CSS, and JavaScript.

## 🎯 Features

- **Classic Windows 98 Interface**: Authentic desktop experience
- **Interactive Desktop Icons**: Computer, About Me, Recycle Bin
- **Window Management**: Drag, resize, minimize, maximize
- **CD Player**: Play music with retro interface
- **Paint Tool**: Basic drawing application
- **Internet Explorer**: Browse projects and LinkedIn
- **Shutdown Simulation**: Complete with black screen
- **Mobile Responsive**: Optimized for mobile devices
- **Click Sounds**: Authentic keyboard click sounds

## 🚀 Live Demo

Visit the live website: [Your GitHub Pages URL will be here]

## 🛠️ Technologies Used

- HTML5
- CSS3 (with Windows 98 styling)
- Vanilla JavaScript
- Web Audio API (for click sounds)
- Responsive Design

## 📁 Project Structure

```
├── index.html              # Main HTML file
├── *.png                   # Icon images
├── *.mp3                   # Audio files
├── photo.jpeg              # Profile photo
└── README.md               # This file
```

## 🎨 Features Breakdown

### Desktop Icons
- **Computer**: Opens file explorer with C: drive, CD Player, and Paint
- **About Me**: Contains text file and Internet Explorer
- **Recycle Bin**: Opens empty recycle bin window

### Applications
- **CD Player**: Play music with retro interface
- **Paint Tool**: Basic drawing with color palette
- **Internet Explorer**: Browse projects and LinkedIn profile
- **Text File**: Personal introduction

### System Features
- **Start Menu**: Access all applications
- **Taskbar**: Window management
- **Shutdown**: Complete system shutdown simulation
- **Window Controls**: Minimize, maximize, close, drag, resize

## 📱 Mobile Support

The website is fully responsive and optimized for mobile devices:
- Larger desktop icons on mobile
- Touch-friendly interface
- Responsive window sizing
- Mobile-optimized layout

## 🔧 Setup

1. Clone the repository
2. Open `index.html` in a web browser
3. Enjoy the Windows 98 experience!

---

## 💡 Solution Summary: Automated GitHub Pages Project Showcase

### Overview
This project features a **GitHub repository showcase** that dynamically displays all GitHub repositories with GitHub Pages enabled in the Internet Explorer window.

### Architecture

```
┌─────────────────────────────────────────────────┐
│  project-daily-snapshot (Centralized Data)      │
│  - Runs daily via GitHub Actions                │
│  - Generates projects.json                      │
│  - Hosted on CDN for fast access                │
└─────────────────────────────────────────────────┘
                      │
                      │ jsDelivr CDN
                      ▼
┌─────────────────────────────────────────────────┐
│  windows98-homepage                              │
│  - Fetches projects.json from CDN               │
│  - Displays in Internet Explorer window         │
└─────────────────────────────────────────────────┘
```

### Implementation Details

#### Data Source
This project uses a centralized `projects.json` file from the [project-daily-snapshot](https://github.com/Chriszhang6/project-daily-snapshot) repository, which:
- **Updates daily** via GitHub Actions
- **Detects GitHub Pages** using multiple methods (API, URL testing, pattern matching)
- **Served via CDN** for fast loading (jsDelivr)

#### Frontend Integration (`index.html`)
The Internet Explorer window dynamically loads projects:

```javascript
async function loadGitHubProjects() {
    const response = await fetch('https://cdn.jsdelivr.net/gh/Chriszhang6/project-daily-snapshot@main/projects.json');
    const projects = await response.json();
    // Generate project cards dynamically
}
```

### Key Features

- ✅ **Zero Maintenance**: Automatically updates with new GitHub Pages projects
- ✅ **Smart Detection**: Multiple methods ensure comprehensive repository discovery
- ✅ **CDN Powered**: Fast loading via jsDelivr CDN
- ✅ **Responsive Design**: Projects displayed in Windows 98-style cards

### Key Features

- ✅ **Zero Maintenance**: Automatically updates with new GitHub Pages projects
- ✅ **Smart Detection**: Multiple methods ensure comprehensive repository discovery
- ✅ **Detailed Logging**: Full visibility into which repos are found/filtered
- ✅ **Branch Protection Safe**: Uses PAT to bypass rules without compromising security
- ✅ **Responsive Design**: Projects displayed in Windows 98-style cards

### Example Output

The `projects.json` file contains structured data for each repository:

```json
[
  {
    "name": "windows98-homepage",
    "description": "A nostalgic Windows 98-style personal homepage...",
    "url": "https://chriszhang6.github.io/windows98-homepage/",
    "github": "https://github.com/Chriszhang6/windows98-homepage",
    "language": "HTML",
    "stars": 0,
    "updatedAt": "2025-01-15T00:00:00Z"
  }
]
```

---

## 📝 License

This project is open source and available under the MIT License.

---

*Built with ❤️ for the nostalgic Windows 98 experience*
