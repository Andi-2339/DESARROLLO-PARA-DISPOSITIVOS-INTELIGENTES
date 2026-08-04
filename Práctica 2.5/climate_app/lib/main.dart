// lib/main.dart
import 'package:flutter/material.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart'; // <-- 1. AGREGA ESTA IMPORTACIÓN
import 'package:provider/provider.dart';
import 'providers/weather_provider.dart';
import 'screens/home_screen.dart';

// 2. MODIFICA EL MAIN PARA QUE SEA ASÍNCRONO
Future<void> main() async {
  // Asegura que los bindings de Flutter estén listos antes de cargar el archivo .env
  WidgetsFlutterBinding.ensureInitialized();

  // Carga las variables de entorno antes de arrancar la UI
  await dotenv.load(fileName: '.env');

  runApp(const MyApp());
}

class MyApp extends StatelessWidget {
  const MyApp({
    super.key,
  }); // Actualizado a la sintaxis moderna que tienes en tus otras vistas

  @override
  Widget build(BuildContext context) {
    return MultiProvider(
      providers: [ChangeNotifierProvider(create: (_) => WeatherProvider())],
      child: MaterialApp(
        title: 'Climate App',
        debugShowCheckedModeBanner:
            false, // Opcional, pero quita la molesta etiqueta de debug
        theme: ThemeData(
          colorScheme: ColorScheme.fromSeed(
            seedColor: Colors.blue,
          ), // Sintaxis compatible con Material 3
          useMaterial3: true,
        ),
        home: const HomeScreen(),
      ),
    );
  }
}
