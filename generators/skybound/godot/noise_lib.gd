class_name NoiseLib
## Deterministic 2D simplex noise + helpers. Bit-compatible with the JS
## original (same LCG seed, same imul hash) so this build generates the
## identical world as the Three.js version.

static var PERM: PackedInt32Array
static var GRAD: PackedFloat32Array
static var F2: float
static var G2: float

static func _static_init() -> void:
	F2 = 0.5 * (sqrt(3.0) - 1.0)
	G2 = (3.0 - sqrt(3.0)) / 6.0
	GRAD = PackedFloat32Array([1, 1, -1, 1, 1, -1, -1, -1, 1, 0, -1, 0, 0, 1, 0, -1])
	var s: int = 1337
	var p := PackedInt32Array()
	p.resize(256)
	for i in 256:
		p[i] = i
	var i := 255
	while i > 0:
		s = (s * 1664525 + 1013904223) & 0xFFFFFFFF
		var j := int(float(s) / 4294967296.0 * float(i + 1))
		var t := p[i]
		p[i] = p[j]
		p[j] = t
		i -= 1
	PERM = PackedInt32Array()
	PERM.resize(512)
	for k in 512:
		PERM[k] = p[k & 255]

static func snoise(x: float, y: float) -> float:
	var perm := PERM
	var grad := GRAD
	var s := (x + y) * F2
	var i := floori(x + s)
	var j := floori(y + s)
	var t := float(i + j) * G2
	var x0 := x - (float(i) - t)
	var y0 := y - (float(j) - t)
	var i1 := 1 if x0 > y0 else 0
	var j1 := 0 if x0 > y0 else 1
	var x1 := x0 - float(i1) + G2
	var y1 := y0 - float(j1) + G2
	var x2 := x0 - 1.0 + 2.0 * G2
	var y2 := y0 - 1.0 + 2.0 * G2
	var ii := i & 255
	var jj := j & 255
	var n := 0.0
	var t0 := 0.5 - x0 * x0 - y0 * y0
	if t0 > 0.0:
		t0 *= t0
		var g := (perm[ii + perm[jj]] & 7) * 2
		n += t0 * t0 * (grad[g] * x0 + grad[g + 1] * y0)
	var t1 := 0.5 - x1 * x1 - y1 * y1
	if t1 > 0.0:
		t1 *= t1
		var g1 := (perm[ii + i1 + perm[jj + j1]] & 7) * 2
		n += t1 * t1 * (grad[g1] * x1 + grad[g1 + 1] * y1)
	var t2 := 0.5 - x2 * x2 - y2 * y2
	if t2 > 0.0:
		t2 *= t2
		var g2 := (perm[ii + 1 + perm[jj + 1]] & 7) * 2
		n += t2 * t2 * (grad[g2] * x2 + grad[g2 + 1] * y2)
	return 70.0 * n

static func fbm(x: float, y: float, octaves: int, lacunarity := 2.0, gain := 0.5) -> float:
	var a := 0.5
	var f := 1.0
	var sum := 0.0
	for o in octaves:
		sum += a * snoise(x * f, y * f)
		f *= lacunarity
		a *= gain
	return sum

static func ridged(x: float, y: float, octaves: int) -> float:
	var a := 0.5
	var f := 1.0
	var sum := 0.0
	for o in octaves:
		sum += a * (1.0 - absf(snoise(x * f, y * f)))
		f *= 2.1
		a *= 0.5
	return sum

static func _imul32(a: int, b: int) -> int:
	return ((a & 0xFFFFFFFF) * (b & 0xFFFFFFFF)) & 0xFFFFFFFF

static func hash2(x: int, y: int) -> float:
	var h := (_imul32(x, 374761393) + _imul32(y, 668265263)) & 0xFFFFFFFF
	h = _imul32(h ^ (h >> 13), 1274126177) & 0xFFFFFFFF
	return float((h ^ (h >> 16)) & 0xFFFFFFFF) / 4294967296.0

## Frame-rate independent smoothing factor.
static func damp(rate: float, dt: float) -> float:
	return 1.0 - exp(-rate * dt)
