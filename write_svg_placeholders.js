const fs = require('fs');
const path = require('path');

const uploadDir = path.join(__dirname, 'pos-backend', 'uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Function to generate a beautiful SVG with a gradient and an emoji/icon label
const createSVG = (categoryName, emoji, startColor, endColor) => `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 200" width="100%" height="100%">
    <defs>
        <linearGradient id="grad-${categoryName}" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:${startColor};stop-opacity:1" />
            <stop offset="100%" style="stop-color:${endColor};stop-opacity:1" />
        </linearGradient>
        <filter id="shadow" x="-10%" y="-10%" width="120%" height="120%">
            <feDropShadow dx="0" dy="8" stdDeviation="6" flood-color="#000" flood-opacity="0.3"/>
        </filter>
    </defs>
    <rect width="100%" height="100%" fill="url(#grad-${categoryName})" />
    <g transform="translate(200, 100)" text-anchor="middle">
        <text y="-20" font-family="system-ui, -apple-system, sans-serif" font-size="54" filter="url(#shadow)">${emoji}</text>
        <text y="35" font-family="system-ui, -apple-system, sans-serif" font-weight="bold" font-size="20" fill="#ffffff" letter-spacing="2" filter="url(#shadow)">${categoryName.toUpperCase()}</text>
    </g>
</svg>
`;

const categories = {
    'beverage.svg': { name: 'Beverage', emoji: '🥤', start: '#f43f5e', end: '#be123c' }, // Rose/Red
    'snack.svg': { name: 'Snack', emoji: '🍪', start: '#f59e0b', end: '#b45309' }, // Amber/Yellow
    'electronic.svg': { name: 'Electronic', emoji: '🔌', start: '#06b6d4', end: '#0e7490' }, // Cyan
    'groceries.svg': { name: 'Groceries', emoji: '🥦', start: '#10b981', end: '#047857' }, // Emerald/Green
    'bakery.svg': { name: 'Bakery', emoji: '🍞', start: '#f97316', end: '#c2410c' }, // Orange
    'clothing.svg': { name: 'Clothing', emoji: '👕', start: '#8b5cf6', end: '#6d28d9' }, // Violet/Purple
    'fitness.svg': { name: 'Fitness', emoji: '🧘', start: '#14b8a6', end: '#0f766e' }, // Teal
    'office.svg': { name: 'Office', emoji: '📎', start: '#64748b', end: '#475569' } // Slate/Gray
};

Object.entries(categories).forEach(([filename, info]) => {
    const filePath = path.join(uploadDir, filename);
    const svgContent = createSVG(info.name, info.emoji, info.start, info.end);
    fs.writeFileSync(filePath, svgContent.trim());
    console.log(`Created beautiful SVG placeholder: ${filename}`);
});
