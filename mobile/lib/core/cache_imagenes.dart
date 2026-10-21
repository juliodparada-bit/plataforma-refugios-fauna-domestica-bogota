class CacheImagenes {
  final _map = <String, List<int>>{};

  List<int>? obtener(String url) => _map[url];

  void guardar(String url, List<int> bytes) {
    if (_map.length >= 48) _map.remove(_map.keys.first);
    _map[url] = bytes;
  }
}
