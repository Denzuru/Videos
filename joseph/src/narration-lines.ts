/**
 * Every spoken line in the film, in order, and the single source of truth for
 * both the on-screen caption and the recorded narration.
 *
 * scripts/build-voiceover.mjs uses these to place the line boundaries inside
 * each scene's recording and writes the timings to narration.json, so the
 * words on screen and the words in the voice cannot drift apart.
 */
export const narrationLines = {
  'favourite': [
    {id: 'favourite-00', text: 'A long time ago there was a boy called Joseph.'},
    {id: 'favourite-01', text: 'He had eleven brothers. That is a lot of brothers.'},
    {id: 'favourite-02', text: 'But Joseph was the favourite son, and everybody knew it.'},
    {id: 'favourite-03', text: 'One day his father gave him a present.'},
    {id: 'favourite-04', text: 'A coat with every colour in it.'},
    {id: 'favourite-05', text: 'Joseph loved that coat. He wore it everywhere.'},
    {id: 'favourite-06', text: 'His brothers hated it.'},
  ],
  'dreams': [
    {id: 'dreams-00', text: 'Then Joseph started having dreams.'},
    {id: 'dreams-01', text: 'In one, eleven bundles of wheat bowed down to his bundle.'},
    {id: 'dreams-02', text: 'In another, the sun and the moon and eleven stars bowed to him.'},
    {id: 'dreams-03', text: 'And Joseph, who was not very wise yet, told his brothers all about them.'},
    {id: 'dreams-04', text: 'You can guess how that went.'},
    {id: 'dreams-05', text: 'Now they did not just dislike him. They wanted him gone.'},
  ],
  'the-pit': [
    {id: 'the-pit-00', text: 'One day their father sent Joseph out to find them.'},
    {id: 'the-pit-01', text: 'They saw his colourful coat coming from far away.'},
    {id: 'the-pit-02', text: 'They grabbed him, and they threw him into an empty well.'},
    {id: 'the-pit-03', text: 'Then some traders came past on their way to Egypt.'},
    {id: 'the-pit-04', text: 'And his own brothers sold him. For twenty pieces of silver.'},
    {id: 'the-pit-05', text: 'They took his coat home and told their father a lie.'},
    {id: 'the-pit-06', text: 'Joseph was gone. But God was not.'},
  ],
  'potiphar': [
    {id: 'potiphar-00', text: 'In Egypt, Joseph was sold to a man called Potiphar.'},
    {id: 'potiphar-01', text: 'Joseph worked hard, and God was with him.'},
    {id: 'potiphar-02', text: 'Soon he was in charge of the whole house.'},
    {id: 'potiphar-03', text: 'But then somebody told a lie about him.'},
    {id: 'potiphar-04', text: 'And Joseph, who had done nothing wrong, was thrown into prison.'},
    {id: 'potiphar-05', text: 'That is twice now that he lost everything.'},
  ],
  'prison': [
    {id: 'prison-00', text: 'Joseph could have given up. He did not.'},
    {id: 'prison-01', text: 'In prison he helped people, and God was still with him.'},
    {id: 'prison-02', text: 'Two of the kings servants had strange dreams.'},
    {id: 'prison-03', text: 'Joseph told them what the dreams meant. And he was right.'},
    {id: 'prison-04', text: 'One of them went back to work for the king.'},
    {id: 'prison-05', text: 'And then he forgot all about Joseph. For two whole years.'},
  ],
  'pharaohs-dream': [
    {id: 'pharaohs-dream-00', text: 'Then the king of Egypt had a dream that scared him.'},
    {id: 'pharaohs-dream-01', text: 'Seven fat cows came out of the river.'},
    {id: 'pharaohs-dream-02', text: 'Then seven skinny cows came and ate them up.'},
    {id: 'pharaohs-dream-03', text: 'Nobody in Egypt could tell him what it meant.'},
    {id: 'pharaohs-dream-04', text: 'Then the servant remembered. There is a man in prison.'},
    {id: 'pharaohs-dream-05', text: 'So they washed Joseph and brought him to the king.'},
    {id: 'pharaohs-dream-06', text: 'Seven good years are coming, said Joseph. Then seven hungry ones.'},
  ],
  'second-in-egypt': [
    {id: 'second-in-egypt-00', text: 'Save food in the good years, and Egypt will not starve.'},
    {id: 'second-in-egypt-01', text: 'The king looked at Joseph and made a decision.'},
    {id: 'second-in-egypt-02', text: 'He put his own ring on Josephs finger.'},
    {id: 'second-in-egypt-03', text: 'The boy from the well was now the second most powerful man in Egypt.'},
    {id: 'second-in-egypt-04', text: 'For seven years Joseph filled the storehouses.'},
    {id: 'second-in-egypt-05', text: 'And then the hungry years came, exactly as he said.'},
  ],
  'the-brothers-come': [
    {id: 'the-brothers-come-00', text: 'The hunger reached all the way back home.'},
    {id: 'the-brothers-come-01', text: 'So Jacob sent his sons to Egypt to buy food.'},
    {id: 'the-brothers-come-02', text: 'They stood in front of the great ruler and bowed down low.'},
    {id: 'the-brothers-come-03', text: 'Just like the bundles of wheat, all those years ago.'},
    {id: 'the-brothers-come-04', text: 'They did not recognise him at all.'},
    {id: 'the-brothers-come-05', text: 'But Joseph knew exactly who they were.'},
  ],
  'i-am-joseph': [
    {id: 'i-am-joseph-00', text: 'Joseph tested them, to see if their hearts had changed.'},
    {id: 'i-am-joseph-01', text: 'And when he saw that they had, he could not hold it in.'},
    {id: 'i-am-joseph-02', text: 'He sent everybody out of the room. And then he cried.'},
    {id: 'i-am-joseph-03', text: 'I am Joseph, he said. I am your brother.'},
    {id: 'i-am-joseph-04', text: 'They were terrified. They thought he would punish them.'},
    {id: 'i-am-joseph-05', text: 'But Joseph said something nobody expected.'},
    {id: 'i-am-joseph-06', text: 'You meant it for evil. God meant it for good.'},
  ],
  'reunion': [
    {id: 'reunion-00', text: 'He forgave them. Every single one.'},
    {id: 'reunion-01', text: 'And he brought his whole family to Egypt, where there was food.'},
    {id: 'reunion-02', text: 'Old Jacob got to hug the son he thought was dead.'},
    {id: 'reunion-03', text: 'God had been with Joseph in the well, and in the prison, and on the throne.'},
    {id: 'reunion-04', text: 'He was never once on his own.'},
    {id: 'reunion-05', text: 'And neither are you.'},
  ],
} as const;

export type SceneKey = keyof typeof narrationLines;

export interface NarrationLine {
  id: string;
  text: string;
}
