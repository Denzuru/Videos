import {Circle, Line, Node, NodeProps, Rect} from '@revideo/2d';
import {Reference} from '@revideo/core';
import {palette} from '../theme';

export interface ArkProps extends NodeProps {
  doorRef?: Reference<Rect>;
}

/**
 * The ark, drawn with its origin at the waterline so a scene can bob it by
 * tweening y alone. The door is exposed through `doorRef` so the loading
 * scene can swing it shut.
 */
export function Ark({doorRef, ...rest}: ArkProps) {
  return (
    <Node {...rest}>
      {/* hull */}
      <Line
        points={[
          [-380, -96],
          [380, -96],
          [292, 86],
          [-292, 86],
        ]}
        closed
        radius={26}
        fill={palette.wood}
        stroke={palette.woodDark}
        lineWidth={10}
      />
      <Rect size={[742, 30]} radius={15} y={-84} fill={palette.woodDeep} />
      <Rect size={[600, 16]} radius={8} y={-16} fill={palette.woodDeep} opacity={0.7} />
      <Rect size={[520, 16]} radius={8} y={38} fill={palette.woodDeep} opacity={0.5} />

      {/* cabin */}
      <Rect
        size={[430, 156]}
        radius={22}
        y={-180}
        fill={palette.woodDeep}
        stroke={palette.woodDark}
        lineWidth={10}
      />
      <Circle size={64} position={[-140, -190]} fill={palette.skyPale} stroke={palette.woodDark} lineWidth={8} />
      <Circle size={64} position={[140, -190]} fill={palette.skyPale} stroke={palette.woodDark} lineWidth={8} />

      {/* roof */}
      <Line
        points={[
          [-250, 0],
          [250, 0],
          [0, -104],
        ]}
        closed
        radius={14}
        y={-256}
        fill={palette.coral}
        stroke={palette.woodDark}
        lineWidth={10}
      />

      {/* The door is hinged on its left edge, so scaling x from 0 to 1 swings
          it shut across the opening. */}
      <Rect
        size={[132, 150]}
        radius={[66, 66, 10, 10]}
        position={[0, -175]}
        fill={'#4a2a0c'}
      />
      <Rect
        ref={doorRef}
        size={[132, 150]}
        radius={[66, 66, 10, 10]}
        position={[-66, -175]}
        offset={[-1, 0]}
        fill={palette.woodDark}
        stroke={palette.woodDeep}
        lineWidth={8}
        scale={[0, 1]}
      />
    </Node>
  );
}
