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
This project features an **automated GitHub repository showcase** that dynamically displays all GitHub repositories with GitHub Pages enabled in the Internet Explorer window. The system runs daily via GitHub Actions, eliminating the need for manual updates.

### Architecture

```
┌─────────────────┐      ┌─────────────────┐      ┌─────────────────┐
│  GitHub Actions │ ───▶ │  update-projects│ ───▶ │  projects.json  │
│  (Daily Cron)   │      │     .js script  │      │   (Data File)   │
└─────────────────┘      └─────────────────┘      └────────┬────────┘
                                                              │
                                                              ▼
                                                    ┌─────────────────┐
                                                    │  index.html     │
                                                    │  (Fetches &     │
                                                    │   Displays)     │
                                                    └─────────────────┘
```

### Implementation Details

#### 1. GitHub Actions Workflow (`.github/workflows/update-projects.yml`)
- **Trigger**: Runs daily at UTC 00:00 + manual dispatch option
- **Authentication**: Uses Personal Access Token (PAT) to bypass branch protection
- **Process**: Fetches repos → Filters for GitHub Pages → Updates `projects.json`

#### 2. Update Script (`.github/scripts/update-projects.js`)
The script uses **three detection methods** to find GitHub Pages repositories:

1. **GitHub Pages API**: Official API check (requires authentication)
2. **URL Testing**: Direct HTTP HEAD request to potential Pages URLs
3. **Pattern Matching**: Matches known repository names

```javascript
// Example detection logic
for (const repo of repos) {
    let hasPages = await hasGitHubPagesAPI(repo.name, token);
    if (!hasPages) hasPages = await testPagesURL(repo.name);
    if (!hasPages && likelyHasPages(repo)) hasPages = true;
}
```

#### 3. Frontend Integration (`index.html`)
The Internet Explorer window dynamically loads projects:

```javascript
async function loadGitHubProjects() {
    const response = await fetch('./projects.json');
    const projects = await response.json();
    // Generate project cards dynamically
}
```

### Data Flow

1. **Daily Trigger**: GitHub Actions workflow initiates at 00:00 UTC
2. **Repository Scan**: Script fetches all user repositories via GitHub API
3. **Pages Detection**: Each repo is checked for GitHub Pages availability
4. **Data Generation**: Matching repos are formatted into `projects.json`
5. **Auto-Commit**: Changes are automatically committed to main branch
6. **Frontend Display**: Website fetches and displays updated project list

### Setup Requirements

To replicate this automation in your own fork:

1. **Create Personal Access Token**:
   - Visit `https://github.com/settings/tokens/new`
   - Grant `repo` permissions
   - Store as `PAT_TOKEN` in repository secrets

2. **Update Configuration**:
   - Edit `USERNAME` in `.github/scripts/update-projects.js`
   - Ensure workflow permissions are set to "Read and write"

3. **Manual Trigger** (optional):
   - Visit Actions tab → "Update GitHub Projects" → "Run workflow"

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
