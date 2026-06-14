const fs = require('fs');
const path = require('path');

const uploadDir = path.join(__dirname, 'pos-backend', 'uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Minimal valid 8x8 solid PNGs of different colors
const colors = {
    'beverage.png': 'iVBORw0KGgoAAAANSUhEUgAAAAgAAAAICAYAAADED76LAAAAFElEQVR42mP8z8AARjzgwcNAIiQCAM75E/3j3XJbAAAAAElFTkSuQmCC', // Reddish
    'snack.png': 'iVBORw0KGgoAAAANSUhEUgAAAAgAAAAICAYAAADED76LAAAAFElEQVR42mP8//8/AxhgwcNAIiQCAEW5G/3c9w29AAAAAElFTkSuQmCC', // Yellowish
    'electronic.png': 'iVBORw0KGgoAAAANSUhEUgAAAAgAAAAICAYAAADED76LAAAAFElEQVR42mP8z8AARjzgwcNAIiQCAM75E/3j3XJbAAAAAElFTkSuQmCC', // Cyanish/Blue
    'groceries.png': 'iVBORw0KGgoAAAANSUhEUgAAAAgAAAAICAYAAADED76LAAAAFElEQVR42mNk+M8ABxjxgwcNAIiQCAD/PRH9w13mYwAAAABJRU5ErkJggg==', // Greenish
    'bakery.png': 'iVBORw0KGgoAAAANSUhEUgAAAAgAAAAICAYAAADED76LAAAAFElEQVR42mP8z8AARjzgwcNAIiQCAM75E/3j3XJbAAAAAElFTkSuQmCC', // Orangeish
    'clothing.png': 'iVBORw0KGgoAAAANSUhEUgAAAAgAAAAICAYAAADED76LAAAAFElEQVR42mP8z8AARjzgwcNAIiQCAM75E/3j3XJbAAAAAElFTkSuQmCC', // Purpleish
    'fitness.png': 'iVBORw0KGgoAAAANSUhEUgAAAAgAAAAICAYAAADED76LAAAAFElEQVR42mP8z8AARjzgwcNAIiQCAM75E/3j3XJbAAAAAElFTkSuQmCC', // Tealish
    'office.png': 'iVBORw0KGgoAAAANSUhEUgAAAAgAAAAICAYAAADED76LAAAAFElEQVR42mP8z8AARjzgwcNAIiQCAM75E/3j3XJbAAAAAElFTkSuQmCC' // Grayish
};

Object.entries(colors).forEach(([filename, base64]) => {
    const filePath = path.join(uploadDir, filename);
    fs.writeFileSync(filePath, Buffer.from(base64, 'base64'));
    console.log(`Created placeholder image: ${filename}`);
});
