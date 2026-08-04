import 'package:flutter/material.dart';
import 'package:flutter_blue_plus/flutter_blue_plus.dart';
import 'package:provider/provider.dart';
import '../providers/weather_provider.dart';
import '../services/ble_service.dart';

class BLEScannerScreen extends StatefulWidget {
  const BLEScannerScreen({Key? key}) : super(key: key);

  @override
  _BLEScannerScreenState createState() => _BLEScannerScreenState();
}

class _BLEScannerScreenState extends State<BLEScannerScreen> {
  final BLEService _bleService = BLEService();
  bool _isScanning = false;

  void _startScan() {
    setState(() => _isScanning = true);
    _bleService.scanForDevices();

    // Detiene el indicador visual después de 15 segundos
    Future.delayed(const Duration(seconds: 15), () {
      if (mounted) setState(() => _isScanning = false);
    });
  }

  @override
  void dispose() {
    _bleService.stopScan();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    // Escuchamos al provider para obtener el estado de conexión
    final weatherProvider = Provider.of<WeatherProvider>(context);

    return Scaffold(
      appBar: AppBar(title: const Text('Vincular Wearable')),
      body: Column(
        children: [
          // Paso 13: Mostrar estado de la conexión o desconexión
          Container(
            padding: const EdgeInsets.all(16.0),
            width: double.infinity,
            color: Colors.blue.withOpacity(0.1),
            child: Text(
              "Estado: ${weatherProvider.bleConnectionStatus}",
              textAlign: TextAlign.center,
              style: const TextStyle(
                fontSize: 16,
                fontWeight: FontWeight.bold,
                color: Colors.blueAccent,
              ),
            ),
          ),

          const SizedBox(height: 10),

          // Paso 11: Botón "Buscar dispositivos BLE"
          ElevatedButton.icon(
            icon: _isScanning
                ? const SizedBox(
                    width: 20,
                    height: 20,
                    child: CircularProgressIndicator(strokeWidth: 2),
                  )
                : const Icon(Icons.bluetooth_searching),
            label: Text(
              _isScanning ? "Buscando..." : "Buscar dispositivos BLE",
            ),
            onPressed: _isScanning ? null : _startScan,
          ),

          const Divider(),

          // Paso 11: Muestra una lista de dispositivos encontrados
          Expanded(
            child: StreamBuilder<List<ScanResult>>(
              stream: FlutterBluePlus.scanResults,
              builder: (context, snapshot) {
                if (!snapshot.hasData || snapshot.data!.isEmpty) {
                  return const Center(
                    child: Text("No hay dispositivos cercanos."),
                  );
                }

                return ListView.builder(
                  itemCount: snapshot.data!.length,
                  itemBuilder: (context, index) {
                    final result = snapshot.data![index];

                    // Manejo de nombres vacíos
                    String deviceName = result.device.advName.isNotEmpty
                        ? result.device.advName
                        : "Dispositivo Desconocido";

                    return ListTile(
                      leading: const Icon(Icons.bluetooth),
                      title: Text(deviceName),
                      subtitle: Text(result.device.remoteId.toString()),
                      trailing: ElevatedButton(
                        onPressed: () {
                          // Paso 12: Al tocar un dispositivo, conecta y lee los datos
                          weatherProvider.connectAndFetchWearableData(
                            result.device,
                          );
                        },
                        child: const Text("Conectar"),
                      ),
                    );
                  },
                );
              },
            ),
          ),
        ],
      ),
    );
  }
}
