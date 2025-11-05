// Windows 98 Paint Application
// This file implements interactive drawing functionality

class PaintApp {
    constructor() {
        this.canvas = null;
        this.ctx = null;
        this.backgroundImage = null;
        this.isDrawing = false;
        this.selectedTool = 'pencil';
        this.selectedColor = '#000000';
        this.lineWidth = 2;
        this.startX = 0;
        this.startY = 0;
        this.lastX = 0;
        this.lastY = 0;
        
        // For shape tools
        this.shapeStartX = 0;
        this.shapeStartY = 0;
        this.isDrawingShape = false;
        
        // Initialize when DOM is ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.init());
        } else {
            this.init();
        }
    }
    
    init() {
        // Check if paint window is open
        const paintWindow = document.getElementById('paint-window');
        if (!paintWindow || paintWindow.style.display === 'none') {
            // Window not open yet, wait
            return;
        }
        
        // Wait for paint window to be available
        this.setupCanvas();
        this.setupEventListeners();
        this.setupTools();
        this.setupColors();
    }
    
    setupCanvas() {
        const canvasContainer = document.getElementById('paint-canvas');
        if (!canvasContainer) return;
        
        // Create canvas element
        this.canvas = document.createElement('canvas');
        this.canvas.id = 'paint-canvas-element';
        this.canvas.style.cursor = 'crosshair';
        this.canvas.style.display = 'block';
        this.canvas.style.maxWidth = '100%';
        this.canvas.style.height = 'auto';
        
        // Set canvas size
        this.canvas.width = 600;
        this.canvas.height = 400;
        
        // Get context
        this.ctx = this.canvas.getContext('2d');
        
        // Load background image
        const img = new Image();
        img.onload = () => {
            this.backgroundImage = img;
            // Draw image on canvas maintaining aspect ratio
            this.drawBackgroundImage();
        };
        img.src = './images/photo.jpeg';
        
        // Replace existing content with canvas
        canvasContainer.innerHTML = '';
        canvasContainer.appendChild(this.canvas);
    }
    
    setupEventListeners() {
        if (!this.canvas) return;
        
        // Mouse events
        this.canvas.addEventListener('mousedown', (e) => this.handleMouseDown(e));
        this.canvas.addEventListener('mousemove', (e) => this.handleMouseMove(e));
        this.canvas.addEventListener('mouseup', (e) => this.handleMouseUp(e));
        this.canvas.addEventListener('mouseout', (e) => this.handleMouseUp(e));
        
        // Touch events for mobile
        this.canvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            const touch = e.touches[0];
            const mouseEvent = new MouseEvent('mousedown', {
                clientX: touch.clientX,
                clientY: touch.clientY
            });
            this.canvas.dispatchEvent(mouseEvent);
        });
        
        this.canvas.addEventListener('touchmove', (e) => {
            e.preventDefault();
            const touch = e.touches[0];
            const mouseEvent = new MouseEvent('mousemove', {
                clientX: touch.clientX,
                clientY: touch.clientY
            });
            this.canvas.dispatchEvent(mouseEvent);
        });
        
        this.canvas.addEventListener('touchend', (e) => {
            e.preventDefault();
            const mouseEvent = new MouseEvent('mouseup', {});
            this.canvas.dispatchEvent(mouseEvent);
        });
    }
    
    setupTools() {
        const toolButtons = document.querySelectorAll('.paint-tool-btn');
        toolButtons.forEach((btn, index) => {
            btn.addEventListener('click', () => {
                // Remove previous selection
                toolButtons.forEach(b => b.classList.remove('selected'));
                // Add selection to clicked button
                btn.classList.add('selected');
                
                // Set tool based on title
                const toolName = btn.getAttribute('title').toLowerCase();
                this.selectTool(toolName);
            });
        });
        
        // Select pencil by default
        if (toolButtons[0]) {
            toolButtons[0].classList.add('selected');
            this.selectTool('pencil');
        }
    }
    
    setupColors() {
        const colorSwatches = document.querySelectorAll('.color-swatch');
        colorSwatches.forEach(swatch => {
            swatch.addEventListener('click', (e) => {
                // Remove previous selection
                colorSwatches.forEach(s => s.classList.remove('selected'));
                // Add selection to clicked swatch
                swatch.classList.add('selected');
                
                // Get color from background style or computed style
                let color = swatch.style.backgroundColor;
                if (!color || color === '') {
                    const computedStyle = window.getComputedStyle(swatch);
                    color = computedStyle.backgroundColor;
                }
                
                // Convert to hex if needed
                if (color && !color.startsWith('#')) {
                    color = this.rgbToHex(color);
                }
                
                this.selectColor(color);
            });
        });
        
        // Select black by default
        if (colorSwatches[0]) {
            colorSwatches[0].classList.add('selected');
            this.selectColor('#000000');
        }
    }
    
    rgbToHex(rgb) {
        if (!rgb || rgb.startsWith('#')) return rgb;
        const result = rgb.match(/\d+/g);
        if (!result || result.length < 3) return '#000000';
        return '#' + result.map(x => parseInt(x).toString(16).padStart(2, '0')).join('');
    }
    
    selectTool(tool) {
        this.selectedTool = tool;
        // Update cursor based on tool
        if (this.canvas) {
            switch(tool) {
                case 'eraser':
                    this.canvas.style.cursor = 'grab';
                    break;
                case 'text':
                    this.canvas.style.cursor = 'text';
                    break;
                default:
                    this.canvas.style.cursor = 'crosshair';
            }
        }
    }
    
    selectColor(color) {
        // Convert various color formats to hex
        if (color.startsWith('#')) {
            this.selectedColor = color;
        } else if (color.startsWith('rgb')) {
            this.selectedColor = this.rgbToHex(color);
        } else {
            this.selectedColor = color;
        }
    }
    
    getCanvasCoordinates(e) {
        const rect = this.canvas.getBoundingClientRect();
        const scaleX = this.canvas.width / rect.width;
        const scaleY = this.canvas.height / rect.height;
        return {
            x: (e.clientX - rect.left) * scaleX,
            y: (e.clientY - rect.top) * scaleY
        };
    }
    
    handleMouseDown(e) {
        const coords = this.getCanvasCoordinates(e);
        this.isDrawing = true;
        this.startX = coords.x;
        this.startY = coords.y;
        this.lastX = coords.x;
        this.lastY = coords.y;
        this.shapeStartX = coords.x;
        this.shapeStartY = coords.y;
        this.isDrawingShape = true;
        
        // For tools that need immediate drawing
        if (this.selectedTool === 'text') {
            this.drawText(coords.x, coords.y);
        }
    }
    
    handleMouseMove(e) {
        if (!this.isDrawing) return;
        
        const coords = this.getCanvasCoordinates(e);
        
        switch(this.selectedTool) {
            case 'pencil':
            case 'brush':
                this.drawLine(this.lastX, this.lastY, coords.x, coords.y);
                this.lastX = coords.x;
                this.lastY = coords.y;
                break;
            case 'eraser':
                this.eraseLine(this.lastX, this.lastY, coords.x, coords.y);
                this.lastX = coords.x;
                this.lastY = coords.y;
                break;
            case 'line':
            case 'rectangle':
            case 'circle':
                // Redraw canvas with shape preview
                this.drawShapePreview(this.shapeStartX, this.shapeStartY, coords.x, coords.y);
                break;
        }
    }
    
    handleMouseUp(e) {
        if (!this.isDrawing) return;
        
        const coords = this.getCanvasCoordinates(e);
        
        // Finalize shape drawing
        if (this.isDrawingShape) {
            switch(this.selectedTool) {
                case 'line':
                    this.drawLine(this.shapeStartX, this.shapeStartY, coords.x, coords.y, true);
                    break;
                case 'rectangle':
                    this.drawRectangle(this.shapeStartX, this.shapeStartY, coords.x, coords.y, true);
                    break;
                case 'circle':
                    this.drawCircle(this.shapeStartX, this.shapeStartY, coords.x, coords.y, true);
                    break;
            }
            this.isDrawingShape = false;
        }
        
        this.isDrawing = false;
    }
    
    drawLine(x1, y1, x2, y2, final = false) {
        this.ctx.beginPath();
        this.ctx.moveTo(x1, y1);
        this.ctx.lineTo(x2, y2);
        this.ctx.strokeStyle = this.selectedColor;
        this.ctx.lineWidth = this.selectedTool === 'brush' ? 4 : 2;
        this.ctx.lineCap = 'round';
        this.ctx.lineJoin = 'round';
        this.ctx.stroke();
    }
    
    eraseLine(x1, y1, x2, y2) {
        this.ctx.beginPath();
        this.ctx.moveTo(x1, y1);
        this.ctx.lineTo(x2, y2);
        this.ctx.strokeStyle = '#FFFFFF';
        this.ctx.lineWidth = 10;
        this.ctx.lineCap = 'round';
        this.ctx.globalCompositeOperation = 'destination-out';
        this.ctx.stroke();
        this.ctx.globalCompositeOperation = 'source-over';
    }
    
    drawShapePreview(x1, y1, x2, y2) {
        // Save current canvas state
        const imageData = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
        
        // Redraw background
        this.drawBackgroundImage();
        
        // Restore previous drawings (this preserves all previous drawings)
        this.ctx.putImageData(imageData, 0, 0);
        
        // Draw preview shape on top
        this.ctx.strokeStyle = this.selectedColor;
        this.ctx.lineWidth = 2;
        this.ctx.globalCompositeOperation = 'source-over';
        
        switch(this.selectedTool) {
            case 'line':
                this.ctx.beginPath();
                this.ctx.moveTo(x1, y1);
                this.ctx.lineTo(x2, y2);
                this.ctx.stroke();
                break;
            case 'rectangle':
                this.ctx.strokeRect(x1, y1, x2 - x1, y2 - y1);
                break;
            case 'circle':
                const radius = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
                this.ctx.beginPath();
                this.ctx.arc(x1, y1, radius, 0, 2 * Math.PI);
                this.ctx.stroke();
                break;
        }
    }
    
    drawRectangle(x1, y1, x2, y2, final = false) {
        this.ctx.strokeStyle = this.selectedColor;
        this.ctx.lineWidth = 2;
        this.ctx.strokeRect(x1, y1, x2 - x1, y2 - y1);
    }
    
    drawCircle(x1, y1, x2, y2, final = false) {
        const radius = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
        this.ctx.beginPath();
        this.ctx.arc(x1, y1, radius, 0, 2 * Math.PI);
        this.ctx.strokeStyle = this.selectedColor;
        this.ctx.lineWidth = 2;
        this.ctx.stroke();
    }
    
    drawText(x, y) {
        const text = prompt('Enter text:', '');
        if (text) {
            this.ctx.font = '16px Arial';
            this.ctx.fillStyle = this.selectedColor;
            this.ctx.fillText(text, x, y);
        }
    }
    
    drawBackgroundImage() {
        if (!this.backgroundImage) return;
        
        // Clear canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Calculate aspect ratios
        const imgAspect = this.backgroundImage.width / this.backgroundImage.height;
        const canvasAspect = this.canvas.width / this.canvas.height;
        
        let drawWidth, drawHeight, drawX, drawY;
        
        // Fit image to canvas while maintaining aspect ratio
        if (imgAspect > canvasAspect) {
            // Image is wider - fit to canvas width
            drawWidth = this.canvas.width;
            drawHeight = this.canvas.width / imgAspect;
            drawX = 0;
            drawY = (this.canvas.height - drawHeight) / 2;
        } else {
            // Image is taller - fit to canvas height
            drawHeight = this.canvas.height;
            drawWidth = this.canvas.height * imgAspect;
            drawX = (this.canvas.width - drawWidth) / 2;
            drawY = 0;
        }
        
        // Draw image centered on canvas
        this.ctx.drawImage(this.backgroundImage, drawX, drawY, drawWidth, drawHeight);
    }
    
    redrawCanvas() {
        // Clear and redraw background
        this.drawBackgroundImage();
    }
    
    // Save current canvas state for undo functionality (future enhancement)
    saveState() {
        // This would be used for undo/redo functionality
        return this.canvas.toDataURL();
    }
    
    // Public method to reinitialize when window is opened
    reinitialize() {
        this.setupCanvas();
        this.setupEventListeners();
    }
}

// Initialize Paint app
let paintApp;

// Initialize when paint window opens
function initializePaint() {
    // Wait a bit for DOM to update
    setTimeout(() => {
        if (!paintApp) {
            paintApp = new PaintApp();
        } else {
            paintApp.reinitialize();
        }
    }, 100);
}

// Make initializePaint available globally
window.initializePaint = initializePaint;

// Monitor for paint window opening
document.addEventListener('DOMContentLoaded', () => {
    const paintWindow = document.getElementById('paint-window');
    if (paintWindow) {
        // Use MutationObserver to detect when window becomes visible
        const observer = new MutationObserver(() => {
            if (paintWindow.style.display !== 'none' && paintWindow.style.display !== '') {
                initializePaint();
            }
        });
        observer.observe(paintWindow, { attributes: true, attributeFilter: ['style'] });
        
        // Also check on window open
        const originalOpenWindow = window.openWindow;
        if (originalOpenWindow) {
            window.openWindow = function(windowId) {
                originalOpenWindow(windowId);
                if (windowId === 'paint-window') {
                    initializePaint();
                }
            };
        }
    }
});

