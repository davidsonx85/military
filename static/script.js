document.addEventListener('DOMContentLoaded', function() {
    const correctPin = '1234'; // Ustawienie prawidłowego PINu
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

    loginButton.addEventListener('click', function() {
        const enteredPin = pinInput.value;
        if (enteredPin === correctPin) {
            loginContainer.style.display = 'none';
            container.style.display = 'block';
            loadMissions(); // Automatyczne wczytywanie misji po zalogowaniu
        } else {
            errorMessage.style.display = 'block';
        }
    });

    function typeTaskText(taskText, index) {
        const listItem = document.createElement('li');
        listItem.classList.add('mission-item');
        listItem.innerHTML = `
            <span class="task-number">${index + 1}.</span>
            <label id="task-label-${index}" class="task-text"></label>
            <div class="task-controls">
                <button class="start-button" id="start-${index}">Start</button>
                <button class="stop-button" id="stop-${index}" style="display:none;">Stop</button>
                <button class="end-button" id="end-${index}" style="display:none;">End</button>
                <span class="timer" id="timer-${index}">00:00:00</span>
            </div>
        `;
        missionListElement.appendChild(listItem);

        const label = listItem.querySelector(`#task-label-${index}`);
        const startButton = listItem.querySelector(`#start-${index}`);
        const stopButton = listItem.querySelector(`#stop-${index}`);
        const endButton = listItem.querySelector(`#end-${index}`);
        const timerDisplay = listItem.querySelector(`#timer-${index}`);

        let timer;
        let seconds = 0;
        let startTime;

        // Efekt typowania
        function typeWriter(text, element, i = 0) {
            if (i < text.length) {
                element.textContent += text.charAt(i);
                setTimeout(() => typeWriter(text, element, i + 1), 50); // Tempo wyświetlania liter
            }
        }

        // Rozpoczęcie efektu typowania
        typeWriter(taskText, label);

        startButton.addEventListener('click', function() {
            if (!timer) {
                startTime = new Date();
                timer = setInterval(function() {
                    seconds++;
                    const hours = String(Math.floor(seconds / 3600)).padStart(2, '0');
                    const minutes = String(Math.floor((seconds % 3600) / 60)).padStart(2, '0');
                    const secs = String(seconds % 60).padStart(2, '0');
                    timerDisplay.textContent = `${hours}:${minutes}:${secs}`;
                }, 1000);
                startButton.style.display = 'none';
                stopButton.style.display = 'block';
                endButton.style.display = 'block';
            }
        });

        stopButton.addEventListener('click', function() {
            if (timer) {
                clearInterval(timer);
                timer = null;
                stopButton.style.display = 'none';
                startButton.style.display = 'block';
            }
        });

        endButton.addEventListener('click', function() {
            if (timer) {
                clearInterval(timer);
                timer = null;
                const endTime = new Date();
                const duration = (endTime - startTime) / 1000; // Duration in seconds
                const missionLog = `# MISSION ${index + 1} COMPLETED #\n` +
                                   `# Timestamp: ${endTime.toLocaleString()} #\n` +
                                   `# Duration: ${Math.floor(duration / 60)} minutes ${duration % 60} seconds #\n` +
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

                // Usuwanie zakończonej misji
                missionListElement.innerHTML = ''; // Czyszczenie listy misji

                // Powiadomienie o rozpoczęciu następnej misji
                if (currentMissionIndex < missionTasks.length - 1) {
                    const nextMissionIndex = currentMissionIndex + 1;
                    const nextMissionText = `Czy chcesz rozpocząć misję ${nextMissionIndex + 1}?`;
                    notificationText.textContent = ''; // Czyszczenie poprzedniego tekstu powiadomienia
                    typeWriter(nextMissionText, notificationText);
                    notificationElement.style.display = 'block';
                    yesButton.style.display = 'inline-block';
                    noButton.style.display = 'inline-block';

                    yesButton.onclick = function() {
                        notificationElement.style.display = 'none';
                        yesButton.style.display = 'none';
                        noButton.style.display = 'none';
                        currentMissionIndex++;
                        showNextMission();
                    };

                    noButton.onclick = function() {
                        notificationElement.style.display = 'none';
                        yesButton.style.display = 'none';
                        noButton.style.display = 'none';
                    };
                }
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
