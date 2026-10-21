import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:shared_preferences/shared_preferences.dart';

import 'app.dart';
import 'core/providers.dart';

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();
  // Si el CDN de fuentes falla (Wi‑Fi del campus, DNS), el APK debug no debe cerrarse.
  GoogleFonts.config.allowRuntimeFetching = true;
  ErrorWidget.builder = (details) {
    return Material(
      color: const Color(0xFFF4E8E2),
      child: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(24),
          child: Text(
            'Algo se rompió en esta pantalla. Vuelve atrás o reabre Mestizo.\n\n${details.exception}',
            style: const TextStyle(color: Color(0xFF3A2A26)),
          ),
        ),
      ),
    );
  };
  final prefs = await SharedPreferences.getInstance();
  runApp(
    ProviderScope(
      overrides: [prefsProvider.overrideWithValue(prefs)],
      child: const MestizoApp(),
    ),
  );
}
