# Obsidian Network Design System & Style Guide

This comprehensive design system document captures all visual elements, design patterns, and implementation details from the Obsidian Network website. Use this guide to maintain consistent styling across multiple websites and generate CSS injection code for existing sites.

## Table of Contents
- [Color System](#color-system)
- [Typography](#typography)
- [Component Library](#component-library)
- [Animation System](#animation-system)
- [Layout Patterns](#layout-patterns)
- [CSS Injection Templates](#css-injection-templates)
- [Implementation Guidelines](#implementation-guidelines)

---

## Color System

### Primary Color Palette

```css
:root {
    /* Primary Brand Colors */
    --obsidian-purple: #5865F2;
    --deep-purple: #4752C4;
    --light-purple: #7289DA;
    --electric-purple: #8B5FBF;
    
    /* Accent Colors */
    --success-green: #00D4AA;
    --warning-yellow: #FEE75C;
    --error-red: #ED4245;
    
    /* Dark Theme Background System */
    --bg-dark: #0C0E14;
    --bg-darker: #06080B;
    --bg-card: #1A1D26;
    --bg-hover: #232631;
    
    /* Text Colors */
    --text-primary: #FFFFFF;
    --text-secondary: #B9BBBE;
    --text-muted: #72767D;
    
    /* Border & Accent */
    --border-color: #2A2D38;
}
```

### Color Usage Guidelines
- **Obsidian Purple (#5865F2)**: Main brand color for CTAs, links, and accent elements
- **Electric Purple (#8B5FBF)**: Secondary accent, gradients, hover states
- **Success Green (#00D4AA)**: Success states, status indicators, positive actions
- **Dark Backgrounds**: Layered system from darkest (--bg-darker) to lighter (--bg-hover)
- **Text Hierarchy**: Primary (white) for headings, secondary for body, muted for captions

---

## Typography

### Font Stack
```css
font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', sans-serif;
```

### Type Scale & Hierarchy

```css
/* Display Text - Hero Headlines */
.display-text {
    font-size: clamp(2.5rem, 6vw, 4.5rem);
    font-weight: 900;
    line-height: 1.1;
}

/* Heading 1 - Main Section Headers */
.heading-1 {
    font-size: clamp(2rem, 5vw, 3rem);
    font-weight: 800;
}

/* Heading 2 - Sub-sections */
.heading-2 {
    font-size: clamp(1.5rem, 4vw, 2.5rem);
    font-weight: 700;
}

/* Heading 3 - Component Titles */
.heading-3 {
    font-size: clamp(1.2rem, 3vw, 1.5rem);
    font-weight: 600;
}

/* Body Text Sizes */
.body-large { font-size: 1.3rem; line-height: 1.6; }
.body-text { font-size: 1rem; line-height: 1.6; }
.body-small { font-size: 0.875rem; line-height: 1.5; }
```

### Gradient Text Effect
```css
.gradient-text {
    background: linear-gradient(135deg, var(--primary-purple), var(--electric-purple), var(--neon-green));
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-size: 200% auto;
    animation: gradientShift 3s ease infinite;
}

@keyframes gradientShift {
    to { background-position: 200% center; }
}
```

---

## Component Library

### Button System

#### Primary Button
```css
.btn-primary {
    background: linear-gradient(135deg, var(--primary-purple), var(--dark-purple));
    color: white;
    padding: 0.75rem 1.5rem;
    border-radius: 8px;
    font-weight: 600;
    transition: all 0.3s ease;
    position: relative;
    overflow: hidden;
}

.btn-primary::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(135deg, var(--electric-purple), var(--primary-purple));
    transition: left 0.3s ease;
}

.btn-primary:hover::before {
    left: 0;
}

.btn-primary:hover {
    transform: translateY(-2px);
    box-shadow: 0 10px 30px rgba(88, 101, 242, 0.4);
}
```

#### Outline Button
```css
.btn-outline {
    background: transparent;
    border: 1px solid var(--primary-purple);
    color: var(--primary-purple);
    padding: 0.75rem 1.5rem;
    border-radius: 8px;
    font-weight: 600;
    transition: all 0.3s ease;
}

.btn-outline:hover {
    background: rgba(88, 101, 242, 0.1);
    transform: translateY(-2px);
    box-shadow: 0 5px 20px rgba(88, 101, 242, 0.3);
}
```

### Card Components

#### Feature Card
```css
.feature-card {
    background: var(--bg-card);
    border: 1px solid var(--border-color);
    border-radius: 16px;
    padding: 2.5rem;
    transition: all 0.3s ease;
    position: relative;
    overflow: hidden;
}

.feature-card:hover {
    transform: translateY(-5px);
    border-color: var(--primary-purple);
    box-shadow: 0 20px 40px rgba(88, 101, 242, 0.15);
}

.feature-card::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 2px;
    background: linear-gradient(90deg, transparent, var(--primary-purple), transparent);
    transform: translateX(-100%);
    transition: transform 0.6s ease;
}

.feature-card:hover::before {
    transform: translateX(100%);
}

.feature-icon {
    width: 60px;
    height: 60px;
    background: linear-gradient(135deg, var(--primary-purple), var(--electric-purple));
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 1.5rem;
    font-size: 1.5rem;
}
```

#### Game Card
```css
.game-card {
    background: var(--bg-card);
    border: 1px solid var(--border-color);
    border-radius: 12px;
    padding: 1.5rem;
    text-align: center;
    transition: all 0.3s ease;
    cursor: pointer;
}

.game-card:hover {
    transform: translateY(-5px) scale(1.05);
    border-color: var(--primary-purple);
    box-shadow: 0 10px 30px rgba(88, 101, 242, 0.3);
}
```

### Navigation System

```css
nav {
    position: fixed;
    top: 0;
    width: 100%;
    backdrop-filter: blur(20px);
    background: rgba(12, 14, 20, 0.85);
    z-index: 1000;
    transition: all 0.3s ease;
    border-bottom: 1px solid rgba(88, 101, 242, 0.1);
}

.nav-links a {
    color: var(--text-secondary);
    text-decoration: none;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    font-weight: 500;
    position: relative;
}

.nav-links a::after {
    content: '';
    position: absolute;
    bottom: -5px;
    left: 50%;
    transform: translateX(-50%);
    width: 0;
    height: 2px;
    background: var(--primary-purple);
    transition: width 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.nav-links a:hover::after {
    width: 100%;
}

.nav-links a:hover {
    color: var(--primary-purple);
}
```

---

## Animation System

### Core Animations

```css
/* Fade In Animations */
@keyframes fadeInLeft {
    from { opacity: 0; transform: translateX(-30px); }
    to { opacity: 1; transform: translateX(0); }
}

@keyframes fadeInRight {
    from { opacity: 0; transform: translateX(30px); }
    to { opacity: 1; transform: translateX(0); }
}

@keyframes fadeInUp {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
}

/* Floating Particles */
@keyframes float {
    from { transform: translateY(100vh) translateX(0); }
    to { transform: translateY(-100px) translateX(100px); }
}

/* Pulse Effects */
@keyframes pulse {
    0%, 100% { box-shadow: 0 0 0 0 rgba(0, 212, 170, 0.7); }
    50% { box-shadow: 0 0 0 10px rgba(0, 212, 170, 0); }
}

/* Rotation */
@keyframes rotate {
    to { transform: rotate(360deg); }
}

/* Animation Classes */
.fade-in-left { animation: fadeInLeft 1s ease; }
.fade-in-right { animation: fadeInRight 1s ease; }
.fade-in-up { 
    animation: fadeInUp 0.6s ease;
    opacity: 0;
    animation-fill-mode: forwards;
}
```

### Interactive Effects

```css
/* Button Ripple Effect */
@keyframes ripple {
    to {
        transform: scale(4);
        opacity: 0;
    }
}

/* Hover Transforms */
.card:hover { transform: translateY(-5px); }
.btn:hover { transform: translateY(-2px); }

/* Loading Shimmer */
@keyframes shimmer {
    0% { transform: translateX(-100%); }
    100% { transform: translateX(100%); }
}
```

### Particle System

```css
.particles {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
    z-index: 1;
}

.particle {
    position: absolute;
    width: 4px;
    height: 4px;
    background: var(--primary-purple);
    border-radius: 50%;
    opacity: 0.3;
    animation: float 20s infinite linear;
}
```

---

## Layout Patterns

### Container System
```css
.container {
    max-width: 1400px;
    margin: 0 auto;
    padding: 2rem;
    position: relative;
    z-index: 2;
}

.section {
    padding: 5rem 0;
    position: relative;
}
```

### Grid Systems
```css
.grid {
    display: grid;
    gap: 2rem;
}

.grid-auto {
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
}

.features-grid {
    grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
    gap: 2rem;
}

.games-grid {
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
    gap: 1.5rem;
}
```

### Hero Layout
```css
.hero {
    min-height: 100vh;
    display: flex;
    align-items: center;
    padding: 8rem 2rem 4rem;
    position: relative;
    background: radial-gradient(ellipse at center top, rgba(88, 101, 242, 0.15) 0%, transparent 50%);
}

.hero-content {
    max-width: 1400px;
    margin: 0 auto;
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 4rem;
    align-items: center;
}
```

---

## CSS Injection Templates

### Core Variables Injection
```css
/* Inject Obsidian Design System Variables */
:root {
    --obsidian-primary: #5865F2 !important;
    --obsidian-secondary: #8B5FBF !important;
    --obsidian-accent: #00D4AA !important;
    --obsidian-dark: #0C0E14 !important;
    --obsidian-card: #1A1D26 !important;
    --obsidian-text: #FFFFFF !important;
    --obsidian-text-secondary: #B9BBBE !important;
    --obsidian-border: #2A2D38 !important;
}
```

### Button Style Injection
```css
/* Override existing buttons with Obsidian style */
button, .btn, input[type="submit"], input[type="button"] {
    background: linear-gradient(135deg, var(--obsidian-primary), #4752C4) !important;
    color: white !important;
    border: none !important;
    padding: 0.75rem 1.5rem !important;
    border-radius: 8px !important;
    font-weight: 600 !important;
    transition: all 0.3s ease !important;
    cursor: pointer !important;
}

button:hover, .btn:hover {
    transform: translateY(-2px) !important;
    box-shadow: 0 10px 30px rgba(88, 101, 242, 0.4) !important;
}

/* Secondary/Outline buttons */
.btn-secondary, .button-secondary {
    background: transparent !important;
    border: 1px solid var(--obsidian-primary) !important;
    color: var(--obsidian-primary) !important;
}
```

### Card Component Injection
```css
/* Apply Obsidian card styling to existing cards */
.card, .panel, .box, article {
    background: var(--obsidian-card) !important;
    border: 1px solid var(--obsidian-border) !important;
    border-radius: 16px !important;
    padding: 2rem !important;
    transition: all 0.3s ease !important;
    color: var(--obsidian-text) !important;
}

.card:hover, .panel:hover, .box:hover {
    transform: translateY(-5px) !important;
    border-color: var(--obsidian-primary) !important;
    box-shadow: 0 20px 40px rgba(88, 101, 242, 0.15) !important;
}
```

### Navigation Injection
```css
/* Override existing navigation */
nav, .navbar, header {
    background: rgba(12, 14, 20, 0.85) !important;
    backdrop-filter: blur(20px) !important;
    border-bottom: 1px solid rgba(88, 101, 242, 0.1) !important;
}

nav a, .navbar a, .nav-link {
    color: var(--obsidian-text-secondary) !important;
    text-decoration: none !important;
    transition: all 0.3s ease !important;
    position: relative !important;
}

nav a:hover, .navbar a:hover, .nav-link:hover {
    color: var(--obsidian-primary) !important;
}

/* Add underline effect */
nav a::after, .nav-link::after {
    content: '' !important;
    position: absolute !important;
    bottom: -5px !important;
    left: 50% !important;
    transform: translateX(-50%) !important;
    width: 0 !important;
    height: 2px !important;
    background: var(--obsidian-primary) !important;
    transition: width 0.3s ease !important;
}

nav a:hover::after, .nav-link:hover::after {
    width: 100% !important;
}
```

### Typography Injection
```css
/* Override typography with Obsidian system */
body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', sans-serif !important;
    background: var(--obsidian-dark) !important;
    color: var(--obsidian-text) !important;
    line-height: 1.6 !important;
}

h1, h2, h3, h4, h5, h6 {
    color: var(--obsidian-text) !important;
    font-weight: 600 !important;
    line-height: 1.2 !important;
}

h1 { font-size: clamp(2.5rem, 6vw, 4.5rem) !important; font-weight: 900 !important; }
h2 { font-size: clamp(2rem, 5vw, 3rem) !important; font-weight: 800 !important; }
h3 { font-size: clamp(1.5rem, 4vw, 2.5rem) !important; font-weight: 700 !important; }

/* Gradient text effect for headings */
h1.gradient, h2.gradient, .gradient-text {
    background: linear-gradient(135deg, var(--obsidian-primary), var(--obsidian-secondary), var(--obsidian-accent)) !important;
    -webkit-background-clip: text !important;
    -webkit-text-fill-color: transparent !important;
    background-size: 200% auto !important;
    animation: gradientShift 3s ease infinite !important;
}
```

### Dark Theme Body Injection
```css
/* Complete dark theme override */
body, html {
    background: var(--obsidian-dark) !important;
    color: var(--obsidian-text) !important;
}

/* Override light backgrounds */
.container, .wrapper, main, section {
    background: transparent !important;
}

/* Text color overrides */
p, span, div, li, td {
    color: var(--obsidian-text-secondary) !important;
}

/* Form elements */
input, textarea, select {
    background: var(--obsidian-card) !important;
    border: 1px solid var(--obsidian-border) !important;
    color: var(--obsidian-text) !important;
    border-radius: 8px !important;
    padding: 0.75rem !important;
}

input:focus, textarea:focus, select:focus {
    border-color: var(--obsidian-primary) !important;
    box-shadow: 0 0 0 3px rgba(88, 101, 242, 0.1) !important;
    outline: none !important;
}
```

---

## Implementation Guidelines

### CSS Injection Strategy

1. **Variable Injection First**: Always start by injecting CSS custom properties
2. **Progressive Enhancement**: Apply styles from general to specific
3. **Use !important Judiciously**: Only for overriding existing styles
4. **Test Responsiveness**: Ensure mobile compatibility

### Responsive Breakpoints
```css
/* Mobile First Approach */
@media (max-width: 768px) {
    .container { padding: 1rem !important; }
    .hero-content { grid-template-columns: 1fr !important; }
    .nav-center { display: none !important; }
}

@media (max-width: 1024px) {
    .hero-content { grid-template-columns: 1fr !important; }
}
```

### JavaScript Enhancements

```javascript
// Add Obsidian interactive effects
document.addEventListener('DOMContentLoaded', function() {
    // Smooth scroll for navigation
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) target.scrollIntoView({ behavior: 'smooth' });
        });
    });
    
    // Button ripple effect
    document.querySelectorAll('button, .btn').forEach(btn => {
        btn.style.position = 'relative';
        btn.style.overflow = 'hidden';
        
        btn.addEventListener('click', function(e) {
            const ripple = document.createElement('span');
            const rect = this.getBoundingClientRect();
            const size = Math.max(rect.width, rect.height);
            
            ripple.style.cssText = `
                position: absolute;
                border-radius: 50%;
                background: rgba(255, 255, 255, 0.3);
                width: ${size}px;
                height: ${size}px;
                left: ${e.clientX - rect.left - size/2}px;
                top: ${e.clientY - rect.top - size/2}px;
                transform: scale(0);
                animation: ripple 0.6s linear;
                pointer-events: none;
            `;
            
            this.appendChild(ripple);
            setTimeout(() => ripple.remove(), 600);
        });
    });
});

// Add ripple animation
const style = document.createElement('style');
style.textContent = `
    @keyframes ripple {
        to { transform: scale(4); opacity: 0; }
    }
`;
document.head.appendChild(style);
```

### Quick Injection Template

```css
/* OBSIDIAN NETWORK DESIGN SYSTEM INJECTION */
/* Copy and paste this into any website's CSS or browser developer tools */

:root {
    --obsidian-primary: #5865F2;
    --obsidian-secondary: #8B5FBF;
    --obsidian-accent: #00D4AA;
    --obsidian-dark: #0C0E14;
    --obsidian-card: #1A1D26;
    --obsidian-text: #FFFFFF;
    --obsidian-text-secondary: #B9BBBE;
    --obsidian-border: #2A2D38;
}

body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif !important;
    background: var(--obsidian-dark) !important;
    color: var(--obsidian-text) !important;
}

button, .btn, input[type="submit"] {
    background: linear-gradient(135deg, var(--obsidian-primary), #4752C4) !important;
    color: white !important;
    border: none !important;
    padding: 0.75rem 1.5rem !important;
    border-radius: 8px !important;
    font-weight: 600 !important;
    transition: all 0.3s ease !important;
}

button:hover, .btn:hover {
    transform: translateY(-2px) !important;
    box-shadow: 0 10px 30px rgba(88, 101, 242, 0.4) !important;
}

.card, .panel, article {
    background: var(--obsidian-card) !important;
    border: 1px solid var(--obsidian-border) !important;
    border-radius: 16px !important;
    color: var(--obsidian-text) !important;
    transition: all 0.3s ease !important;
}

.card:hover, .panel:hover, article:hover {
    transform: translateY(-5px) !important;
    border-color: var(--obsidian-primary) !important;
    box-shadow: 0 20px 40px rgba(88, 101, 242, 0.15) !important;
}

nav, .navbar {
    background: rgba(12, 14, 20, 0.85) !important;
    backdrop-filter: blur(20px) !important;
    border-bottom: 1px solid rgba(88, 101, 242, 0.1) !important;
}

a {
    color: var(--obsidian-text-secondary) !important;
    transition: color 0.3s ease !important;
}

a:hover {
    color: var(--obsidian-primary) !important;
}

h1, h2, h3, h4, h5, h6 {
    color: var(--obsidian-text) !important;
}

@keyframes gradientShift {
    to { background-position: 200% center; }
}

.gradient-text {
    background: linear-gradient(135deg, var(--obsidian-primary), var(--obsidian-secondary), var(--obsidian-accent)) !important;
    -webkit-background-clip: text !important;
    -webkit-text-fill-color: transparent !important;
    background-size: 200% auto !important;
    animation: gradientShift 3s ease infinite !important;
}
```

---

## Usage Notes

- **Consistency**: Always use the provided color variables and component patterns
- **Accessibility**: Maintain proper contrast ratios and focus states
- **Performance**: CSS animations use `transform` and `opacity` for optimal performance
- **Scalability**: All font sizes use `clamp()` for responsive typography
- **Brand Integrity**: The gradient text effect and purple color scheme are core brand elements

This design system ensures the Obsidian Network brand experience remains consistent across all digital touchpoints while providing flexibility for different implementation contexts.