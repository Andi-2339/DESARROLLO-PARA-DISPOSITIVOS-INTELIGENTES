import 'dart:async';
import 'dart:math';

class SensorSimulator {
  final _random = Random();

  // Estado interno de los sensores
  int _steps = 0;
  int _heartRate = 72; // bpm en reposo
  double _calories = 0.0;
  String _status = 'reposo';

  // Streams que emiten nuevos valores
  final _stepsCtrl = StreamController<int>.broadcast();
  final _heartRateCtrl = StreamController<int>.broadcast();
  final _caloriesCtrl = StreamController<int>.broadcast();
  final _statusCtrl = StreamController<String>.broadcast();

  Stream<int> get stepsStream => _stepsCtrl.stream;
  Stream<int> get heartRateStream => _heartRateCtrl.stream;
  Stream<int> get caloriesStream => _caloriesCtrl.stream;
  Stream<String> get statusStream => _statusCtrl.stream;

  // Valores actuales para lecturas directas
  int get steps => _steps;
  int get heartRate => _heartRate;
  int get calories => _calories.toInt();
  String get status => _status;

  Timer? _timer;

  void start() {
    // Actualizar sensores cada segundo
    _timer = Timer.periodic(const Duration(seconds: 1), (_) => update());
  }

  void update() {
    // Simular cambio de actividad aleatorio aproximadamente cada 30 segundos
    if (_random.nextInt(30) == 0) {
      _changeActivity();
    }

    // Actualizar pasos según el tipo de actividad
    switch (_status) {
      case 'caminando':
        _steps += _random.nextInt(2) + 1;
        break;
      case 'corriendo':
        _steps += _random.nextInt(4) + 3;
        break;
      default:
        break; // reposo: no agrega pasos
    }

    // El ritmo cardíaco fluctúa alrededor de un objetivo según la actividad
    final target = _status == 'corriendo' ? 145 : _status == 'caminando' ? 95 : 72;
    _heartRate += (_random.nextInt(7) - 3); // Fluctúa entre -3 y +3
    _heartRate = _heartRate.clamp(target - 10, target + 10);

    // Estimación simple de calorías quemadas
    _calories += _steps * 0.0004;

    // Emitir los cambios en los canales correspondientes
    _stepsCtrl.add(_steps);
    _heartRateCtrl.add(_heartRate);
    _caloriesCtrl.add(_calories.toInt());
    _statusCtrl.add(_status);
  }

  void _changeActivity() {
    const activities = ['reposo', 'caminando', 'corriendo'];
    _status = activities[_random.nextInt(activities.length)];
  }

  void stop() {
    _timer?.cancel();
    _stepsCtrl.close();
    _heartRateCtrl.close();
    _caloriesCtrl.close();
    _statusCtrl.close();
  }
}