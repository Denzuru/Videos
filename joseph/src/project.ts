import {makeProject} from '@revideo/core';

import './global.css';

import title from './scenes/01-title';
import favourite from './scenes/02-favourite';
import dreams from './scenes/03-dreams';
import thePit from './scenes/04-the-pit';
import potiphar from './scenes/05-potiphar';
import prison from './scenes/06-prison';
import pharaohsDream from './scenes/07-pharaohs-dream';
import secondInEgypt from './scenes/08-second-in-egypt';
import theBrothersCome from './scenes/09-the-brothers-come';
import iAmJoseph from './scenes/10-i-am-joseph';
import reunion from './scenes/11-reunion';

export default makeProject({
  name: 'josephs-amazing-coat',
  scenes: [
    title,
    favourite,
    dreams,
    thePit,
    potiphar,
    prison,
    pharaohsDream,
    secondInEgypt,
    theBrothersCome,
    iAmJoseph,
    reunion,
  ],
  settings: {
    shared: {size: {x: 1920, y: 1080}},
    rendering: {fps: 30},
  },
});
