import 'dart:async';
import 'dart:math';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';
import 'package:supabase_flutter/supabase_flutter.dart';
import 'package:flutter_blue_plus/flutter_blue_plus.dart';

// ─── Colores del sistema (misma paleta que la web) ───────────────────────────
const Color kPurple     = Color(0xFF8A2BE2);
const Color kNeonGreen  = Color(0xFF39FF14);
const Color kDarkBg     = Color(0xFF1A1A1A);
const Color kCardBg     = Color(0xFF252525);
const Color kAccent     = Color(0xFF111111);

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  
  await Supabase.initialize(
    url: 'https://mtwhobrdwjlffflxnrud.supabase.co',
    anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im10d2hvYnJkd2psZmZmbHhucnVkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU2NjYzMzIsImV4cCI6MjA5MTI0MjMzMn0.IZy-nH12l9pbiDcu94jdPhwhTNks8-9ts01wd2-A5g4',
  );

  runApp(
    MultiProvider(
      providers: [
        ChangeNotifierProvider(create: (_) => AppState()),
      ],
      child: const PhoneApp(),
    ),
  );
}

// ─── Estado Global ────────────────────────────────────────────────────────────
class AppState extends ChangeNotifier {
  String connectionStatus = "Buscando Reloj...";
  int heartRate = 0;
  int hypeLevel = 0;
  int episodes = 0;
  bool criticalAlert = false;
  List<dynamic> animeNews = [];

  Timer? _wearableTimer;
  final _random = Random();
  
  // Supabase client
  final _supabase = Supabase.instance.client;

  AppState() {
    _initBle();
  }
  
  Future<void> _initBle() async {
    // Intentar conectar con flutter_blue_plus
    bool isBleAvailable = false;
    try {
      if (await FlutterBluePlus.isSupported == true) {
         final state = await FlutterBluePlus.adapterState.first;
         if (state == BluetoothAdapterState.on) {
            isBleAvailable = true;
         }
      }
    } catch(e) {
      debugPrint("BLE check error: \$e");
    }

    if (isBleAvailable) {
      _startRealBle();
    } else {
      _simulateBleConnection();
    }
  }
  
  void _startRealBle() async {
    connectionStatus = "Buscando BLE...";
    notifyListeners();
    
    // Escanear buscando el UUID (o en su defecto intentar encontrar el nombre)
    try {
      await FlutterBluePlus.startScan(timeout: const Duration(seconds: 4));
      var subscription = FlutterBluePlus.scanResults.listen((results) async {
        for (ScanResult r in results) {
          // Simplificación: si encontramos un dispositivo con "Anime" o el UUID en manufacturer data
          if (r.device.platformName.contains('Anime') || r.advertisementData.manufacturerData.isNotEmpty) {
             await FlutterBluePlus.stopScan();
             _connectToDevice(r.device, r.advertisementData);
             break;
          }
        }
      });
      
      // Si no encuentra nada, fallback
      Future.delayed(const Duration(seconds: 5), () async {
         if (connectionStatus == "Buscando BLE...") {
           await FlutterBluePlus.stopScan();
           _simulateBleConnection();
         }
      });
    } catch (e) {
      _simulateBleConnection();
    }
  }
  
  void _connectToDevice(BluetoothDevice device, AdvertisementData adv) async {
     try {
       // Para efectos del emulador/simulación en la entrega, a veces el BLE real 
       // no conecta bien. Si es así, simulamos basado en los manufacturerData (si es Advertising continuo)
       connectionStatus = "Conectado 🟢 (BLE)";
       notifyListeners();
       
       // Si estamos recibiendo datos por ManufacturerData (como se implementó en el wearable)
       if (adv.manufacturerData.containsKey(1)) {
          var data = adv.manufacturerData[1]!;
          if (data.length >= 3) {
             heartRate = data[0];
             hypeLevel = data[1];
             episodes = data[2];
             criticalAlert = hypeLevel > 90 || heartRate > 120;
             _publishToSupabase();
             notifyListeners();
          }
       }
       
       // Suscripción al stream de scanResults para actualizaciones continuas sin conectar
       FlutterBluePlus.scanResults.listen((results) {
         for (ScanResult r in results) {
           if (r.device.remoteId == device.remoteId) {
             if (r.advertisementData.manufacturerData.containsKey(1)) {
                var data = r.advertisementData.manufacturerData[1]!;
                if (data.length >= 3) {
                   heartRate = data[0];
                   hypeLevel = data[1];
                   episodes = data[2];
                   criticalAlert = hypeLevel > 90 || heartRate > 120;
                   _publishToSupabase();
                   notifyListeners();
                }
             }
           }
         }
       });
       
       // Asegurar scan continuo
       FlutterBluePlus.startScan(continuousUpdates: true);
       
     } catch (e) {
       connectionStatus = "Error BLE";
       notifyListeners();
       _simulateBleConnection();
     }
  }

