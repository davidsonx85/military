document.addEventListener('DOMContentLoaded', function () {
    const correctPin = '1234';
    const loginButton = document.getElementById('login-button');
    const pinInput = document.getElementById('pin-input');
    const errorMessage = document.getElementById('error-message');
    const container = document.querySelector('.container');
    const loginContainer = document.querySelector('.login-container');
    const missionListElement = document.getElementById('mission-list');
    const downloadLogButton = document.getElementById('download-log');
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
    let startTimes = {}; // Przechowuje czasy rozpoczęcia dla każdej misji
    let endTimes = {};   // Przechowuje czasy zakończenia dla każdej misji

    // Update time with seconds
    function updateTime() {
        const now = new Date();
        const timeString = now.toLocaleTimeString('en-GB');
        document.getElementById('current-time').textContent = `${timeString}`;
    }

    setInterval(updateTime, 1000);

    loginButton.addEventListener('click', function () {
        const enteredPin = pinInput.value;
        if (enteredPin === correctPin) {
            loginContainer.style.display = 'none';
            container.style.display = 'block';
            errorMessage.style.display = 'none'; // Ukryj komunikat o błędzie po poprawnym zalogowaniu
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
            <span id="exclamation-${index}" class="exclamation" style="display:none;">!</span>
            <span class="static-brackets" id="right-bracket-${index}">]</span>
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
        const exclamation = listItem.querySelector(`#exclamation-${index}`);
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
            exclamation.style.display = 'none';
            leftBracket.style.color = '#0000FF'; // Ustaw kolor nawiasów na niebieski
            rightBracket.style.color = '#0000FF'; // Ustaw kolor nawiasów na niebieski
            startTimes[index] = new Date(); // Zapisz czas rozpoczęcia
        });

        stopButton.addEventListener('click', function () {
            stopButton.style.display = 'none';
            startButton.style.display = 'inline-block';
            blinker.classList.remove('rotate-blinker');
            blinker.style.display = 'none';
            exclamation.style.display = 'inline-block';
            exclamation.classList.add('blink-exclamation');
            leftBracket.style.color = '#FF0000'; // Ustaw kolor nawiasów na czerwony
            rightBracket.style.color = '#FF0000'; // Ustaw kolor nawiasów na czerwony
        });

        endButton.addEventListener('click', function () {
            blinker.style.display = 'none';
            exclamation.style.display = 'none';
            endTimes[index] = new Date(); // Zapisz czas zakończenia

            if (!startTimes[index]) {
                alert('Mission must be started before ending.');
                return;
            }

            const startTime = startTimes[index];
            const endTime = endTimes[index];
            const timeDiff = Math.round((endTime - startTime) / 60000); // Różnica w minutach

            const missionLog = `# MISSION ${index + 1} COMPLETED #\n` +
                `# Start time: ${startTime.toLocaleString()} #\n` +
                `# End time: ${endTime.toLocaleString()} #\n` +
                `# Total time: ${timeDiff} minutes #\n` +
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
                missionListElement.innerHTML = '<p class="error-message">Failed to load missions. Try again later.</p>';
            });
    }

    downloadLogButton.addEventListener('click', function () {
        if (Object.keys(startTimes).length === 0 || Object.keys(endTimes).length === 0) {
            alert('You must start and end at least one mission to download the report.');
            return;
        }

        const reportContent = Object.keys(startTimes).map(index => {
            const startTime = startTimes[index];
            const endTime = endTimes[index];
            const timeDiff = Math.round((endTime - startTime) / 60000); // Różnica w minutach
            return `# MISSION ${parseInt(index) + 1} REPORT #\n` +
                `# Start time: ${startTime.toLocaleString()} #\n` +
                `# End time: ${endTime.toLocaleString()} #\n` +
                `# Total time: ${timeDiff} minutes #\n` +
                `--------------------------------------------\n`;
        }).join('\n');

        const blob = new Blob([reportContent], { type: 'text/plain' });
        const link = document.createElement('a');
        link.href = window.URL.createObjectURL(blob);
        link.download = 'mission_report.txt';
        link.click();
    });

    function updateWeather() {
        updateButton.disabled = true; // Blokuj przycisk podczas pobierania danych
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
            .catch(error => console.error('Error updating weather:', error))
            .finally(() => {
                updateButton.disabled = false; // Odblokuj przycisk po zakończeniu
            });
    }

    // Aktualizuj dane pogody po załadowaniu strony
    updateWeather();

    // Obsługuje kliknięcie przycisku aktualizacji pogody
    updateButton.addEventListener('click', function () {
        updateWeather();
    });
});
