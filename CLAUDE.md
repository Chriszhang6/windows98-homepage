# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a nostalgic Windows 98-style personal homepage - a pure static website that recreates the classic Windows 98 desktop environment with full interactivity. It's a single-page application built entirely with vanilla HTML, CSS, and JavaScript (no frameworks or build tools).

## Development

### Running the Application
- Simply open `index.html` in a web browser - no build process or server required
- For development, any static file server will work (e.g., `python -m http.server`)

### Testing
- No automated test suite - manual browser testing across different devices
- Test both desktop and mobile responsive layouts
- Verify touch events work on mobile devices

## Architecture

### File Structure
- `index.html` (4,600+ lines) - Contains all CSS, HTML structure, and main JavaScript logic
- `paint.js` - Paint application logic, loaded dynamically when Paint window opens
- `images/` - PNG icons for desktop icons and UI elements
- `music/` - MP3 files for CD Player
- `photo/` - JPEG images for photo gallery
- `video/` - MOV files for Media Player

### Single-File Architecture
The entire application is contained in `index.html` with these sections:
1. CSS styles (embedded in `<style>` tags)
2. HTML markup for all windows and UI elements
3. JavaScript logic (embedded in `<script>` tags)

Windows are defined as HTML elements with `id` attributes (e.g., `paint-window`, `cd-player-window`) that are initially hidden (`display: none`) and shown when opened.

### Window Management System

**Core Functions:**
- `openWindow(windowId)` - Opens a window, handles positioning, adds to taskbar
- `closeWindow(windowId)` - Closes window with animation, removes from taskbar
- `minimizeWindow(windowId)` - Minimizes window to taskbar
- `maximizeWindow(windowId)` - Toggles maximize/restore
- `bringToFront(window)` - Sets z-index to bring window to top

**Window State Management:**
- `openWindows` array tracks all open windows in order
- `windowStates` object stores position, size, and maximized state for each window
- Windows cascade with 30px offset when multiple are open

**Window Positioning Logic:**
- First window is centered on screen
- Subsequent windows offset by 30px horizontally and vertically
- Windows are constrained to screen boundaries
- Mobile: ensures title bar is always visible (min-top: 10px)

### Desktop Icons and Start Menu

Desktop icons are defined in HTML with class `desktop-icon` and double-click handlers:
- `Computer` → Opens file explorer (`openCDrive()`)
- `About Me` → Opens personal profile
- `Recycle Bin` → Opens empty recycle bin window

Start menu items cascade through sections:
- Programs submenu with applications
- Settings submenu
- Shutdown option

### Application Structure

Applications are opened via dedicated functions:
- `openCDrive()` - File explorer
- `openCDPlayer()` - Music player with playlist
- `openPaint()` - Drawing app (initializes PaintApp class from paint.js)
- `openTextFile()` - Notepad-style text editor
- `openInternetExplorer()` - Mock browser that opens external URLs
- `shutdown()` - Shutdown sequence with black screen

### Event Handling

**Click Sounds:**
- `playSystemSound(type)` plays different sounds for 'click', 'open', 'close'
- `addClickSounds()` attaches sound to all interactive elements
- Uses Web Audio API with iPhone Safari workaround

**Window Dragging:**
- `startDragging()` - Initiates drag on mousedown/touchstart on title bar
- `drag()` - Updates position during mousemove/touchmove
- `stopDragging()` - Ends drag on mouseup/touchend

**Touch Support:**
- All mouse events have touch equivalents for mobile
- Touch events are converted to mouse events for handlers

### Paint Application (paint.js)

The Paint app is implemented as a `PaintApp` class:
- Initialized via `initializePaint()` function called when paint window opens
- Canvas-based drawing with tools: pencil, brush, line, rectangle, ellipse
- Color palette and brush size controls
- Touch-enabled for mobile drawing

### CSS Styling

All Windows 98 styling is embedded CSS:
- Classic gray gradients: `linear-gradient(to bottom, #c0c0c0, #a0a0a0)`
- 3D borders: `border: 2px outset #c0c0c0` for raised effect
- Desktop teal background: `#008080`
- Font: `'MS Sans Serif', sans-serif`
- Window opening/closing animations with CSS classes

### Responsive Design

- `isMobile` flag detected from screen width
- Larger desktop icons on mobile (up to 64px)
- Mobile-optimized window sizing
- Touch-friendly interface elements

### Special Behaviors

**CD Player:** Stops music when window is closed
**Media Player:** Pauses video when window is closed
**Shutdown:** Creates full-screen black overlay with F5 to restart
**Clock:** Updates every second in system tray
**Window Cleanup:** Removes from taskbar and openWindows array on close

## Adding New Windows/Applications

To add a new application:

1. Add HTML for the window in index.html:
```html
<div id="myapp-window" class="window" style="display: none;">
    <div class="window-header">
        <span class="window-title">My App</span>
        <div class="window-controls">
            <button class="window-control minimize-btn">_</button>
            <button class="window-control maximize-btn">[]</button>
            <button class="window-control close-btn">×</button>
        </div>
    </div>
    <div class="window-content">
        <!-- App content here -->
    </div>
</div>
```

2. Add open function:
```javascript
function openMyApp() {
    openWindow('myapp-window');
    // Any initialization code
}
```

3. Add to Start Menu or desktop icon as needed

4. Add cleanup in `closeWindow()` if needed (e.g., stop media)

## Code Patterns

- No external dependencies - pure vanilla JavaScript
- Event delegation for dynamic elements
- CSS classes for window states (`.opening`, `.closing`, `.active`, `.maximized`)
- Global functions for window management
- Event listeners attached in DOMContentLoaded
- Touch events mapped to mouse events for cross-device support
