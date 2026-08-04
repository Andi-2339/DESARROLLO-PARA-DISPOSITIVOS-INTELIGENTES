import 'package:flutter/material.dart';

class DetailScreen extends StatelessWidget {
  final String city;

  const DetailScreen({Key? key, required this.city}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    // Lista de datos para iterar y generar las tarjetas
    final forecast = [
      {'day': 'Lun', 'temp': '24°C', 'icon': Icons.wb_sunny},
      {'day': 'Mar', 'temp': '26°C', 'icon': Icons.wb_sunny},
      {'day': 'Mié', 'temp': '20°C', 'icon': Icons.cloud},
      {'day': 'Jue', 'temp': '25°C', 'icon': Icons.cloud_queue},
      {'day': 'Vie', 'temp': '28°C', 'icon': Icons.wb_sunny},
    ];

    return Scaffold(
      appBar: AppBar(title: Text('$city - Pronóstico'), centerTitle: true),
      body: Center(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(16.0),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              // Wrap acomoda automáticamente los elementos en horizontal o vertical
              Wrap(
                spacing: 12,
                runSpacing: 12,
                alignment: WrapAlignment.center,
                children: forecast.map((dayData) {
                  return _buildForecastCard(
                    dayData['day'] as String,
                    dayData['temp'] as String,
                    dayData['icon'] as IconData,
                  );
                }).toList(),
              ),
              const SizedBox(height: 50),
              OutlinedButton.icon(
                icon: const Icon(Icons.arrow_back),
                label: const Text('Volver'),
                style: OutlinedButton.styleFrom(
                  padding: const EdgeInsets.symmetric(
                    horizontal: 32,
                    vertical: 16,
                  ),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(30),
                  ),
                ),
                onPressed: () => Navigator.pop(context),
              ),
            ],
          ),
        ),
      ),
    );
  }

  // Componente reutilizable local para las tarjetas de cada día
  Widget _buildForecastCard(String day, String temp, IconData icon) {
    return Card(
      elevation: 3,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
      child: Container(
        width: 80,
        padding: const EdgeInsets.symmetric(vertical: 16),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Text(
              day,
              style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
            ),
            const SizedBox(height: 8),
            Icon(icon, color: Colors.blue, size: 32),
            const SizedBox(height: 8),
            Text(temp, style: const TextStyle(fontSize: 18)),
          ],
        ),
      ),
    );
  }
}
