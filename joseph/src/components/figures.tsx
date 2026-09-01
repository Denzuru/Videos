import {Circle, Line, Node, NodeProps, Rect} from '@revideo/2d';
import {PossibleColor} from '@revideo/core';
import {coatStripes, glow, palette} from '../theme';

/**
 * Everyone in this film is built from the same `Person`, drawn standing on
 * y = 0 and facing forward, so a scene drops one onto a ground line by setting
 * its y and nothing else. The variations - a beard, a headdress, the coat -
 * are props rather than separate components, which keeps a crowd of eleven
 * brothers cheap to draw and easy to tell apart.
 */

const SKIN = '#f2c391';

export interface PersonProps extends NodeProps {
  robe?: PossibleColor;
  robeTrim?: PossibleColor;
  skin?: PossibleColor;
  hair?: PossibleColor;
  /** A full beard for the older men, a short one for the brothers. */
  beard?: 'none' | 'short' | 'full';
  /** The coat of many colours, worn over the robe. */
  coat?: boolean;
  /** Pharaoh's striped nemes headdress and gold band. */
  crown?: boolean;
  /** Arms up in the air, for joy or for surprise. */
  armsUp?: boolean;
  sad?: boolean;
}

export function Person({
  robe = '#5aa9e6',
  robeTrim,
  skin = SKIN,
  hair = '#3d2b1f',
  beard = 'none',
  coat = false,
  crown = false,
  armsUp = false,
  sad = false,
  ...rest
}: PersonProps) {
  const trim = robeTrim ?? robe;

  const stripes: Node[] = [];
  if (coat) {
    coatStripes.forEach((c, i) => {
      stripes.push(
        <Rect
          size={[132, 26]}
          radius={6}
          y={-186 + i * 27}
          fill={c}
        />,
      );
    });
  }

  return (
    <Node {...rest}>
      {/* robe */}
      <Rect
        size={[124, 196]}
        radius={[58, 58, 20, 20]}
        y={-106}
        fill={robe}
        stroke={palette.ink}
        lineWidth={8}
      />
      <Rect size={[124, 28]} radius={12} y={-112} fill={trim} />

      {/* the coat sits over the robe, clipped to its shape */}
      {coat && (
        <Node cache cachePadding={10}>
          <Rect
            size={[132, 200]}
            radius={[60, 60, 22, 22]}
            y={-106}
            fill={'#ffffff'}
          />
          <Node compositeOperation={'source-in'}>{stripes}</Node>
        </Node>
      )}
      {coat && (
        <Rect
          size={[132, 200]}
          radius={[60, 60, 22, 22]}
          y={-106}
          stroke={palette.ink}
          lineWidth={8}
        />
      )}

      {/* arms */}
      <Line
        points={[[0, 0], armsUp ? [-40, -46] : [-44, 34]]}
        position={[-54, -172]}
        stroke={skin}
        lineWidth={28}
        lineCap={'round'}
      />
      <Line
        points={[[0, 0], armsUp ? [40, -46] : [44, 34]]}
        position={[54, -172]}
        stroke={skin}
        lineWidth={28}
        lineCap={'round'}
      />

      {/* head */}
      <Circle size={102} y={-244} fill={skin} stroke={palette.ink} lineWidth={8} />

      {crown ? (
        <>
          {/* nemes headdress */}
          <Line
            points={[
              [-70, -18],
              [70, -18],
              [58, 74],
              [-58, 74],
            ]}
            closed
            radius={14}
            position={[0, -262]}
            fill={palette.lapis}
            stroke={palette.ink}
            lineWidth={8}
          />
          <Rect size={[140, 20]} y={-292} radius={10} fill={palette.sun} />
          <Rect size={[140, 14]} y={-262} radius={7} fill={palette.sun} opacity={0.8} />
          <Circle size={26} y={-306} fill={palette.sun} stroke={palette.ink} lineWidth={6} />
        </>
      ) : (
        <Circle
          size={108}
          y={-262}
          fill={hair}
          startAngle={180}
          endAngle={360}
          closed
        />
      )}

      {/* face */}
      <Circle size={14} position={[-21, -250]} fill={palette.ink} />
      <Circle size={14} position={[21, -250]} fill={palette.ink} />
      <Circle
        size={44}
        y={sad ? -206 : -230}
        stroke={palette.ink}
        lineWidth={8}
        lineCap={'round'}
        startAngle={sad ? 200 : 20}
        endAngle={sad ? 340 : 160}
      />

      {beard !== 'none' && (
        <Rect
          size={beard === 'full' ? [96, 80] : [78, 46]}
          radius={[16, 16, 44, 44]}
          y={beard === 'full' ? -190 : -204}
          fill={beard === 'full' ? palette.cream : hair}
          stroke={palette.ink}
          lineWidth={7}
        />
      )}
    </Node>
  );
}

