extends SceneTree

func _initialize() -> void:
	call_deferred("export_sounds")

func export_sounds() -> void:
	seed(20260916)
	var sound = load("res://sfx.gd").new()
	root.add_child(sound)
	await process_frame
	var destination = ProjectSettings.globalize_path("res://../../../assets/skybound/sfx")
	DirAccess.make_dir_recursive_absolute(destination)
	var clips = {
		"sonic-boom": sound._wav_sonic,
		"explosion": sound._wav_explosion,
		"thud": sound._wav_thud,
		"whoosh": sound._wav_whoosh,
		"crumble": sound._wav_crumble,
		"laser-hum": sound._laser_player.stream,
	}
	for name in clips:
		var result = clips[name].save_to_wav(destination + "/" + name + ".wav")
		if result != OK:
			push_error("Failed exporting " + name)
			quit(1)
			return
		print("Exported ", name)
	sound.queue_free()
	quit()
