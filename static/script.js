document.addEventListener('DOMContentLoaded', function () {
    const correctPin = '1234';
    const loginButton = document.getElementById('login-button');
    const pinInput = document.getElementById('pin-input');
    const errorMessage = document.getElementById('error-message');
    const container = document.querySelector('.container');
    const loginContainer = document.querySelector('.login-container');
    const missionListElement = document.getElementById('mission-list');
    const downloadLogButton = document.getElementById('download-log');

    const notificationElement = document.getElementById('notification');
    const notificationText = document.getElementById('notification-text');
    const yesButton = document.getElementById('yes-button');
    const noButton = document.getElementById('no-button');

    const updateButton = document.getElementById('update-weather');
    const lastUpdatedElement = document.getElementById('last-updated');
    const temperatureElement = document.getElementById('temperature');
    const pressureElement = document.getElementById('pressure');
    const humidityElement = document.getElementById('humidity');
    const windSpeedElement = document.getElementById('wind-speed');
    const windDirectionElement = document.getElementById('wind-direction');
    const sunriseElement = document.getElementById('sunrise');
    const sunsetElement = document.getElementById('sunset');

    let missionData = '';
    let currentMissionIndex = 0;
    let missionTasks = [];

    // Update time with seconds
    function updateTime() {
        const now = new Date();
        const dateString = now.toLocaleDateString();
        const timeString = now.toLocaleTimeString('en-GB');
        document.getElementById('current-time').textContent = `${timeString}`;
    }

    setInterval(updateTime, 1000);

    loginButton.addEventListener('click', function () {
        const enteredPin = pinInput.value;
        if (enteredPin === correctPin) {
            loginContainer.style.display = 'none';
            container.style.display = 'block';
            loadMissions();
        } else {
            errorMessage.style.display = 'block';
        }
    });

    function typeTaskText(taskText, index) {
        const listItem = document.createElement('div');
        listItem.classList.add('mission-item');
        listItem.innerHTML = `
            <span class="static-brackets" id="left-bracket-${index}">[</span>
            <span id="blinker-${index}" class="blinker" style="display:none;">|</span>
            <span class="static-brackets" id="right-bracket-${index}">]</span>
            <span class="arrow" id="arrow-${index}">-></span>
            <label id="task-label-${index}" class="task-text"></label>
            <div class="task-controls">
                <button class="start-button" id="start-${index}">Start</button>
                <button class="stop-button" id="stop-${index}" style="display:none;">Stop</button>
                <button class="end-button" id="end-${index}" style="display:none;">End</button>
            </div>
        `;
        missionListElement.appendChild(listItem);

        const label = listItem.querySelector(`#task-label-${index}`);
        const startButton = listItem.querySelector(`#start-${index}`);
        const stopButton = listItem.querySelector(`#stop-${index}`);
        const endButton = listItem.querySelector(`#end-${index}`);
        const blinker = listItem.querySelector(`#blinker-${index}`);
        const arrow = listItem.querySelector(`#arrow-${index}`);
        const leftBracket = listItem.querySelector(`#left-bracket-${index}`);
        const rightBracket = listItem.querySelector(`#right-bracket-${index}`);

        function typeWriter(text, element, i = 0) {
            if (i < text.length) {
                element.textContent += text.charAt(i);
                setTimeout(() => typeWriter(text, element, i + 1), 50);
            }
        }

        typeWriter(taskText, label);

        startButton.addEventListener('click', function () {
            startButton.style.display = 'none';
            stopButton.style.display = 'inline-block';
            endButton.style.display = 'inline-block';
            blinker.style.display = 'inline-block';
            blinker.classList.add('rotate-blinker');
            leftBracket.style.color = '#0000FF';
            rightBracket.style.color = '#0000FF';
            arrow.style.display = 'none';
        });

        stopButton.addEventListener('click', function () {
            stopButton.style.display = 'none';
            startButton.style.display = 'inline-block';
            blinker.classList.remove('rotate-blinker');
            blinker.style.display = 'none';
            leftBracket.style.color = '#FF0000';
            rightBracket.style.color = '#FF0000';
            arrow.style.display = 'inline-block';
            arrow.classList.add('blink-arrow');
        });

        endButton.addEventListener('click', function () {
            blinker.style.display = 'none';
            blinker.classList.remove('rotate-blinker');
            const endTime = new Date();
            const missionLog = `# MISSION ${index + 1} COMPLETED #\n` +
                `# Timestamp: ${endTime.toLocaleString()} #\n` +
                `# Mission Description: "${taskText}" #\n` +
                `--------------------------------------------\n`;
            missionData += missionLog;

            fetch('/save_log', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ logData: missionData })
            }).then(response => response.json())
                .then(data => console.log(data.message))
                .catch(error => console.error('Error saving log:', error));

            missionListElement.innerHTML = '';
            currentMissionIndex++;
            if (currentMissionIndex < missionTasks.length) {
                showNextMission();
            } else {
                alert('Wszystkie misje zakończone.');
            }
        });
    }

    function showNextMission() {
        if (currentMissionIndex < missionTasks.length) {
            const taskText = missionTasks[currentMissionIndex];
            typeTaskText(taskText, currentMissionIndex);
        }
    }

    function loadMissions() {
        fetch('/load_missions')
            .then(response => response.json())
            .then(missions => {
                missionTasks = missions;
                currentMissionIndex = 0;
                missionListElement.innerHTML = '';
                showNextMission();
            })
            .catch(error => {
                console.error('Error loading missions:', error);
                alert('Failed to load missions.');
            });
    }

    downloadLogButton.addEventListener('click', function () {
        window.location.href = '/download_log';
    });

    function updateWeather() {
        fetch('/get_weather')
            .then(response => response.json())
            .then(data => {
                if (data.error) {
                    console.error('Error fetching weather data:', data.error);
                    return;
                }
                // Aktualizuj dane pogodowe na stronie
                temperatureElement.textContent = `${data.temperature} °C`;
                pressureElement.textContent = `${data.pressure} hPa`;
                humidityElement.textContent = `${data.humidity} %`;
                windSpeedElement.textContent = `${data.wind_speed} m/s`;
                windDirectionElement.textContent = `${data.wind_direction} °`;
                sunriseElement.textContent = data.sunrise;
                sunsetElement.textContent = data.sunset;

                // Aktualizuj czas ostatniej aktualizacji
                const now = new Date();
                const timeString = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;
                lastUpdatedElement.textContent = timeString;
            })
            .catch(error => console.error('Error updating weather:', error));
    }

    // Aktualizuj dane pogody po załadowaniu strony
    updateWeather();

    // Obsługuje kliknięcie przycisku aktualizacji pogody
    updateButton.addEventListener('click', function() {
        updateWeather();
    });
});