// lib/providers/weather_provider.dart
import 'package:flutter/material.dart';
import 'package:flutter_blue_plus/flutter_blue_plus.dart';
import '../models/weather_model.dart';
import '../services/ble_service.dart';
import '../services/weather_service.dart';

class WeatherProvider extends ChangeNotifier {
  // Instancia del servicio HTTP de la P2.5
  final WeatherService _weatherService = WeatherService();

  Weather? _weather;
  bool _isLoading = false;
  String? _errorMessage;
  int _tempUnit = 0; // 0 = Celsius, 1 = Fahrenheit

  // Variables de integración de hardware (P2.4)
  final BLEService _bleService = BLEService();
  String _bleConnectionStatus = "Sin conexión BLE";

  // Getters organizados
  Weather? get weather => _weather;
  bool get isLoading => _isLoading;
  String? get errorMessage => _errorMessage;
  String get temperatureUnit => _tempUnit == 0 ? '°C' : '°F';
  String get bleConnectionStatus => _bleConnectionStatus;

  // --- 2. ACTUALIZADO: Petición HTTP REAL a OpenWeatherMap (P2.5) ---
  Future<void> fetchWeather(String city) async {
    _isLoading = true;
    _errorMessage = null;
    notifyListeners();

    try {
      // Llamada real al servicio HTTP
      _weather = await _weatherService.getWeather(city);
    } catch (e) {
      // Limpiamos el texto para mostrarlo amigablemente en la interfaz
      _errorMessage = e.toString().replaceFirst('Exception: ', '');
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  // Alias para mantener compatibilidad con pantallas previas
  Future<void> loadWeather(String city) async {
    await fetchWeather(city);
  }

  // Cambiar unidad de temperatura (P2.3)
  void toggleTemperatureUnit() {
    _tempUnit = _tempUnit == 0 ? 1 : 0;
    notifyListeners();
  }

  // Actualizar temperatura manualmente (P2.3)
  void updateTemperature(int newTemp) {
    if (_weather != null) {
      _weather = Weather(
        city: _weather!.city,
        temperature: newTemp,
        condition: _weather!.condition,
        description: _weather!.description,
        humidity: _weather!.humidity,
        windSpeed: _weather!.windSpeed,
      );
      notifyListeners();
    }
  }

  // --- 3. Métodos del Wearable (P2.4 intactos) ---
  Future<void> connectAndFetchWearableData(BluetoothDevice device) async {
    _bleConnectionStatus = "Conectando...";
    notifyListeners();

    try {
      await _bleService.connect(device);
      _bleConnectionStatus = "Conectado a ${device.advName}";
      notifyListeners();

      device.connectionState.listen((BluetoothConnectionState state) {
        if (state == BluetoothConnectionState.disconnected) {
          _bleConnectionStatus = "Sin conexión BLE";
          notifyListeners();
        }
      });

      String serviceUuid = "181A";
      String charUuid = "2A6E";

      String? data = await _bleService.readCharacteristic(
        device,
        serviceUuid,
        charUuid,
      );

      if (data != null) {
        int sensorTemp = double.parse(data).round();

        String currentCity = _weather?.city ?? "Sensor Local";
        String currentCondition = _weather?.condition ?? "clear";
        String currentDescription = _weather?.description ?? "Cielo despejado";
        int currentHumidity = _weather?.humidity ?? 50;
        double currentWindSpeed = _weather?.windSpeed ?? 0.0;

        _weather = Weather(
          city: currentCity,
          temperature: sensorTemp,
          condition: currentCondition,
          description: currentDescription,
          humidity: currentHumidity,
          windSpeed: currentWindSpeed,
        );

        print("Telemetría actualizada desde placa/sensor: $sensorTemp°C");
        notifyListeners();
      }
    } catch (e) {
      _bleConnectionStatus = "Error de conexión BLE";
      notifyListeners();
    }
  }
}
