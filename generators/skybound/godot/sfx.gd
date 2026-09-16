class_name Sfx
extends Node
## Fully procedural sound: wind that scales with airspeed, sonic booms,
## heat-vision hum, explosions, thuds. No audio assets — everything is
## synthesized at startup from noise buffers and oscillators.

const FS := 22050

var _noise := PackedFloat32Array()
var _wind_player: AudioStreamPlayer
var _rumble_player: AudioStreamPlayer
var _laser_player: AudioStreamPlayer
var _wind_filter: AudioEffectBandPassFilter
var _wind_gain := 0.0
var _wind_freq := 300.0
var _rumble_gain := 0.0
var _laser_on := false
var _laser_tween: Tween

var _wav_sonic: AudioStreamWAV
var _wav_explosion: AudioStreamWAV
var _wav_thud: AudioStreamWAV
var _wav_whoosh: AudioStreamWAV
var _wav_crumble: AudioStreamWAV

func _ready() -> void:
	AudioServer.set_bus_volume_db(0, linear_to_db(0.55))
	_noise.resize(FS * 2)
	for i in _noise.size():
		_noise[i] = randf() * 2.0 - 1.0

	# Looping wind: noise -> bandpass bus -> volume.
	var wind_bus := AudioServer.bus_count
	AudioServer.add_bus(wind_bus)
	AudioServer.set_bus_name(wind_bus, "Wind")
	AudioServer.set_bus_send(wind_bus, "Master")
	_wind_filter = AudioEffectBandPassFilter.new()
	_wind_filter.cutoff_hz = 300.0
	_wind_filter.resonance = 0.6
	AudioServer.add_bus_effect(wind_bus, _wind_filter)
	_wind_player = AudioStreamPlayer.new()
	_wind_player.stream = _wav_from(_noise, true)
	_wind_player.bus = "Wind"
	_wind_player.volume_db = -80.0
	add_child(_wind_player)
	_wind_player.play()

	# Low boost rumble: noise -> lowpass bus, played slow.
	var rumble_bus := AudioServer.bus_count
	AudioServer.add_bus(rumble_bus)
	AudioServer.set_bus_name(rumble_bus, "Rumble")
	AudioServer.set_bus_send(rumble_bus, "Master")
	var lp := AudioEffectLowPassFilter.new()
	lp.cutoff_hz = 90.0
	AudioServer.add_bus_effect(rumble_bus, lp)
	_rumble_player = AudioStreamPlayer.new()
	_rumble_player.stream = _wav_from(_noise, true)
	_rumble_player.bus = "Rumble"
	_rumble_player.pitch_scale = 0.3
	_rumble_player.volume_db = -80.0
	add_child(_rumble_player)
	_rumble_player.play()

	# Heat-vision hum: saw + sine through a lowpass, looped.
	var n := FS
	var hum := PackedFloat32Array()
	hum.resize(n)
	var sine_f := float(FS) / 160.0  # near 138Hz, integer periods so the loop is seamless
	for i in n:
		var t := float(i) / FS
		var saw := 2.0 * fposmod(t * 70.0, 1.0) - 1.0
		hum[i] = (saw * 0.7 + sin(TAU * sine_f * t) * 0.5) * 0.5
	_biquad(hum, "lowpass", 700.0, 0.9)
	_laser_player = AudioStreamPlayer.new()
	_laser_player.stream = _wav_from(hum, true)
	_laser_player.volume_db = -80.0
	add_child(_laser_player)

	# Bake the one-shots.
	_wav_sonic = _wav_from(_mix(
		_burst(1.4, "lowpass", 120.0, 1.2, 0.4),
		_burst(0.25, "highpass", 1000.0, 0.5, 1.0)), false)
	_wav_explosion = _wav_from(_mix(
		_burst(1.2, "lowpass", 200.0, 0.8, 0.5),
		_burst(0.3, "bandpass", 900.0, 0.35, 1.0)), false)
	_wav_thud = _wav_from(_mix(_thud_body(), _burst(0.2, "lowpass", 400.0, 0.4, 1.0)), false)
	_wav_whoosh = _wav_from(_burst(0.6, "bandpass", 700.0, 0.5, 1.6), false)
	_wav_crumble = _wav_from(_burst(0.4, "lowpass", 500.0, 0.3, 0.7), false)

# ---------------------------------------------------------------- synthesis

func _burst(dur: float, type: String, freq: float, gain: float, rate: float) -> PackedFloat32Array:
	var n := int((dur + 0.05) * FS)
	var out := PackedFloat32Array()
	out.resize(n)
	var start := randf() * FS
	for i in n:
		out[i] = _noise[int(start + float(i) * rate) % _noise.size()]
	_biquad(out, type, freq, 0.9)
	var ratio := 0.001 / gain
	for i in n:
		var t := float(i) / FS
		out[i] *= gain * pow(ratio, minf(t / dur, 1.2))
	return out

func _thud_body() -> PackedFloat32Array:
	var n := int(0.35 * FS)
	var out := PackedFloat32Array()
	out.resize(n)
	var phase := 0.0
	for i in n:
		var t := float(i) / FS
		var f := 120.0 * pow(30.0 / 120.0, minf(t / 0.25, 1.0))
		phase += TAU * f / FS
		var env := 0.7 * pow(0.001 / 0.7, minf(t / 0.3, 1.3))
		out[i] = sin(phase) * env
	return out

