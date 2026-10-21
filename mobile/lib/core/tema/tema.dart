import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:shared_preferences/shared_preferences.dart';

class ColoresMestizo {
  const ColoresMestizo._();

  static const claroFondo = Color(0xFFF4E8E2);
  static const claroSuperficie = Color(0xFFFFF8F3);
  static const claroSuperficie2 = Color(0xFFFFF1EA);
  static const claroTinta = Color(0xFF3A2A26);
  static const claroTintaSuave = Color(0xFF6B524B);
  static const claroLinea = Color(0xFFEAD5CC);
  static const claroPrimario = Color(0xFF4A7358);
  static const claroPrimarioHover = Color(0xFF3B5D47);
  static const claroAcento = Color(0xFFA85C52);
  static const claroPeligro = Color(0xFF9F1239);
  static const claroAviso = Color(0xFFFFF3DC);
  static const claroBarra = Color(0xFF5A4450);
  static const claroBarraTinta = Color(0xFFFFF6F1);
  static const claroHeroLema = Color(0xFF9A5348);

  static const oscuroFondo = Color(0xFF120E16);
  static const oscuroSuperficie = Color(0xFF1A1422);
  static const oscuroSuperficie2 = Color(0xFF241C2C);
  static const oscuroTinta = Color(0xFFF6EAF0);
  static const oscuroTintaSuave = Color(0xFFC8B0BC);
  static const oscuroLinea = Color(0xFF3A2A42);
  static const oscuroPrimario = Color(0xFFFF7AA8);
  static const oscuroAcento = Color(0xFF5EF2C4);
  static const oscuroPeligro = Color(0xFFFF6B8A);
  static const oscuroAviso = Color(0xFF2A2210);
  static const oscuroBarra = Color(0xFF100C14);
  static const oscuroHeroLema = Color(0xFFFFE08A);
}

ThemeData temaClaro() => _armar(
      brillo: Brightness.light,
      fondo: ColoresMestizo.claroFondo,
      superficie: ColoresMestizo.claroSuperficie,
      superficie2: ColoresMestizo.claroSuperficie2,
      tinta: ColoresMestizo.claroTinta,
      tintaSuave: ColoresMestizo.claroTintaSuave,
      linea: ColoresMestizo.claroLinea,
      primario: ColoresMestizo.claroPrimario,
      sobrePrimario: ColoresMestizo.claroSuperficie,
      acento: ColoresMestizo.claroAcento,
      peligro: ColoresMestizo.claroPeligro,
      barra: ColoresMestizo.claroBarra,
      barraTinta: ColoresMestizo.claroBarraTinta,
    );

ThemeData temaOscuro() => _armar(
      brillo: Brightness.dark,
      fondo: ColoresMestizo.oscuroFondo,
      superficie: ColoresMestizo.oscuroSuperficie,
      superficie2: ColoresMestizo.oscuroSuperficie2,
      tinta: ColoresMestizo.oscuroTinta,
      tintaSuave: ColoresMestizo.oscuroTintaSuave,
      linea: ColoresMestizo.oscuroLinea,
      primario: ColoresMestizo.oscuroPrimario,
      sobrePrimario: const Color(0xFF1A1016),
      acento: ColoresMestizo.oscuroAcento,
      peligro: ColoresMestizo.oscuroPeligro,
      barra: ColoresMestizo.oscuroBarra,
      barraTinta: ColoresMestizo.oscuroTinta,
    );

