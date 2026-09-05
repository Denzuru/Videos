import {makeProject} from '@revideo/core';

import './global.css';

import arrow from './scenes/arrow';

export default makeProject({
  name: 'pulled-back',
  scenes: [arrow],
  settings: {
    shared: {size: {x: 1080, y: 1920}},
    rendering: {fps: 30},
  },
});
