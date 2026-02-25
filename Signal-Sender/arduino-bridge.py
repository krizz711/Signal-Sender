#!/usr/bin/env python3
"""
Arduino Uno to Server Bridge
Reads JSON from Arduino Serial and forwards to Signal-Sender server
"""

import serial
import requests
import json
import time
import sys

# Configuration
SERIAL_PORT = 'COM3'  # Change to your Arduino's COM port (check Device Manager)
BAUD_RATE = 115200
SERVER_URL = "http://127.0.0.1:5000/api/door-alert"

def main():
    print("=" * 50)
    print("Arduino Uno → Signal-Sender Bridge")
    print("=" * 50)
    print(f"Serial Port: {SERIAL_PORT}")
    print(f"Baud Rate: {BAUD_RATE}")
    print(f"Server URL: {SERVER_URL}")
    print("=" * 50)
    print("Waiting for Arduino connection...")
    
    try:
        # Open serial connection
        arduino = serial.Serial(SERIAL_PORT, BAUD_RATE, timeout=1)
        print(f"✅ Connected to Arduino on {SERIAL_PORT}")
        print("Listening for data...\n")
        
        while True:
            try:
                if arduino.in_waiting > 0:
                    # Read line from Arduino
                    line = arduino.readline().decode('utf-8').strip()
                    
                    # Skip empty lines
                    if not line:
                        continue
                    
                    # Check if it's JSON
                    if line.startswith('{'):
                        try:
                            # Parse JSON from Arduino
                            data = json.loads(line)
                            print(f"📥 Received from Arduino: {data}")
                            
                            # Forward to server
                            response = requests.post(SERVER_URL, json=data, timeout=5)
                            
                            if response.status_code == 200:
                                print(f"✅ Sent to server: {response.json()}")
                            else:
                                print(f"❌ Server error: {response.status_code}")
                                print(f"   Response: {response.text}")
                            
                            print("-" * 50)
                            
                        except json.JSONDecodeError as e:
                            print(f"⚠️  Invalid JSON: {line}")
                            print(f"   Error: {e}")
                        except requests.exceptions.RequestException as e:
                            print(f"❌ Failed to send to server: {e}")
                    else:
                        # Non-JSON data (debug messages)
                        print(f"📝 Arduino: {line}")
                
                time.sleep(0.1)  # Small delay to prevent CPU spinning
                
            except KeyboardInterrupt:
                print("\n\n🛑 Bridge stopped by user")
                break
            except Exception as e:
                print(f"❌ Error: {e}")
                time.sleep(1)
    
    except serial.SerialException as e:
        print(f"❌ Failed to open serial port: {e}")
        print(f"\n💡 Troubleshooting:")
        print(f"   1. Check if Arduino is connected")
        print(f"   2. Verify COM port in Device Manager")
        print(f"   3. Change SERIAL_PORT in this script")
        print(f"   4. Close other programs using the port")
        sys.exit(1)
    finally:
        if 'arduino' in locals():
            arduino.close()
            print("🔌 Serial port closed")

if __name__ == "__main__":
    main()
