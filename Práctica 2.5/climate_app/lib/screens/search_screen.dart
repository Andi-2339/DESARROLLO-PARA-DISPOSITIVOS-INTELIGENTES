// lib/screens/search_screen.dart
import 'package:flutter/material.dart';

class SearchScreen extends StatefulWidget {
  const SearchScreen({Key? key}) : super(key: key);

  @override
  State<SearchScreen> createState() => _SearchScreenState();
}

class _SearchScreenState extends State<SearchScreen> {
  String searchQuery = '';
  final List<String> cities = [
    'Santiago',
    'Querétaro',
    'México',
    'Guadalajara',
  ];
  List<String> filteredCities = [];

  @override
  void initState() {
    super.initState();
    filteredCities = cities; // Inicializa con todas las ciudades
  }

  void filterCities(String query) {
    setState(() {
      searchQuery = query;
      if (query.isEmpty) {
        filteredCities = cities;
      } else {
        filteredCities = cities
            .where((city) => city.toLowerCase().contains(query.toLowerCase()))
            .toList();
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Buscar Ciudades')),
      body: Column(
        children: [
          Padding(
            padding: const EdgeInsets.all(16),
            child: TextField(
              onChanged: filterCities,
              decoration: const InputDecoration(
                hintText: 'Busca una ciudad...',
                border: OutlineInputBorder(),
              ),
            ),
          ),
          Expanded(
            child: filteredCities.isEmpty
                ? const Center(child: Text('No encontradas'))
                : ListView.builder(
                    itemCount: filteredCities.length,
                    itemBuilder: (context, index) {
                      return ListTile(
                        title: Text(filteredCities[index]),
                        onTap: () {
                          Navigator.pop(context, filteredCities[index]);
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
