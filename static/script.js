document.addEventListener('DOMContentLoaded', function() {
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

    let missionData = '';
    let currentMissionIndex = 0;
    let missionTasks = [];

    function updateTime() {
        const now = new Date();
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        const seconds = String(now.getSeconds()).padStart(2, '0');
        const timeString = `${hours}:${minutes}:${seconds}`;
        document.getElementById('current-time').textContent = timeString;
    }

    // Aktualizuj czas co sekundę
    setInterval(updateTime, 1000);

    loginButton.addEventListener('click', function() {
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
            <!-- <span class="task-number">${index + 1}.</span> -->
            <span class="task-number"></span>
            <span id="blinker-${index}" class="blinker" style="display:none;">|</span>
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

        // Efekt typowania
        function typeWriter(text, element, i = 0) {
            if (i < text.length) {
                element.textContent += text.charAt(i);
                setTimeout(() => typeWriter(text, element, i + 1), 50);
            }
        }

        // Rozpoczęcie efektu typowania
        typeWriter(taskText, label);

        startButton.addEventListener('click', function() {
            startButton.style.display = 'none';
            stopButton.style.display = 'inline-block';
            endButton.style.display = 'inline-block';

            // Pokaż i uruchom obrotowy blinker
            blinker.style.display = 'inline-block';
            blinker.classList.add('rotate-blinker');
        });

        stopButton.addEventListener('click', function() {
            stopButton.style.display = 'none';
            startButton.style.display = 'inline-block';
        });

        endButton.addEventListener('click', function() {
            // Ukryj blinker i zatrzymaj obroty
            blinker.style.display = 'none';
            blinker.classList.remove('rotate-blinker');

            const endTime = new Date();
            const missionLog = `# MISSION ${index + 1} COMPLETED #\n` +
                               `# Timestamp: ${endTime.toLocaleString()} #\n` +
                               `# Mission Description: "${taskText}" #\n` +
                               `--------------------------------------------\n`;
            missionData += missionLog;

            // Zapisz logi do serwera
            fetch('/save_log', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ logData: missionData })
            }).then(response => response.json())
              .then(data => console.log(data.message))
              .catch(error => console.error('Error saving log:', error));

            // Wczytaj kolejną misję
            missionListElement.innerHTML = ''; // Czyszczenie listy misji
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
                missionListElement.innerHTML = ''; // Czyszczenie listy misji
                showNextMission();
            })
            .catch(error => {
                console.error('Error loading missions:', error);
                alert('Failed to load missions. Please ensure the "missions.txt" file is present in the same directory.');
            });
    }

    downloadLogButton.addEventListener('click', function() {
        window.location.href = '/download_log';
    });
});
