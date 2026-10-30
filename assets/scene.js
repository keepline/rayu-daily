(function () {
  'use strict';
  // Fixed character grid: deterministic scenery, no render loop or network assets.
  var rows = [], width = 160, height = 36;
  for (var y = 0; y < height; y++) {
    var row = '';
    for (var x = 0; x < width; x++) {
      var dx = (x - 86) / 2, dy = y - 13;
      var moon = dx * dx + dy * dy < 125;
      var ridge = 24 - 7 * Math.sin(x * 0.074) - 3 * Math.sin(x * 0.19);
      var seed = (x * 73 + y * 137 + x * y * 19) % 101;
      var c = ' ';
      if (moon) c = (x + y) % 2 ? '/' : '\\';
      if (y > ridge) c = seed < 24 ? '/' : seed < 43 ? '^' : seed < 54 ? ':' : seed < 65 ? '.' : ' ';
      else if (!moon && seed > 98) c = '.';
      row += c;
    }
    rows.push(row);
  }
  document.getElementById('ascii-landscape').textContent = rows.join('\n');
})();
