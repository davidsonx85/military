from flask import Flask, render_template, request, jsonify, send_file
import requests
import os
import datetime
import random
from geopy.distance import geodesic

app = Flask(__name__)

# Ścieżki do plików
MISSION_FILE = 'static/missions.txt'
LOG_FILE = 'static/mission_log.txt'

# Twój klucz API z OpenWeatherMap
API_KEY = 'deb991d27f8d305ba2999cfc0df1e6fb'

# Współrzędne dla lokalizacji
BASE_LATITUDE = 53.572449890836545
BASE_LONGITUDE = 18.32984286725182

# Aktualna data i czas
now = datetime.datetime.now()
date = now.strftime("%Y-%m-%d")
time = now.strftime("%H:%M")

def get_weather_data(lat, lon):
    url = f'https://api.openweathermap.org/data/2.5/weather?lat={lat}&lon={lon}&appid={API_KEY}&units=metric'
    response = requests.get(url)
    if response.status_code == 200:
        return response.json()
    return None

def convert_unix_to_time(unix_timestamp):
    return datetime.datetime.fromtimestamp(unix_timestamp).strftime('%H:%M')

def generate_random_coordinates(lat, lon, radius):
    # Funkcja generuje losowe współrzędne w promieniu `radius` od punktu (lat, lon)
    radius_km = radius / 1000  # Convert meters to kilometers
    random_angle = random.uniform(0, 360)  # Random direction
    random_radius = random.uniform(0, radius_km)  # Random distance in km
    new_location = geodesic(kilometers=random_radius).destination((lat, lon), random_angle)

    return new_location.latitude, new_location.longitude
    #return new_lat, new_lon

@app.route('/')
def index():
    # Pobierz dane pogodowe dla określonych współrzędnych
    weather_data = get_weather_data(BASE_LATITUDE, BASE_LONGITUDE)

    if weather_data:
        temperature = weather_data['main']['temp']
        pressure = weather_data['main']['pressure']
        humidity = weather_data['main']['humidity']
        temp_min = weather_data['main']['temp_min']
        temp_max = weather_data['main']['temp_max']
        sea_level = weather_data['main'].get('sea_level', 'N/A')
        grnd_level = weather_data['main'].get('grnd_level', 'N/A')
        wind_speed = weather_data['wind']['speed']
        wind_direction = weather_data['wind']['deg']
        clouds = weather_data['clouds']['all']
        description = weather_data['weather'][0]['description']
        icon = weather_data['weather'][0]['icon']
        sunrise = convert_unix_to_time(weather_data['sys']['sunrise'])
        sunset = convert_unix_to_time(weather_data['sys']['sunset'])

        # Generowanie współrzędnych dla lokalizacji
        lat_location, lon_location = generate_random_coordinates(BASE_LATITUDE, BASE_LONGITUDE, 2000)

        # Przekaż dane do szablonu HTML
        return render_template('index.html',
                               date=date,
                               time=time,
                               temperature=temperature,
                               pressure=pressure,
                               humidity=humidity,
                               temp_min=temp_min,
                               temp_max=temp_max,
                               sea_level=sea_level,
                               grnd_level=grnd_level,
                               wind_speed=wind_speed,
                               wind_direction=wind_direction,
                               clouds=clouds,
                               description=description,
                               icon=icon,
                               sunrise=sunrise,
                               sunset=sunset,
                               latitude=lat_location,
                               longitude=lon_location)
    else:
        return "Nie udało się pobrać danych pogodowych.", 500

# Dodaj nową trasę do zwracania danych pogodowych w formacie JSON
@app.route('/get_weather', methods=['GET'])
def get_weather():
    # Pobierz dane pogodowe dla określonych współrzędnych
    weather_data = get_weather_data(BASE_LATITUDE, BASE_LONGITUDE)

    if weather_data:
        temperature = weather_data['main']['temp']
        pressure = weather_data['main']['pressure']
        humidity = weather_data['main']['humidity']
        temp_min = weather_data['main']['temp_min']
        temp_max = weather_data['main']['temp_max']
        sea_level = weather_data['main'].get('sea_level', 'N/A')
        grnd_level = weather_data['main'].get('grnd_level', 'N/A')
        wind_speed = weather_data['wind']['speed']
        wind_direction = weather_data['wind']['deg']
        clouds = weather_data['clouds']['all']
        description = weather_data['weather'][0]['description']
        icon = weather_data['weather'][0]['icon']
        sunrise = convert_unix_to_time(weather_data['sys']['sunrise'])
        sunset = convert_unix_to_time(weather_data['sys']['sunset'])

        # Generowanie współrzędnych dla lokalizacji
        lat_location, lon_location = generate_random_coordinates(BASE_LATITUDE, BASE_LONGITUDE, 2000)

        # Zwróć dane pogodowe w formacie JSON
        return jsonify({
            'temperature': temperature,
            'pressure': pressure,
            'humidity': humidity,
            'temp_min': temp_min,
            'temp_max': temp_max,
            'sea_level': sea_level,
            'grnd_level': grnd_level,
            'wind_speed': wind_speed,
            'wind_direction': wind_direction,
            'clouds': clouds,
            'description': description,
            'icon': icon,
            'sunrise': sunrise,
            'sunset': sunset,
            'latitude': lat_location,
            'longitude': lon_location
        })
    else:
        return jsonify({'error': 'Nie udało się pobrać danych pogodowych.'}), 500

@app.route('/get_coordinates', methods=['GET'])
def get_coordinates():
    # Generowanie współrzędnych dla lokalizacji
    lat_location, lon_location = generate_random_coordinates(BASE_LATITUDE, BASE_LONGITUDE, 2000)
    return jsonify({
        'latitude': lat_location,
        'longitude': lon_location
    })

# Wczytaj misje
@app.route('/load_missions', methods=['GET'])
def load_missions():
    try:
        # Otwórz plik z kodowaniem UTF-8
        with open(MISSION_FILE, 'r', encoding='utf-8') as file:
            content = file.read()

        # Podziel misje na podstawie znaku '**'
        missions = content.split('**')
        missions = [mission.strip() for mission in missions if mission.strip() != '']

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
