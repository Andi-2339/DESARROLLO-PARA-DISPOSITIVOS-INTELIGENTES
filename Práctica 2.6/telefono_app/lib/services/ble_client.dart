import 'dart:async';
import 'dart:convert';
import 'dart:typed_data';
import 'package:flutter_blue_plus/flutter_blue_plus.dart';
import '../ble_constants.dart';
import '../models/activity_data.dart';

class BleClient {
  BluetoothDevice? device;
  final List<StreamSubscription> _subs = [];
  final _dataCtrl = StreamController<ActivityData>.broadcast();

  Stream<ActivityData> get dataStream => _dataCtrl.stream;
  bool _connected = false;
  bool get isConnected => _connected;

  ActivityData current = ActivityData(
    steps: 0,
    heartRate: 0,
    calories: 0,
    status: 'sin datos',
    timestamp: DateTime.now(),
  );

  Future<void> scanAndConnect() async {
    print('[BleClient] Iniciando escaneo...');
    final completer = Completer<BluetoothDevice>();

    final scanSub = FlutterBluePlus.scanResults.listen((results) {
      for (final r in results) {
        final advertisedUUIDs = r.advertisementData.serviceUuids.map((u) => u.toString().toLowerCase());
        if (advertisedUUIDs.contains(BleConstants.serviceUUID.toLowerCase())) {
          if (!completer.isCompleted) {
            completer.complete(r.device);
          }
        }
      }
    });

    await FlutterBluePlus.startScan(timeout: const Duration(seconds: 15));

    try {
      device = await completer.future.timeout(
        const Duration(seconds: 16),
        onTimeout: () => throw Exception('Wearable no encontrado en 15 segundos'),
      );
    } finally {
      await FlutterBluePlus.stopScan();
      scanSub.cancel();
    }

    await connect();
  }

  Future<void> connect() async {
    if (device == null) return;
    await device!.connect();
    _connected = true;

    device!.connectionState.listen((state) {
      if (state == BluetoothConnectionState.disconnected) {
        _connected = false;
        print('[BleClient] Desconectado');
      }
    });

    await discoverAndSubscribe();
  }

  Future<void> discoverAndSubscribe() async {
    final services = await device!.discoverServices();
    for (final svc in services) {
      if (svc.uuid.toString().toLowerCase() != BleConstants.serviceUUID.toLowerCase()) continue;

      for (final char in svc.characteristics) {
        final uuid = char.uuid.toString().toLowerCase();

        if (char.properties.notify) {
          await char.setNotifyValue(true);
          final sub = char.lastValueStream.listen((bytes) {
            _handleValue(uuid, bytes);
          });
          _subs.add(sub);
        }
      }
    }
  }

  void _handleValue(String uuid, List<int> bytes) {
    if (bytes.isEmpty) return;
    try {
      if (uuid == BleConstants.stepsUUID.toLowerCase()) {
        final bd = ByteData.sublistView(Uint8List.fromList(bytes));
        current = current.copyWith(steps: bd.getInt32(0, Endian.little));
      } else if (uuid == BleConstants.heartRateUUID.toLowerCase()) {
        current = current.copyWith(heartRate: bytes[0]);
      } else if (uuid == BleConstants.caloriesUUID.toLowerCase()) {
        final bd = ByteData.sublistView(Uint8List.fromList(bytes));
        current = current.copyWith(calories: bd.getInt16(0, Endian.little));
      } else if (uuid == BleConstants.statusUUID.toLowerCase()) {
        current = current.copyWith(status: utf8.decode(bytes));
      }
      _dataCtrl.add(current);
    } catch (e) {
      print('[BleClient] Error parseando $uuid: $e');
    }
  }

  Future<void> disconnect() async {
    for (final s in _subs) {
      await s.cancel();
    }
    _subs.clear();
    await device?.disconnect();
    _connected = false;
  }

  void dispose() {
    _dataCtrl.close();
  }
}