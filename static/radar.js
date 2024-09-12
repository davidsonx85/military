// radar.js

const canvas = document.getElementById('radarCanvas');
const ctx = canvas.getContext('2d');
const width = canvas.width;
const height = canvas.height;
const centerX = width / 2;
const centerY = height / 2;
const radius = Math.min(centerX, centerY) - 20;

let animationRadius = 0;  // Zmienna dla animowanego okręgu

// Przechowuje dane punktów
const points = [];

// Funkcja do dodawania punktów
function addPoint(distanceInMeters, directionInDegrees) {
    const angle = (90 - directionInDegrees) * Math.PI / 180; 
    const scaledDistance = (distanceInMeters / 100) * radius;
    points.push({ angle, distance: scaledDistance });
}

// Funkcja do rysowania okręgów radaru
function drawRadarCircles() {
    ctx.strokeStyle = '#00FF00';
    ctx.lineWidth = 0.8;
    for (let i = 1; i <= 3; i++) {
        ctx.beginPath();
        ctx.arc(centerX, centerY, (radius / 3) * i, 0, 2 * Math.PI);
        ctx.stroke();
    }
}

// Funkcja do rysowania linii kierunków świata
function drawDirections() {
    const directions = ['N', 'E', 'S', 'W'];
    const angles = [Math.PI / 2, 0, 3 * Math.PI / 2, Math.PI]; 

    ctx.fillStyle = '#00FF00';
    ctx.font = '12px Arial';
    for (let i = 0; i < directions.length; i++) {
        const angle = angles[i];
        const x = centerX + Math.cos(angle) * (radius + 10);
        const y = centerY - Math.sin(angle) * (radius + 10);
        ctx.fillText(directions[i], x - 8, y + 4);
    }
}

// Funkcja do rysowania krzyża
function drawCross() {
    ctx.strokeStyle = '#00FF00';
    ctx.lineWidth = 0.5;
    
    ctx.beginPath();
    ctx.moveTo(centerX, centerY - radius);
    ctx.lineTo(centerX, centerY + radius);
    ctx.stroke();
    
    ctx.beginPath();
    ctx.moveTo(centerX - radius, centerY);
    ctx.lineTo(centerX + radius, centerY);
    ctx.stroke();
}

// Funkcja do rysowania linii do punktu
function drawLineToPoint(angle, distance) {
    const x = centerX + Math.cos(angle) * distance;
    const y = centerY - Math.sin(angle) * distance;

    ctx.strokeStyle = '#00FF00';
    ctx.lineWidth = 0.3;
    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    ctx.lineTo(x, y);
    ctx.stroke();

    return { x, y };
}

// Funkcja do rysowania punktu
function drawPointAndLabel(x, y, distance, label) {
    if (animationRadius >= distance) {
        ctx.fillStyle = '#00FF00';
        ctx.beginPath();
        ctx.arc(x, y, 5, 0, 2 * Math.PI);
        ctx.fill();

        ctx.font = '14px Arial';
        ctx.fillText(label, x + 10, y);
    }
}

// Funkcja do animacji radaru
function animateRadar() {
    ctx.clearRect(0, 0, width, height);

    drawRadarCircles();
    drawDirections();
    drawCross();

    ctx.strokeStyle = '#00FF00';
    ctx.beginPath();
    ctx.arc(centerX, centerY, animationRadius, 0, 2 * Math.PI);
    ctx.stroke();

    animationRadius += 0.5;
    if (animationRadius > radius) {
        animationRadius = 0;
    }

    points.forEach((point, index) => {
        const { x, y } = drawLineToPoint(point.angle, point.distance);
        drawPointAndLabel(x, y, point.distance, String.fromCharCode(65 + index));
    });

    requestAnimationFrame(animateRadar);
}

// Dodaj punkty do radaru (przykładowe dane)
addPoint(30, 45);
addPoint(75, 225);

// Inicjalizacja animacji
animateRadar();
