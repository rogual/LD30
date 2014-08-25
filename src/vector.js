

function lift(f) {
  return function(a, b) {
    return [f(a[0], b[0]), f(a[1], b[1])];
  };
}

var V = exports;

V.add = lift(function(a, b) { return a + b; });
V.sub = lift(function(a, b) { return a - b; });

V.dot = function(a, b) {
  return a[0] * b[0] + a[1] * b[1];
};

V.magSq = function(v) {
  return V.dot(v, v);
};

V.mag = function(v) {
  return Math.sqrt(V.magSq(v));
};

V.scale = function(v, f) {
  return [v[0] * f, v[1] * f];
};

V.eq = function(a, b) {
  return a[0] == b[0] && a[1] == b[1];
};

V.norm = function(v) {
  if (V.eq(v, [0, 0]))
    return v;
  return V.scale(v, 1 / V.mag(v));
};
