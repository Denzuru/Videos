import {makeProject} from '@motion-canvas/core';

import './global.css';

import title from './scenes/01-title?scene';
import creation from './scenes/02-creation?scene';
import broken from './scenes/03-broken?scene';
import theGap from './scenes/04-the-gap?scene';
import heCame from './scenes/05-he-came?scene';
import theCross from './scenes/06-the-cross?scene';
import alive from './scenes/07-alive?scene';
import comeHome from './scenes/08-come-home?scene';

export default makeProject({
  name: 'gospel-for-a-child',
  scenes: [title, creation, broken, theGap, heCame, theCross, alive, comeHome],
});
