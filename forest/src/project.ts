import {makeProject} from '@revideo/core';

import './global.css';

import forest from './scenes/forest';

export default makeProject({
  name: 'quiet-growth',
  scenes: [forest],
  settings: {
    shared: {size: {x: 1080, y: 1920}},
    rendering: {fps: 30},
  },
});