## RBJ biquad, in place.
func _biquad(buf: PackedFloat32Array, type: String, freq: float, q: float) -> void:
	var w0 := TAU * freq / FS
	var cw := cos(w0)
	var sw := sin(w0)
	var alpha := sw / (2.0 * q)
	var b0 := 0.0
	var b1 := 0.0
	var b2 := 0.0
	match type:
		"lowpass":
			b0 = (1.0 - cw) / 2.0
			b1 = 1.0 - cw
			b2 = b0
		"highpass":
			b0 = (1.0 + cw) / 2.0
			b1 = -(1.0 + cw)
			b2 = b0
		"bandpass":
			b0 = alpha
			b1 = 0.0
			b2 = -alpha
	var a0 := 1.0 + alpha
	var a1 := -2.0 * cw
	var a2 := 1.0 - alpha
	b0 /= a0
	b1 /= a0
	b2 /= a0
	a1 /= a0
	a2 /= a0
	var x1 := 0.0
	var x2 := 0.0
	var y1 := 0.0
	var y2 := 0.0
	for i in buf.size():
		var x := buf[i]
		var y := b0 * x + b1 * x1 + b2 * x2 - a1 * y1 - a2 * y2
		x2 = x1
		x1 = x
		y2 = y1
		y1 = y
		buf[i] = y

func _mix(a: PackedFloat32Array, b: PackedFloat32Array) -> PackedFloat32Array:
	var out := a if a.size() >= b.size() else b
	var other := b if a.size() >= b.size() else a
	out = out.duplicate()
	for i in other.size():
		out[i] += other[i]
	return out

func _wav_from(samples: PackedFloat32Array, loop: bool) -> AudioStreamWAV:
	var wav := AudioStreamWAV.new()
	wav.format = AudioStreamWAV.FORMAT_16_BITS
	wav.mix_rate = FS
	wav.stereo = false
	var bytes := PackedByteArray()
	bytes.resize(samples.size() * 2)
	for i in samples.size():
		bytes.encode_s16(i * 2, int(clampf(samples[i], -1.0, 1.0) * 32000.0))
	wav.data = bytes
	if loop:
		wav.loop_mode = AudioStreamWAV.LOOP_FORWARD
		wav.loop_begin = 0
		wav.loop_end = samples.size()
	return wav

func _one_shot(wav: AudioStreamWAV, vol_linear := 1.0, pitch := 1.0) -> void:
	var p := AudioStreamPlayer.new()
	p.stream = wav
	p.volume_db = linear_to_db(maxf(0.001, vol_linear))
	p.pitch_scale = pitch
	add_child(p)
	p.finished.connect(p.queue_free)
	p.play()

# ---------------------------------------------------------------- public API

## speed in m/s; boost 0..1; space 0..1 (mutes wind in vacuum).
func wind(speed: float, boost: float, space: float, dt: float) -> void:
	var air := 1.0 - space * 0.92
	var s := minf(1.0, speed / 300.0)
	var target := (0.02 + s * 0.5) * (1.0 if speed > 6.0 else 0.0) * air
	_wind_gain = lerpf(_wind_gain, target, NoiseLib.damp(8.0, dt))
	_wind_player.volume_db = linear_to_db(maxf(0.0001, _wind_gain))
	_wind_freq = lerpf(_wind_freq, 200.0 + s * 1400.0, NoiseLib.damp(6.5, dt))
	_wind_filter.cutoff_hz = _wind_freq
	_rumble_gain = lerpf(_rumble_gain, boost * 0.5 * air, NoiseLib.damp(10.0, dt))
	_rumble_player.volume_db = linear_to_db(maxf(0.0001, _rumble_gain))

func sonic_boom() -> void:
	_one_shot(_wav_sonic, 1.0, randf_range(0.95, 1.05))

func explosion(intensity := 1.0) -> void:
	var vol := clampf(0.5 * intensity + 0.3, 0.1, 1.2)
	_one_shot(_wav_explosion, vol, randf_range(0.9, 1.1) / clampf(sqrt(intensity), 0.7, 1.3))

func thud(intensity := 1.0) -> void:
	_one_shot(_wav_thud, minf(1.0, 0.7 * intensity), randf_range(0.95, 1.05))

func whoosh() -> void:
	_one_shot(_wav_whoosh, 0.5, randf_range(0.9, 1.1))

func crumble() -> void:
	_one_shot(_wav_crumble, 0.6, randf_range(0.85, 1.15))

func laser(on: bool) -> void:
	if on == _laser_on:
		return
	_laser_on = on
	if _laser_tween and _laser_tween.is_valid():
		_laser_tween.kill()
	_laser_tween = create_tween()
	if on:
		if not _laser_player.playing:
			_laser_player.play()
		_laser_player.volume_db = -40.0
		_laser_tween.tween_property(_laser_player, "volume_db", linear_to_db(0.16), 0.08)
	else:
		_laser_tween.tween_property(_laser_player, "volume_db", -60.0, 0.2)
		_laser_tween.tween_callback(_laser_player.stop)
