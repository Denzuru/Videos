# Come Home - launch pack

Everything needed to publish the film, with the numbers it was chosen on. Titles
are scored with vidIQ's short-form CTR model; keywords are vidIQ research pulled
on 1 September 2026. Scores are a model's opinion, not a promise, so they are
here to rank options against each other and nothing more.

## Titles, scored

| Score | Title |
|-------|-------|
| **94** | **Watch This If You Are Done Running From God** |
| 90 | He Was Not Losing. He Was Choosing You. |
| 87 | You Are Not Tired Because Your Week Was Long |
| 84 | The Question Nobody Wants To Answer About Jesus |

Lead with the 94. It is second person, it names a felt state rather than a
doctrine, and "done running" is the film's own language, so the title and the
prayer in the last scene rhyme.

Hold the other three for the re-uploads. The same film published a month apart
under a different first line is a different video to the algorithm and to the
half of the audience that scrolled past the first one.

## Where the search demand actually is

| Keyword | Monthly searches | Competition | Overall |
|---------|-----------------:|------------:|--------:|
| jesus christ | 258,971 | 41.0 | 72.1 |
| christian motivation | 197,334 | 37.9 | 72.3 |
| preaching | 47,568 | 36.2 | 67.4 |
| god loves you | 20,505 | 38.1 | 63.4 |
| christian faith | 28,882 | 38.6 | 64.5 |

The bare head terms - "jesus" at 1.6M, "bible" at 937K, "god" at 717K - are not
worth targeting: competition is 61 to 67 and a new upload is invisible in them.
The four above are where a small channel can actually rank, and "jesus christ"
is up 18.7% month on month, which is the one genuinely rising term in the set.

Note the markets. In this data the top countries for "christian motivation" are
Vietnam, the United States, Nigeria, Pakistan and South Africa. If a follow-up is
ever subtitled, that list is the order to do it in.

## Description

> You are not tired because your week was long. You are tired because you are
> carrying something you were never built to carry.
>
> This is the whole gospel in two minutes: what the weight is, why nobody has
> ever climbed out from under it, what God did about it, and what it costs you
> to be free of it. Nothing.
>
> "If you confess with your mouth that Jesus is Lord, and believe in your heart
> that God raised Him from the dead, you will be saved." - Romans 10:9
>
> If you prayed with the last scene, you are not a project. You are family.
> Tell one person today, and find a church that opens the Bible.
>
> #jesus #gospel #christianmotivation #faith #godlovesyou

Keep the first two lines exactly as they are. On Shorts, that is all anybody
reads, and they are the hook the film opens on.

## Hashtags

Primary: `#jesus #gospel #christianmotivation #faith #godlovesyou`
Secondary, rotate three at a time: `#jesuschrist #christian #bible #salvation
#hope #testimony #romans109 #preaching`

Five to seven total. More than that reads as spam and dilutes the classification
signal.

## The cuts

| Cut | Length | Where | What changes |
|-----|--------|-------|--------------|
| Full film | 2:17 | YouTube Shorts, Reels, TikTok, Facebook | As rendered |
| The hook cut | 0:45 | TikTok, Reels | Scenes 1, 4 and 8 only, straight into the prayer |
| The cross cut | 0:32 | Anywhere as a teaser | Scene 4 alone, ending on "He was choosing you" |

Shorts and Reels both take up to three minutes now, so the full film runs
without a trim. The 45 second cut exists because TikTok completion rates fall
off a cliff after a minute, and a completed 45 seconds beats an abandoned two
minutes on every platform that ranks watch time as a percentage.

To make either short cut, edit `src/project.ts` down to the scenes you want and
re-render. Nothing else needs to change; the music mixer reads the length of
whatever it is handed.

## Thumbnail and cover frame

Use the frame from scene 4 where the god rays are widest behind the centre
cross, with no caption on screen. It is the highest-contrast frame in the film
and the only one that reads at 120 pixels wide.

If a text cover is wanted, one word, top third, in the same Playfair as the
title card: **CHOSEN**. Never put the full title on the cover; the title is
already next to it in the feed.

## Pinned comment

> If you prayed that prayer today, comment "today" and I will pray for you by
> name. Two things next: tell one person, and find a church this Sunday that
> opens the Bible.

A pinned comment that asks for one word gets answered. One that asks for a
testimony gets read and scrolled past.

## Posting

- **Best window**: Sunday 06:00 to 09:00 local, and Wednesday evening. That is
  when this audience is already thinking about it.
- **First hour**: reply to every comment. Early comment velocity is the single
  strongest signal a new short can send.
- **Do not** run this as an ad without a lead-in. It is a two minute film with a
  prayer in it, and cold paid traffic will bounce in the first three seconds
  and teach the algorithm the wrong thing about it.
- **Re-upload cadence**: same film, new title from the table above, once every
  four to six weeks.

## What is deliberately not here

No countdown, no "wait for it", no "99% of people scroll past this". The film
earns attention by being specific in its first sentence, and the moment it
borrows a bait pattern, the last scene stops being trustworthy - which is the
one thing the whole two minutes is spending its credibility on.
