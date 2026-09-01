/**
 * Every spoken line in the film, in order, grouped by the scene it belongs to.
 *
 * This is the source of truth twice over. `scripts/build-voiceover.mjs` reads it
 * to know how many lines are inside each recording and roughly how long each one
 * should run, and the scenes quote the same words back when they caption them,
 * so a caption cannot silently drift out of sync with the voice. Change a line
 * here, change it in its scene, re-record `vo/raw/<scene>.mp3`, then run
 * `npm run voiceover`.
 */
export const lines = {
  '01-weight': [
    {id: 'tired', text: 'You are not tired because your week was long.'},
    {id: 'carrying', text: 'You are tired because you are carrying something you were never built to carry.'},
    {id: 'mistake', text: 'Every mistake nobody knows about.'},
    {id: 'again', text: 'Every night you swore never again, and did it again anyway.'},
  ],
  '02-running': [
    {id: 'moving', text: 'So you keep moving.'},
    {id: 'louder', text: 'Louder music. Longer hours.'},
    {id: 'screen', text: 'Another screen at two in the morning.'},
    {id: 'quiet', text: 'Anything, so it stays quiet in there.'},
    {id: 'question', text: 'But sooner or later everybody meets the same question.'},
    {id: 'done', text: 'What do I do with what I have done?'},
  ],
  '03-the-gap': [
    {id: 'word', text: 'The Bible has a word for it.'},
    {id: 'sin', text: 'Sin.'},
    {id: 'petty', text: 'And it is not God being petty.'},
    {id: 'canyon', text: 'It is a canyon.'},
    {id: 'stacked', text: 'Every good thing you have ever done, stacked to the sky, still does not reach the other side.'},
    {id: 'climbed', text: 'Nobody has ever climbed out.'},
    {id: 'notone', text: 'Not one person. Ever.'},
  ],
  '04-the-cross': [
    {id: 'expected', text: 'So God did the last thing anybody expected.'},
    {id: 'standard', text: 'He did not lower the standard. He paid it.'},
    {id: 'took', text: 'Two thousand years ago, the one man who never earned death took yours.'},
    {id: 'hands', text: 'Nails through the hands of the God who made hands.'},
    {id: 'losing', text: 'He was not losing. He was choosing.'},
    {id: 'you', text: 'He was choosing you.'},
  ],
  '05-alive': [
    {id: 'empty', text: 'And three days later, the tomb was empty.'},
    {id: 'legend', text: 'Not a metaphor. Not a legend.'},
    {id: 'receipt', text: 'A stone rolled back, and a receipt written in daylight.'},
    {id: 'paid', text: 'Paid in full. Death lost.'},
  ],
  '06-the-offer': [
    {id: 'offer', text: 'So here is the offer, and it is scandalous.'},
    {id: 'clean', text: 'Not clean yourself up first.'},
    {id: 'harder', text: 'Not try harder for another year.'},
    {id: 'come', text: 'Just come.'},
    {id: 'grace', text: 'Grace is not a prize for the good. It is a rescue for the drowning.'},
    {id: 'reaching', text: 'And His hand is already out.'},
  ],
  '07-the-promise': [
    {id: 'romans', text: 'Romans ten, verse nine.'},
    {id: 'confess', text: 'If you confess with your mouth that Jesus is Lord, and believe in your heart that God raised Him from the dead, you will be saved.'},
    {id: 'now', text: 'You can do that right now.'},
    {id: 'sitting', text: 'Right where you are sitting.'},
    {id: 'nochurch', text: 'No church. No clean record. No perfect words.'},
  ],
  '08-come-home': [
    {id: 'prayer', text: 'Jesus, I believe you died for me and rose again.'},
    {id: 'running', text: 'I am done running.'},
    {id: 'lord', text: 'Come and be my Lord. Save me.'},
    {id: 'whole', text: 'That is it. That is the whole thing.'},
    {id: 'party', text: 'And heaven throws a party over one person coming home.'},
    {id: 'today', text: 'Today, that could be you.'},
  ],
} as const;

export type SceneKey = keyof typeof lines;
