const canvas = document.getElementById('radarCanvas');
const ctx = canvas.getContext('2d');
const width = canvas.width;
const height = canvas.height;
const centerX = width / 2;
const centerY = height / 2;
const radius = Math.min(centerX, centerY) - 20;

let animationRadius = 0;  // Zmienna dla animowanego okręgu
let isTargetOutOfBounds = false;  // Flaga, czy cel przekroczył maxDistance
const maxDistance = 2000; // Maksymalna odległość w metrach

// Przechowuje dane punktów
const points = [];

// Funkcja do dodawania punktów
function addPoint(distanceInMeters, directionInDegrees, label) {
    const angle = (90 - directionInDegrees) * Math.PI / 180;

    // Skalowanie odległości - jeżeli odległość przekracza maxDistance, skalujemy ją do promienia radaru
    let scaledDistance = (distanceInMeters / maxDistance) * radius;

    if (distanceInMeters > maxDistance) {
        // Ustaw flagę, że cel jest poza zasięgiem
        isTargetOutOfBounds = true;
        // W przypadku gdy punkt przekracza maxDistance, ustawiamy punkt B w środku
        points.push({ angle, distance: 0, label: '?' });
    } else {
        points.push({ angle, distance: scaledDistance, label });
    }
}

// Funkcja do rysowania okręgów radaru
function drawRadarCircles() {
    ctx.strokeStyle = '#00FF00';
    ctx.lineWidth = 1;
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

    // Zmiana koloru animowanego okręgu na czerwony, jeśli punkt przekroczył maxDistance
    if (isTargetOutOfBounds) {
        ctx.stroke
        ctx.strokeStyle = '#FF0000'; // Czerwony
    } else {
        ctx.strokeStyle = '#00FF00'; // Zielony
    }

    ctx.beginPath();
    ctx.arc(centerX, centerY, animationRadius, 0, 2 * Math.PI);
    ctx.stroke();

    animationRadius += 0.5;
    if (animationRadius > radius) {
        animationRadius = 0;
    }

    points.forEach((point, index) => {
        const { x, y } = drawLineToPoint(point.angle, point.distance);
        drawPointAndLabel(x, y, point.distance, point.label);
    });

    requestAnimationFrame(animateRadar);
}

// Dodaj punkty do radaru
// Punkt A: 0,0 zawsze w środku 53.56508066681356, 18.334472220112147 | 53.56602227701458, 18.35406004439499
const latA = 53.56508066681356, lonA = 18.334472220112147; // Punkt A (twoja lokalizacja)
const latB = 53.5670543245811, lonB = 18.313067303394597; // Punkt B (cel B) 53.5670543245811, 18.313067303394597
const latC = 53.56298320320954, lonC = 18.355913378305743; // Punkt C (cel C)

// Obliczanie dystansu i azymutu dla punktu B
const distanceB = haversineDistance(latA, lonA, latB, lonB); // Dystans w metrach dla punktu B
const azimuthB = calculateAzimuth(latA, lonA, latB, lonB);   // Kierunek w stopniach dla punktu B

// Obliczanie dystansu i azymutu dla punktu C
const distanceC = haversineDistance(latA, lonA, latC, lonC); // Dystans w metrach dla punktu C
const azimuthC = calculateAzimuth(latA, lonA, latC, lonC);   // Kierunek w stopniach dla punktu C

// Dodaj punkty B i C na radarze
addPoint(distanceB, azimuthB, 'Paradisus'); // Punkt B
addPoint(distanceC, azimuthC, 'Home'); // Punkt C

// Inicjalizacja animacji
animateRadar();

// Funkcja obliczająca dystans
function haversineDistance(lat1, lon1, lat2, lon2) {
    const R = 6371e3; // Promień Ziemi w metrach
    const φ1 = lat1 * Math.PI / 180;
    const φ2 = lat2 * Math.PI / 180;
    const Δφ = (lat2 - lat1) * Math.PI / 180;
    const Δλ = (lon2 - lon1) * Math.PI / 180;

    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    const distance = R * c;
    return distance;
}

// Funkcja obliczająca azymut
function calculateAzimuth(lat1, lon1, lat2, lon2) {
    const φ1 = lat1 * Math.PI / 180;
    const φ2 = lat2 * Math.PI / 180;
    const Δλ = (lon2 - lon1) * Math.PI / 180;

    const y = Math.sin(Δλ) * Math.cos(φ2);
    const x = Math.cos(φ1) * Math.sin(φ2) -
              Math.sin(φ1) * Math.cos(φ2) * Math.cos(Δλ);
    const θ = Math.atan2(y, x);

    const azimuth = (θ * 180 / Math.PI + 360) % 360;  // Zamiana na stopnie i zakres 0-360
    return azimuth;
}
