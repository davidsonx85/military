from flask import Flask, jsonify, render_template
import serial

app = Flask(__name__)

def get_satellites():
    satellites = []
    try:
        # Otwórz port szeregowy z odpowiednimi parametrami
        with serial.Serial('/dev/ttyUSB0', baudrate=9600, timeout=1) as ser:
            while True:
                # Odczytaj linię danych
                line = ser.readline().decode('ascii', errors='replace').strip()
                # Sprawdź, czy linia zaczyna się od $GPGSV
                if line.startswith('$GPGSV'):
                    parts = line.split(',')
                    satellites_in_view = int(parts[3])
                    for i in range(4, len(parts) - 1, 4):
                        try:
                            sat_id = int(parts[i])
                            elevation = int(parts[i+1])
                            azimuth = int(parts[i+2])
                            snr = int(parts[i+3]) if parts[i+3] else None
                            satellites.append({
                                'sat_id': sat_id,
                                'elevation': elevation,
                                'azimuth': azimuth,
                                'snr': snr
                            })
                        except (IndexError, ValueError):
                            continue
                    break  # Wychodzimy po przetworzeniu jednego komunikatu GPGSV
    except Exception as e:
        return {'error': str(e)}  # Zwróć komunikat o błędzie jako JSON
    return {'data': satellites}  # Zwróć dane satelitów

@app.route('/get-satellites', methods=['GET'])
def get_satellites_data():
    result = get_satellites()
    if 'error' in result:
        return jsonify({'error': result['error']}), 500
    return jsonify(result['data'])

@app.route('/gps')
def gps_page():
    return render_template('index.html')

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
