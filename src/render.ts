/**
 * Headless render entry point.
 *
 * The Motion Canvas editor normally drives `Renderer` from its UI. This page
 * exposes the same call to Playwright so the video can be produced from a
 * script, with no browser window and no clicking. Rendering is done a slice at
 * a time so the driver can encode and discard frames as it goes.
 */
import {Renderer, Vector2} from '@motion-canvas/core';
import project from './project?project';

declare global {
  interface Window {
    renderVideo: (fps: number, from: number, to: number) => Promise<string>;
    renderProgress: number;
  }
}

window.renderProgress = 0;

window.renderVideo = async (fps = 30, from = 0, to = Infinity) => {
  const renderer = new Renderer(project);

  renderer.onFrameChanged.subscribe(frame => {
    window.renderProgress = frame;
  });

  let outcome = 'unknown';
  renderer.onFinished.subscribe(result => {
    outcome = ['success', 'error', 'aborted'][result] ?? 'unknown';
  });

  await renderer.render({
    name: project.name,
    range: [from, to],
    fps,
    size: new Vector2(1920, 1080),
    resolutionScale: 1,
    colorSpace: 'srgb',
    background: '#0d1330',
    exporter: {
      name: '@motion-canvas/core/image-sequence',
      options: {fileType: 'image/png', quality: 100, groupByScene: false},
    },
  });

  return outcome;
};
