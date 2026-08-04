import 'dart:async';
import 'dart:math';
import 'dart:typed_data';
import 'package:flutter/material.dart';
import 'package:permission_handler/permission_handler.dart';
import 'package:flutter_ble_peripheral/flutter_ble_peripheral.dart';
import 'package:supabase_flutter/supabase_flutter.dart';

// Constantes compartidas con la app del teléfono
const String SERVICE_UUID = "0000180D-0000-1000-8000-00805f9b34fb"; // Heart Rate Service como ejemplo
const String CHAR_HEART_RATE_UUID = "00002a37-0000-1000-8000-00805f9b34fb";
const String CHAR_HYPE_LEVEL_UUID = "00002a3e-0000-1000-8000-00805f9b34fb";
const String CHAR_EPISODES_UUID   = "00002a3f-0000-1000-8000-00805f9b34fb";

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  
  await Supabase.initialize(
    url: 'https://mtwhobrdwjlffflxnrud.supabase.co',
    anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im10d2hvYnJkd2psZmZmbHhucnVkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU2NjYzMzIsImV4cCI6MjA5MTI0MjMzMn0.IZy-nH12l9pbiDcu94jdPhwhTNks8-9ts01wd2-A5g4',
  );

  runApp(const WearableApp());
}

class WearableApp extends StatelessWidget {
  const WearableApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Anime News Wear',
      theme: ThemeData(
        brightness: Brightness.dark,
        scaffoldBackgroundColor: Colors.black,
        primarySwatch: Colors.red,
      ),
      home: const WatchFace(),
    );
  }
}

class WatchFace extends StatefulWidget {
  const WatchFace({super.key});

  @override
  State<WatchFace> createState() => _WatchFaceState();
}

class _WatchFaceState extends State<WatchFace> {
  bool _isRunning = false;
  Timer? _timer;
  
  int _heartRate = 75;
  int _hypeLevel = 50;
  int _episodes = 0;
  
  final FlutterBlePeripheral blePeripheral = FlutterBlePeripheral();
  final _supabase = Supabase.instance.client;

  @override
  void initState() {
    super.initState();
    _initBle();
  }
  
  Future<void> _initBle() async {
    await [
      Permission.bluetooth,
      Permission.bluetoothAdvertise,
      Permission.bluetoothConnect,
      Permission.bluetoothScan,
      Permission.location,
    ].request();
    
    // Auto-start tracking to simulate data without needing to press the hidden button
    if (!_isRunning) {
      _toggleTracking();
    }
  }

  void _updateAdvertising() async {
    final AdvertiseData advertiseData = AdvertiseData(
      serviceUuid: SERVICE_UUID,
      includeDeviceName: true,
      manufacturerId: 1, // ID genérico para enviar los bytes
      manufacturerData: Uint8List.fromList([
        _heartRate > 255 ? 255 : _heartRate, 
        _hypeLevel > 255 ? 255 : _hypeLevel, 
        _episodes > 255 ? 255 : _episodes
      ]),
    );
    
    final AdvertiseSettings advertiseSettings = AdvertiseSettings(
      advertiseMode: AdvertiseMode.advertiseModeBalanced,
      txPowerLevel: AdvertiseTxPower.advertiseTxPowerMedium,
      connectable: true,
    );
    
    try {
      if (await blePeripheral.isAdvertising) {
        await blePeripheral.stop();
      }
      await blePeripheral.start(advertiseData: advertiseData, advertiseSettings: advertiseSettings);
    } catch (e) {
      debugPrint("Error starting BLE: $e");
    }
  }

  void _toggleTracking() async {
    if (_isRunning) {
      _timer?.cancel();
      await blePeripheral.stop();
      setState(() {
        _isRunning = false;
      });
    } else {
      // Iniciar BLE Advertising la primera vez
      _updateAdvertising();

      _timer = Timer.periodic(const Duration(seconds: 1), (timer) {
        setState(() {
          _heartRate = 70 + Random().nextInt(40); // 70 a 110
          
          // Posibilidad de picos de hype (Alerta Crítica)
          if (Random().nextInt(100) > 90) {
            _heartRate = 125 + Random().nextInt(15); // > 120 trigger
            _hypeLevel = 90 + Random().nextInt(10);
          } else {
            _hypeLevel = max(10, min(100, _hypeLevel + (Random().nextInt(11) - 5)));
          }
          
          if (timer.tick % 10 == 0) { // Simula un episodio cada 10 seg
            _episodes++;
          }
        });
        
        // Re-transmitir datos BLE cada segundo para simular NOTIFY en Advertising
        _updateAdvertising();
        _publishToSupabase();
      });
      
      setState(() {
        _isRunning = true;
      });
    }
  }

  void _publishToSupabase() async {
    try {
      await _supabase.from('device_sync').upsert({
        'id': 2, // ID 2 para simular conexión desde el wearable al teléfono
        'heart_rate': _heartRate,
        'hype_level': _hypeLevel,
        'episodes': _episodes,
        'critical_alert': _hypeLevel > 90 || _heartRate > 120,
        'updated_at': DateTime.now().toUtc().toIso8601String()
      });
    } catch (e) {
      debugPrint("Error publishing to Supabase: \$e");
    }
  }

  @override
  void dispose() {
    _timer?.cancel();
    blePeripheral.stop();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Center(
        child: SingleChildScrollView(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              const Icon(Icons.favorite, color: Color(0xFF39FF14), size: 40),
              Text("$_heartRate BPM", style: const TextStyle(fontSize: 24, color: Color(0xFF39FF14))),
              const SizedBox(height: 20),
              
              const Icon(Icons.flash_on, color: Colors.yellowAccent, size: 40),
              Text("Hype: $_hypeLevel%", style: const TextStyle(fontSize: 24, color: Colors.yellowAccent)),
              const SizedBox(height: 20),
              
              const Icon(Icons.tv, color: Color(0xFF8A2BE2), size: 40),
              Text("Eps: $_episodes", style: const TextStyle(fontSize: 20, color: Color(0xFF8A2BE2))),
              
              const SizedBox(height: 20),
              ElevatedButton(
                style: ElevatedButton.styleFrom(
                  backgroundColor: _isRunning ? Colors.redAccent : const Color(0xFF8A2BE2),
                  shape: const CircleBorder(),
                  padding: const EdgeInsets.all(20),
                ),
                onPressed: _toggleTracking,
                child: Icon(_isRunning ? Icons.stop : Icons.play_arrow, size: 30, color: Colors.white),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
