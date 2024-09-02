from flask import Flask, render_template, request, jsonify, send_file
import os

app = Flask(__name__)

# Ścieżki do plików
MISSION_FILE = 'static/missions.txt'
LOG_FILE = 'static/mission_log.txt'

# Strona główna
@app.route('/')
def index():
    return render_template('index.html')

# Wczytaj misje
@app.route('/load_missions', methods=['GET'])
def load_missions():
    try:
        # Otwórz plik z kodowaniem UTF-8
        with open(MISSION_FILE, 'r', encoding='utf-8') as file:
            missions = file.read().splitlines()
        missions = [line for line in missions if line.strip() != '']
        return jsonify(missions)
    except Exception as e:
        return str(e), 500

# Zapisz logi misji
@app.route('/save_log', methods=['POST'])
def save_log():
    log_data = request.json.get('logData', '')
    try:
        with open(LOG_FILE, 'a', encoding='utf-8') as file:
            file.write(log_data + '\n')
        return jsonify({"message": "Log saved successfully!"}), 200
    except Exception as e:
        return str(e), 500

# Pobierz logi
@app.route('/download_log')
def download_log():
    if os.path.exists(LOG_FILE):
        return send_file(LOG_FILE, as_attachment=True)
    else:
        return jsonify({"error": "Log file does not exist."}), 404

if __name__ == '__main__':
    app.run(debug=True)
