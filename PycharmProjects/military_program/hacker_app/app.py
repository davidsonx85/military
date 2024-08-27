from flask import Flask, jsonify, render_template
import datetime
import requests
from geopy.geocoders import Nominatim
import base64

app = Flask(__name__)

# Pobieranie aktualnego czasu i daty
def get_current_datetime():
    return datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")

# Pobieranie prognozy pogody z API
def get_weather_data(api_key, location="osie"):
    try:
        url = f"http://api.openweathermap.org/data/2.5/weather?q={location}&appid={api_key}&units=metric"
        response = requests.get(url, timeout=10)
        response.raise_for_status()
        data = response.json()

        if data['cod'] == 200:
            return data['main']['temp'], data['main']['humidity']
        else:
            return None, None
    except requests.exceptions.Timeout:
        print("Request timed out. Please try again later.")
        return None, None
    except requests.exceptions.RequestException as e:
        print(f"Request error: {e}")
        return None, None

# Pobieranie położenia GPS i wysokości nad poziomem morza
def get_gps_and_altitude(location="osie, polska"):
    try:
        geolocator = Nominatim(user_agent="geoapiExercises")
        location = geolocator.geocode(location)
            #return location.latitude, location.longitude
        if location:
            return location.latitude, location.longitude
        else:
            return None, None
    except Exception as e:
        print(f"Geocoding service error: {e}")
        return None, None

# Kodowanie tekstu misji w base64
def encode_mission_text(mission_text):
    encoded_text = base64.b64encode(mission_text.encode())
    return encoded_text.decode()

@app.route('/')
def home():
    api_key = "deb991d27f8d305ba2999cfc0df1e6fb"  # Podaj swój klucz API dla OpenWeatherMap
    mission_text = "Przechwycić dane z serwera. Nie pozostawiaj śladów."
    current_datetime = get_current_datetime()
    temperature, humidity = get_weather_data(api_key)
    latitude, longitude = get_gps_and_altitude()
    encoded_mission = encode_mission_text(mission_text)

    data = {
        'timestamp': current_datetime,
        'temperature': temperature,
        'humidity': humidity,
        'latitude': latitude,
        'longitude': longitude,
        'mission': encoded_mission
    }

    return render_template('index.html', data=data)

if __name__ == "__main__":
    app.run(debug=True)