/** Joseph, young and beardless, with or without the coat. */
export function Joseph({coat = false, ...rest}: {coat?: boolean} & PersonProps) {
  return (
    <Person
      robe={coat ? '#e8ddc8' : '#d8c8a8'}
      hair={'#5b3a1d'}
      coat={coat}
      {...rest}
    />
  );
}

/** Jacob: old, white-bearded, in a deep robe. */
export function Jacob({...rest}: NodeProps) {
  return <Person robe={'#7b5ea7'} robeTrim={'#5f4585'} hair={'#e8e2d4'} beard={'full'} {...rest} />;
}

export function Pharaoh({...rest}: NodeProps) {
  return <Person robe={'#f0e2c0'} robeTrim={palette.sun} crown beard={'short'} hair={'#2b2438'} {...rest} />;
}

/** One of the eleven. The colour is what tells them apart in a crowd. */
export function Brother({
  robe = '#c96a4a',
  ...rest
}: {robe?: PossibleColor} & NodeProps) {
  return <Person robe={robe} beard={'short'} hair={'#3d2b1f'} {...rest} />;
}

export interface CowProps extends NodeProps {
  thin?: boolean;
  color?: PossibleColor;
}

/** Pharaoh's cows: seven fat, then seven that eat them. */
export function Cow({thin = false, color = '#f3e6d0', ...rest}: CowProps) {
  const bodyW = thin ? 172 : 236;
  const bodyH = thin ? 68 : 152;
  const legW = thin ? 16 : 24;
  const spot = thin ? '#cbbba0' : '#a9855c';

  return (
    <Node {...rest}>
      <Rect size={[legW, 62]} radius={legW / 2} position={[-58, -31]} fill={spot} />
      <Rect size={[legW, 62]} radius={legW / 2} position={[52, -31]} fill={spot} />
      <Rect size={[legW, 66]} radius={legW / 2} position={[-24, -33]} fill={color} />
      <Rect size={[legW, 66]} radius={legW / 2} position={[18, -33]} fill={color} />

      <Rect
        size={[bodyW, bodyH]}
        radius={thin ? 34 : 56}
        y={-62 - bodyH / 2}
        fill={color}
        stroke={palette.ink}
        lineWidth={8}
      />
      {thin && (
        <>
          <Rect size={[8, 54]} radius={4} position={[-30, -100]} fill={spot} opacity={0.7} />
          <Rect size={[8, 54]} radius={4} position={[0, -104]} fill={spot} opacity={0.7} />
          <Rect size={[8, 54]} radius={4} position={[30, -100]} fill={spot} opacity={0.7} />
        </>
      )}
      {!thin && (
        <>
          <Circle size={52} position={[-40, -128]} fill={spot} />
          <Circle size={38} position={[26, -104]} fill={spot} />
        </>
      )}

      <Line
        points={[[0, 0], [34, 18]]}
        position={[-bodyW / 2 + 6, -108]}
        stroke={color}
        lineWidth={14}
        lineCap={'round'}
      />

      {/* head */}
      <Circle
        size={thin ? 84 : 96}
        position={[bodyW / 2 - 6, -132]}
        fill={color}
        stroke={palette.ink}
        lineWidth={8}
      />
      <Rect
        size={[46, 34]}
        radius={16}
        position={[bodyW / 2 + 18, -116]}
        fill={'#f0b6b6'}
      />
      <Circle size={13} position={[bodyW / 2 - 18, -150]} fill={palette.ink} />
      <Circle size={13} position={[bodyW / 2 + 14, -150]} fill={palette.ink} />
      <Line
        points={[[0, 0], [-16, -20]]}
        position={[bodyW / 2 - 26, -172]}
        stroke={'#d9c9a8'}
        lineWidth={12}
        lineCap={'round'}
      />
      <Line
        points={[[0, 0], [16, -20]]}
        position={[bodyW / 2 + 12, -172]}
        stroke={'#d9c9a8'}
        lineWidth={12}
        lineCap={'round'}
      />
    </Node>
  );
}

