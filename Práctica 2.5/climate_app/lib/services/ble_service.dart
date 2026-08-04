// lib/services/ble_service.dart
import 'package:flutter_blue_plus/flutter_blue_plus.dart';

class BLEService {
  // Escanear dispositivos cercanos
  Stream<List<ScanResult>> scanForDevices() {
    FlutterBluePlus.startScan(timeout: const Duration(seconds: 15));
    return FlutterBluePlus.scanResults;
  }

  // Detener el escaneo
  void stopScanning() {
    FlutterBluePlus.stopScan();
  }

  // Conectar al dispositivo físico (Solución al error de 'license')
  Future<void> connect(BluetoothDevice device) async {
    await device.connect(
      autoConnect: false,
      license: '', // Cadena vacía obligatoria en nuevas versiones del plugin
    );
  }

  // Desconectar dispositivo
  Future<void> disconnect(BluetoothDevice device) async {
    await device.disconnect();
  }

  // Leer características del sensor (Environmental Sensing)
  Future<String?> readCharacteristic(
    BluetoothDevice device,
    String serviceUuid,
    String characteristicUuid,
  ) async {
    List<BluetoothService> services = await device.discoverServices();

    for (BluetoothService service in services) {
      if (service.uuid.toString().toUpperCase().contains(serviceUuid)) {
        for (BluetoothCharacteristic characteristic
            in service.characteristics) {
          if (characteristic.uuid.toString().toUpperCase().contains(
            characteristicUuid,
          )) {
            List<int> value = await characteristic.read();
            return String.fromCharCodes(value);
          }
        }
      }
    }
    return null;
  }
}
