import 'dart:async';
import 'package:flutter/material.dart';
import '../models/activity_data.dart';
import '../services/ble_client.dart';

enum ConnectionStatus { disconnected, scanning, connected, error }

class ActivityProvider extends ChangeNotifier {
  final BleClient _client = BleClient();
  Timer? _demoTimer;

  ActivityData _data = ActivityData(
    steps: 0,
    heartRate: 0,
    calories: 0,
    status: 'sin datos',
    timestamp: DateTime.now(),
  );

  ConnectionStatus _status = ConnectionStatus.disconnected;
  String? _errorMessage;

  ActivityData get data => _data;
  ConnectionStatus get status => _status;
  String? get errorMessage => _errorMessage;
  bool get isConnected => _status == ConnectionStatus.connected;

  Future<void> connect() async {
    _status = ConnectionStatus.scanning;
    notifyListeners();

    // Simulamos 2 segundos de búsqueda para que se vea el círculo de carga
    await Future.delayed(const Duration(seconds: 2));

    // Conexión forzada exitosa
    _status = ConnectionStatus.connected;
    notifyListeners();

    // Iniciamos el motor de datos para que las tarjetas se animen
    int mockSteps = 0;
    int mockBpm = 72;
    double mockCal = 0.0;
    String mockStatus = 'reposo';

    _demoTimer?.cancel();
    _demoTimer = Timer.periodic(const Duration(seconds: 1), (timer) {
      // Cambia de actividad automáticamente cada 15 segundos para probar alertas
      if (timer.tick % 15 == 0) {
        mockStatus = mockStatus == 'reposo' ? 'caminando' : (mockStatus == 'caminando' ? 'corriendo' : 'reposo');
      }

      if (mockStatus == 'caminando') mockSteps += 2;
      if (mockStatus == 'corriendo') mockSteps += 5;

      final target = mockStatus == 'corriendo' ? 145 : (mockStatus == 'caminando' ? 95 : 72);
      mockBpm += (DateTime.now().millisecond % 5) - 2;
      mockBpm = mockBpm.clamp(target - 10, target + 10);
      mockCal += mockSteps * 0.0004;

      _data = _data.copyWith(
        steps: mockSteps,
        heartRate: mockBpm,
        calories: mockCal.toInt(),
        status: mockStatus,
      );
      notifyListeners();
    });
  }

  Future<void> disconnect() async {
    _demoTimer?.cancel();
    _status = ConnectionStatus.disconnected;
    notifyListeners();
  }

  @override
  void dispose() {
    _demoTimer?.cancel();
    _client.dispose();
    super.dispose();
  }
}