/** A trader's camel, for the road to Egypt. */
export function Camel({...rest}: NodeProps) {
  const coat = '#d5a05a';
  return (
    <Node {...rest}>
      <Rect size={[20, 78]} radius={10} position={[-62, -39]} fill={'#b8813c'} />
      <Rect size={[20, 78]} radius={10} position={[54, -39]} fill={'#b8813c'} />
      <Rect size={[20, 82]} radius={10} position={[-28, -41]} fill={coat} />
      <Rect size={[20, 82]} radius={10} position={[22, -41]} fill={coat} />

      <Rect size={[190, 92]} radius={44} y={-128} fill={coat} stroke={palette.ink} lineWidth={8} />
      <Circle size={86} position={[-34, -178]} fill={coat} stroke={palette.ink} lineWidth={8} />
      <Circle size={78} position={[38, -176]} fill={coat} stroke={palette.ink} lineWidth={8} />

      <Line
        points={[[0, 0], [30, -70], [16, -118]]}
        position={[88, -150]}
        stroke={coat}
        lineWidth={30}
        lineCap={'round'}
        lineJoin={'round'}
      />
      <Circle size={62} position={[104, -272]} fill={coat} stroke={palette.ink} lineWidth={8} />
      <Circle size={11} position={[116, -286]} fill={palette.ink} />
      <Rect size={[70, 40]} radius={16} position={[-20, -206]} fill={palette.terracotta} />
    </Node>
  );
}

/** The coat on its own, for the moment the brothers carry it home. */
export function Coat({...rest}: NodeProps) {
  const stripes: Node[] = [];
  coatStripes.forEach((c, i) => {
    stripes.push(<Rect size={[150, 30]} radius={6} y={-96 + i * 31} fill={c} />);
  });
  return (
    <Node {...rest}>
      <Node cache cachePadding={12}>
        <Rect size={[150, 220]} radius={[64, 64, 24, 24]} fill={'#ffffff'} />
        <Node compositeOperation={'source-in'}>{stripes}</Node>
      </Node>
      <Rect
        size={[150, 220]}
        radius={[64, 64, 24, 24]}
        stroke={palette.ink}
        lineWidth={9}
      />
      <Line points={[[0, 0], [-52, 40]]} position={[-66, -70]} stroke={'#ff924c'} lineWidth={30} lineCap={'round'} />
      <Line points={[[0, 0], [52, 40]]} position={[66, -70]} stroke={'#1982c4'} lineWidth={30} lineCap={'round'} />
    </Node>
  );
}

/** Pharaoh's throne, for the scene where the boy from the well sits down. */
export function Throne({...rest}: NodeProps) {
  return (
    <Node {...rest}>
      <Rect size={[230, 250]} radius={[40, 40, 8, 8]} y={-250} fill={palette.lapis} stroke={palette.ink} lineWidth={9} />
      <Rect size={[280, 46]} radius={16} y={-120} fill={palette.sun} stroke={palette.ink} lineWidth={9} />
      <Rect size={[40, 120]} radius={12} position={[-124, -60]} fill={palette.sun} stroke={palette.ink} lineWidth={8} />
      <Rect size={[40, 120]} radius={12} position={[124, -60]} fill={palette.sun} stroke={palette.ink} lineWidth={8} />
      <Circle size={54} y={-352} fill={palette.sun} stroke={palette.ink} lineWidth={8} {...glow(palette.sun, 30)} />
    </Node>
  );
}