ThemeData _armar({
  required Brightness brillo,
  required Color fondo,
  required Color superficie,
  required Color superficie2,
  required Color tinta,
  required Color tintaSuave,
  required Color linea,
  required Color primario,
  required Color sobrePrimario,
  required Color acento,
  required Color peligro,
  required Color barra,
  required Color barraTinta,
}) {
  final esquema = ColorScheme(
    brightness: brillo,
    primary: primario,
    onPrimary: sobrePrimario,
    secondary: acento,
    onSecondary: sobrePrimario,
    error: peligro,
    onError: Colors.white,
    surface: superficie,
    onSurface: tinta,
    onSurfaceVariant: tintaSuave,
    outline: linea,
    surfaceContainerHighest: superficie2,
  );

  final cuerpo = GoogleFonts.bricolageGrotesqueTextTheme(
    ThemeData(brightness: brillo, useMaterial3: true).textTheme,
  ).apply(bodyColor: tinta, displayColor: tinta);

  final titulos = GoogleFonts.bricolageGrotesque(
    fontWeight: FontWeight.w700,
    letterSpacing: -0.4,
    color: tinta,
  );

  return ThemeData(
    useMaterial3: true,
    colorScheme: esquema,
    scaffoldBackgroundColor: fondo,
    textTheme: cuerpo.copyWith(
      displaySmall: titulos.copyWith(fontSize: 30),
      headlineMedium: titulos.copyWith(fontSize: 26),
      headlineSmall: titulos.copyWith(fontSize: 22),
      titleLarge: titulos.copyWith(fontSize: 20),
      titleMedium: titulos.copyWith(fontSize: 17, fontWeight: FontWeight.w600),
    ),
    appBarTheme: AppBarTheme(
      backgroundColor: barra,
      foregroundColor: barraTinta,
      elevation: 0,
      centerTitle: false,
      titleTextStyle: GoogleFonts.bricolageGrotesque(
        fontWeight: FontWeight.w700,
        fontSize: 18,
        color: barraTinta,
      ),
    ),
    cardTheme: CardThemeData(
      color: superficie,
      elevation: 0,
      margin: EdgeInsets.zero,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(18),
        side: BorderSide(color: linea),
      ),
    ),
    inputDecorationTheme: InputDecorationTheme(
      filled: true,
      fillColor: superficie2,
      border: OutlineInputBorder(
        borderRadius: BorderRadius.circular(14),
        borderSide: BorderSide(color: linea),
      ),
      enabledBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(14),
        borderSide: BorderSide(color: linea),
      ),
      focusedBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(14),
        borderSide: BorderSide(color: primario, width: 2),
      ),
    ),
    filledButtonTheme: FilledButtonThemeData(
      style: FilledButton.styleFrom(
        minimumSize: const Size(48, 52),
        backgroundColor: primario,
        foregroundColor: sobrePrimario,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        textStyle: GoogleFonts.bricolageGrotesque(fontWeight: FontWeight.w700),
      ),
    ),
    outlinedButtonTheme: OutlinedButtonThemeData(
      style: OutlinedButton.styleFrom(
        minimumSize: const Size(48, 52),
        foregroundColor: tinta,
        side: BorderSide(color: linea),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
      ),
    ),
    navigationBarTheme: NavigationBarThemeData(
      backgroundColor: barra,
      indicatorColor: primario.withValues(alpha: 0.28),
      iconTheme: WidgetStateProperty.resolveWith((states) {
        final activo = states.contains(WidgetState.selected);
        return IconThemeData(color: activo ? barraTinta : barraTinta.withValues(alpha: 0.7));
      }),
      labelTextStyle: WidgetStateProperty.all(
        GoogleFonts.bricolageGrotesque(
          fontSize: 11,
          fontWeight: FontWeight.w600,
          color: barraTinta,
        ),
      ),
    ),
    snackBarTheme: SnackBarThemeData(
      behavior: SnackBarBehavior.floating,
      backgroundColor: barra,
      contentTextStyle: TextStyle(color: barraTinta),
    ),
    iconButtonTheme: IconButtonThemeData(
      style: IconButton.styleFrom(
        minimumSize: const Size(48, 48),
        tapTargetSize: MaterialTapTargetSize.padded,
      ),
    ),
  );
}

TextStyle estiloLeyenda(Color color) {
  return GoogleFonts.fraunces(
    fontStyle: FontStyle.italic,
    fontSize: 14,
    height: 1.4,
    color: color,
  );
}

TextStyle estiloHistoria(Color color) {
  return GoogleFonts.newsreader(
    fontSize: 18,
    height: 1.5,
    color: color,
  );
}

class TemaControlador extends ChangeNotifier {
  TemaControlador(this._prefs) {
    final guardado = _prefs.getString(_clave);
    _modo = switch (guardado) {
      'oscuro' => ThemeMode.dark,
      'claro' => ThemeMode.light,
      _ => ThemeMode.system,
    };
  }

  static const _clave = 'tema_mestizo';
  final SharedPreferences _prefs;
  ThemeMode _modo = ThemeMode.system;

  ThemeMode get modo => _modo;

  bool get esOscuroForzado => _modo == ThemeMode.dark;

  Future<void> alternar(Brightness plataforma) async {
    final ahoraOscuro = _modo == ThemeMode.dark ||
        (_modo == ThemeMode.system && plataforma == Brightness.dark);
    _modo = ahoraOscuro ? ThemeMode.light : ThemeMode.dark;
    await _prefs.setString(_clave, _modo == ThemeMode.dark ? 'oscuro' : 'claro');
    notifyListeners();
  }
}
