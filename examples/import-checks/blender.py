"""blender --background --python blender.py -- /absolute/path/traveller.glb"""
import bpy
import json
import sys

asset = sys.argv[sys.argv.index('--') + 1]
bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.ops.import_scene.gltf(filepath=asset)
rigs = [obj for obj in bpy.data.objects if obj.type == 'ARMATURE']
report = {'blender': bpy.app.version_string, 'file': asset,
          'bones': [len(obj.data.bones) for obj in rigs],
          'actions': [action.name for action in bpy.data.actions]}
print(json.dumps(report, indent=2))
assert len(rigs) == 1 and len(rigs[0].data.bones) == 24
assert len(bpy.data.actions) == 9
