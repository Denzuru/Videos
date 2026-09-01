import {makeProject} from '@revideo/core';

import './global.css';

import title from './scenes/01-title';
import longAgo from './scenes/02-long-ago';
import buildABoat from './scenes/03-build-a-boat';
import building from './scenes/04-building';
import twoByTwo from './scenes/05-two-by-two';
import theDoor from './scenes/06-the-door';
import rain from './scenes/07-rain';
import theDove from './scenes/08-the-dove';
import rainbow from './scenes/09-rainbow';

export default makeProject({
  name: 'noahs-big-boat',
  scenes: [
    title,
    longAgo,
    buildABoat,
    building,
    twoByTwo,
    theDoor,
    rain,
    theDove,
    rainbow,
  ],
  settings: {
    shared: {size: {x: 1920, y: 1080}},
    rendering: {fps: 30},
  },
});
