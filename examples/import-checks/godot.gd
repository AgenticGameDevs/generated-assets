# godot --headless --path /path/to/temp-project --script /absolute/path/godot.gd -- /absolute/path/traveller.glb
extends SceneTree

func _initialize():
    # GLTFDocument requires initialized engine services.
    call_deferred('check_import')

func check_import():
    var args = OS.get_cmdline_user_args()
    if args.size() != 1:
        printerr('Supply one absolute path to a converted Traveller GLB')
        quit(1)
        return
    var doc = GLTFDocument.new()
    var state = GLTFState.new()
    var error = doc.append_from_file(args[0], state)
    if error != OK:
        printerr('Import failed: ', error)
        quit(1)
        return
    var scene = doc.generate_scene(state)
    var bones = 0
    var clips = []
    var pending = [scene]
    while not pending.is_empty():
        var node = pending.pop_back()
        if node is Skeleton3D:
            bones += node.get_bone_count()
        if node is AnimationPlayer:
            clips.append_array(node.get_animation_list())
        pending.append_array(node.get_children())
    print(JSON.stringify({'version': Engine.get_version_info().string,
        'file': args[0], 'bones': bones, 'clips': clips}))
    scene.free()
    quit(0 if bones == 24 and clips.size() >= 9 else 1)
