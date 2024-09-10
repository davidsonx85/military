import serial

try:
    with serial.Serial('/dev/ttyUSB0', baudrate=9600, timeout=1) as ser:
        while True:
            line = ser.readline().decode('ascii', errors='replace').strip()
            print(line)
except Exception as e:
    print(f"Błąd: {e}")