  void _simulateBleConnection() {
    connectionStatus = "Conectado 🟢 (Vía Supabase)";
    notifyListeners();

    _wearableTimer?.cancel();
    
    // En lugar de timer aleatorio, escuchamos los datos reales del wearable vía Supabase.
    _supabase.from('device_sync').stream(primaryKey: ['id']).eq('id', 2).listen((data) {
      if (data.isNotEmpty) {
        final res = data.first;
        heartRate = res['heart_rate'] ?? heartRate;
        hypeLevel = res['hype_level'] ?? hypeLevel;
        episodes = res['episodes'] ?? episodes;
        criticalAlert = hypeLevel > 90 || heartRate > 120;
        
        _publishToSupabase();
        notifyListeners();
      }
    });
    
    // Intento inicial para agarrar último dato si lo hay
    _fetchInitialSync();
  }

  void _fetchInitialSync() async {
    try {
      final res = await _supabase.from('device_sync').select('*').eq('id', 2).maybeSingle();
      if (res != null) {
        heartRate = res['heart_rate'] ?? heartRate;
        hypeLevel = res['hype_level'] ?? hypeLevel;
        episodes = res['episodes'] ?? episodes;
        criticalAlert = hypeLevel > 90 || heartRate > 120;
        _publishToSupabase();
        notifyListeners();
      }
    } catch (e) {
      debugPrint("Initial fetch error: \$e");
    }
  }
  
  void _publishToSupabase() async {
     try {
        await _supabase.from('device_sync').upsert({
           'id': 1, // ID único para el dispositivo
           'heart_rate': heartRate,
           'hype_level': hypeLevel,
           'episodes': episodes,
           'critical_alert': criticalAlert,
           'updated_at': DateTime.now().toUtc().toIso8601String()
        });
     } catch (e) {
        debugPrint("Error publishing to Supabase: \$e");
     }
  }

  Future<void> fetchAnimeNews() async {
    try {
      final response = await http.get(
        Uri.parse('https://api.jikan.moe/v4/top/anime?limit=5'),
      );
      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        animeNews = data['data'];
        notifyListeners();
      }
    } catch (e) {
      debugPrint("Error fetching anime news: \$e");
      animeNews = [
        {"title": "One Piece – Episodio 1000+", "score": 9.0},
        {"title": "Jujutsu Kaisen – Temporada 3", "score": 8.8},
        {"title": "Solo Leveling – Final de Temporada", "score": 8.5},
        {"title": "Demon Slayer – Nueva Temporada", "score": 8.7},
        {"title": "Bleach – Thousand Year Blood War", "score": 9.1},
      ];
      notifyListeners();
    }
  }

  @override
  void dispose() {
    _wearableTimer?.cancel();
    FlutterBluePlus.stopScan();
    super.dispose();
  }
}

// ─── App Root ─────────────────────────────────────────────────────────────────
class PhoneApp extends StatelessWidget {
  const PhoneApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Anime News Hub',
      debugShowCheckedModeBanner: false,
      theme: ThemeData.dark().copyWith(
        primaryColor: kPurple,
        scaffoldBackgroundColor: kDarkBg,
        colorScheme: const ColorScheme.dark(
          primary: kPurple,
          secondary: kNeonGreen,
        ),
        appBarTheme: const AppBarTheme(
          backgroundColor: kAccent,
          elevation: 0,
        ),
      ),
      home: const DashboardScreen(),
    );
  }
}

// ─── Pantalla Principal ───────────────────────────────────────────────────────
class DashboardScreen extends StatefulWidget {
  const DashboardScreen({super.key});

  @override
  State<DashboardScreen> createState() => _DashboardScreenState();
}

class _DashboardScreenState extends State<DashboardScreen> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      context.read<AppState>().fetchAnimeNews();
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Row(
          children: [
            Container(
              width: 32,
              height: 32,
              decoration: BoxDecoration(
                gradient: const LinearGradient(colors: [kPurple, kNeonGreen]),
                borderRadius: BorderRadius.circular(8),
              ),
              child: const Icon(Icons.sports_martial_arts, size: 20, color: Colors.white),
            ),
            const SizedBox(width: 10),
            const Text(
              "Anime News Hub",
              style: TextStyle(
                fontWeight: FontWeight.bold,
                color: kNeonGreen,
                letterSpacing: 1.2,
              ),
            ),
          ],
        ),
      ),
      body: Consumer<AppState>(
        builder: (context, state, child) {
          return SingleChildScrollView(
            padding: const EdgeInsets.all(16.0),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                // ── Estado BLE ──────────────────────────────────────────────
                _BleStatusCard(status: state.connectionStatus),
                const SizedBox(height: 16),

                // ── Alerta Crítica ───────────────────────────────────────────
                if (state.criticalAlert) _CriticalAlert(),
                if (state.criticalAlert) const SizedBox(height: 16),

                // ── Stats del Reloj ─────────────────────────────────────────
                _SectionTitle(title: "⌚ Estadísticas del Reloj"),
                const SizedBox(height: 12),
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                  children: [
                    _StatCard(title: "Pulso", value: "${state.heartRate}", icon: Icons.favorite, color: Colors.redAccent),
                    _StatCard(title: "Hype", value: "${state.hypeLevel}%", icon: Icons.flash_on, color: Colors.yellowAccent),
                    _StatCard(title: "Eps", value: "${state.episodes}", icon: Icons.tv, color: kPurple),
                  ],
                ),

                const SizedBox(height: 28),

                // ── Noticias Anime ──────────────────────────────────────────
                _SectionTitle(title: "📰 Noticias Anime (API)"),
                const SizedBox(height: 12),

                if (state.animeNews.isEmpty)
                  const Center(child: CircularProgressIndicator(color: kNeonGreen))
                else
                  ...state.animeNews.map((anime) => _AnimeNewsCard(anime: anime)),
              ],
            ),
          );
        },
      ),
    );
  }
}

