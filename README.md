# KAPLAY-Live2D-Experiment

Experiment for rendering a Live2D model in KAPLAY using `k.drawPolygon` (it works).

All actual loading / rendering logic was copied from [GitHub - Moebits/live2d-renderer: A simple and easy to use Live2D model renderer](https://github.com/Moebits/live2d-renderer), I just replaced the draw calls with `k.drawPolygon`.



There is no way to selectively play animations / interact with the model or anything (but there could be). It simply loads the model and displays it, however live2d-renderer does support auto-animations which will show animations.



Needs the Cubism Web Framework extraced into a folder called `framework/` and placed inside `src/`. 

Needs `live2dcubismcore.min.js` placed inside `src/grindleLive2d/noautoimport/live2d-renderer`.



Otherwise, the plugin API is shown in `grindleLive2d`, exported in `index.ts`.

Note that this is cobbled together as I was simply trying to get it working as a test. I'm going back to Godot for now though.