import {makeProject} from '@revideo/core';

import './global.css';

import weight from './scenes/01-weight';
import running from './scenes/02-running';
import theGap from './scenes/03-the-gap';
import theCross from './scenes/04-the-cross';
import alive from './scenes/05-alive';
import theOffer from './scenes/06-the-offer';
import thePromise from './scenes/07-the-promise';
import comeHome from './scenes/08-come-home';

export default makeProject({
  name: 'come-home',
  scenes: [
    weight,
    running,
    theGap,
    theCross,
    alive,
    theOffer,
    thePromise,
    comeHome,
  ],
  settings: {
    // Vertical, for a phone held upright: Shorts, Reels and TikTok.
    shared: {size: {x: 1080, y: 1920}},
    rendering: {fps: 30},
  },
});