// ─── Widgets de UI ────────────────────────────────────────────────────────────

class _SectionTitle extends StatelessWidget {
  final String title;
  const _SectionTitle({required this.title});

  @override
  Widget build(BuildContext context) {
    return Text(
      title,
      style: const TextStyle(
        fontSize: 18,
        fontWeight: FontWeight.bold,
        color: kNeonGreen,
        letterSpacing: 1.0,
      ),
    );
  }
}

class _BleStatusCard extends StatelessWidget {
  final String status;
  const _BleStatusCard({required this.status});

  @override
  Widget build(BuildContext context) {
    final bool connected = status.contains("Conectado");
    return Container(
      padding: const EdgeInsets.symmetric(vertical: 14, horizontal: 16),
      decoration: BoxDecoration(
        color: kCardBg,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(
          color: connected ? kNeonGreen : Colors.blueAccent,
          width: 1.5,
        ),
        boxShadow: [
          BoxShadow(
            color: (connected ? kNeonGreen : Colors.blueAccent).withValues(alpha: 0.2),
            blurRadius: 8,
          ),
        ],
      ),
      child: Row(
        children: [
          Icon(
            connected ? Icons.bluetooth_connected : Icons.bluetooth_searching,
            color: connected ? kNeonGreen : Colors.blueAccent,
            size: 28,
          ),
          const SizedBox(width: 14),
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Text("Reloj Anime News", style: TextStyle(fontSize: 12, color: Colors.grey)),
              Text(
                status,
                style: TextStyle(
                  fontSize: 16,
                  fontWeight: FontWeight.bold,
                  color: connected ? kNeonGreen : Colors.white,
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}

class _CriticalAlert extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.red[900],
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: Colors.redAccent, width: 2),
        boxShadow: [
          BoxShadow(
            color: Colors.red.withValues(alpha: 0.4),
            blurRadius: 12,
            spreadRadius: 2,
          ),
        ],
      ),
      child: const Row(
        children: [
          Icon(Icons.warning_amber_rounded, color: Colors.white, size: 36),
          SizedBox(width: 12),
          Expanded(
            child: Text(
              "¡ALERTA CRÍTICA! Nivel de Hype extremo.\n¡Respira hondo, otaku!",
              style: TextStyle(color: Colors.white, fontSize: 15, fontWeight: FontWeight.bold),
            ),
          ),
        ],
      ),
    );
  }
}

class _StatCard extends StatelessWidget {
  final String title;
  final String value;
  final IconData icon;
  final Color color;

  const _StatCard({required this.title, required this.value, required this.icon, required this.color});

  @override
  Widget build(BuildContext context) {
    return Container(
      width: 100,
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: kCardBg,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: color.withValues(alpha: 0.5)),
        boxShadow: [
          BoxShadow(color: color.withValues(alpha: 0.15), blurRadius: 8),
        ],
      ),
      child: Column(
        children: [
          Icon(icon, color: color, size: 32),
          const SizedBox(height: 8),
          Text(value, style: const TextStyle(fontSize: 22, fontWeight: FontWeight.bold)),
          const SizedBox(height: 4),
          Text(title, style: const TextStyle(fontSize: 11, color: Colors.grey)),
        ],
      ),
    );
  }
}

class _AnimeNewsCard extends StatelessWidget {
  final dynamic anime;
  const _AnimeNewsCard({required this.anime});

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.only(bottom: 10),
      decoration: BoxDecoration(
        color: kCardBg,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: kPurple.withValues(alpha: 0.4)),
      ),
      child: ListTile(
        contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 6),
        leading: Container(
          width: 42,
          height: 42,
          decoration: BoxDecoration(
            gradient: const LinearGradient(
              colors: [kPurple, kNeonGreen],
              begin: Alignment.topLeft,
              end: Alignment.bottomRight,
            ),
            borderRadius: BorderRadius.circular(10),
          ),
          child: const Icon(Icons.play_circle_fill, color: Colors.white, size: 26),
        ),
        title: Text(
          anime['title'] ?? anime['title_english'] ?? 'Sin título',
          style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14),
        ),
        subtitle: Text(
          "Score: ${anime['score'] ?? '-'}",
          style: const TextStyle(color: kNeonGreen, fontSize: 12),
        ),
        trailing: const Icon(Icons.arrow_forward_ios, size: 14, color: Colors.grey),
      ),
    );
  }
}
