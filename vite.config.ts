import {defineConfig} from 'vite';
import motionCanvasPlugin from '@motion-canvas/vite-plugin';

// The plugin ships as CommonJS, so interop can hand back the module namespace
// instead of the factory depending on how the config is loaded.
const motionCanvas =
  (motionCanvasPlugin as unknown as {default?: typeof motionCanvasPlugin})
    .default ?? motionCanvasPlugin;

export default defineConfig({
  plugins: [motionCanvas()],
  server: {port: 9000},
});
