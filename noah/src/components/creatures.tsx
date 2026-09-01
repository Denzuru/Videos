import {Circle, Line, Node, NodeProps, Rect} from '@revideo/2d';
import {PossibleColor} from '@revideo/core';
import {palette} from '../theme';

/**
 * Every creature is drawn standing on y = 0 and facing right, so a scene can
 * drop one onto a ground line by setting its y and nothing else.
 */

function Leg({x = 0, h = 50, w = 22, color = '#888'}) {
  return (
    <Rect size={[w, h]} radius={w / 2} position={[x, -h / 2]} fill={color} />
  );
}

function Eye({x = 0, y = 0, size = 14}) {
  return <Circle size={size} position={[x, y]} fill={palette.ink} />;
}

export function Elephant({...rest}: NodeProps) {
  const grey = '#9aa4c8';
  const greyDark = '#7d87ad';
  return (
    <Node {...rest}>
      <Leg x={-60} h={54} w={30} color={greyDark} />
      <Leg x={50} h={54} w={30} color={greyDark} />
      <Leg x={-25} h={58} w={30} color={grey} />
      <Leg x={15} h={58} w={30} color={grey} />
      <Rect size={[200, 120]} radius={58} y={-108} fill={grey} />
      <Line
        points={[[0, 0], [24, 48], [10, 92]]}
        position={[126, -128]}
        stroke={grey}
        lineWidth={26}
        lineCap={'round'}
        lineJoin={'round'}
      />
      <Circle size={112} position={[92, -142]} fill={grey} />
      <Circle size={86} position={[64, -152]} fill={greyDark} />
      <Eye x={110} y={-158} />
      <Rect size={[34, 12]} radius={6} position={[132, -108]} rotation={20} fill={palette.cream} />
      <Line
        points={[[0, 0], [-34, -16]]}
        position={[-98, -140]}
        stroke={greyDark}
        lineWidth={12}
        lineCap={'round'}
      />
    </Node>
  );
}

export function Giraffe({...rest}: NodeProps) {
  const coat = '#ffca3a';
  const spot = '#c97b18';
  return (
    <Node {...rest}>
      <Leg x={-52} h={86} w={20} color={spot} />
      <Leg x={44} h={86} w={20} color={spot} />
      <Leg x={-24} h={90} w={20} color={coat} />
      <Leg x={16} h={90} w={20} color={coat} />
      <Rect size={[150, 92]} radius={44} y={-130} fill={coat} />
      <Circle size={26} position={[-30, -140]} fill={spot} />
      <Circle size={22} position={[16, -122]} fill={spot} />
      <Rect size={[44, 190]} radius={22} position={[62, -250]} rotation={8} fill={coat} />
      <Circle size={20} position={[70, -250]} fill={spot} />
      <Rect size={[92, 62]} radius={28} position={[92, -352]} fill={coat} />
      <Eye x={104} y={-364} size={12} />
      <Circle size={12} position={[122, -340]} fill={spot} />
      <Line points={[[0, 0], [-4, -26]]} position={[74, -378]} stroke={spot} lineWidth={10} lineCap={'round'} />
      <Line points={[[0, 0], [6, -26]]} position={[100, -380]} stroke={spot} lineWidth={10} lineCap={'round'} />
    </Node>
  );
}

export function Lion({...rest}: NodeProps) {
  const coat = '#ff9f1c';
  const mane = '#d8480b';
  return (
    <Node {...rest}>
      <Leg x={-58} h={52} w={26} color={mane} />
      <Leg x={44} h={52} w={26} color={mane} />
      <Leg x={-26} h={56} w={26} color={coat} />
      <Leg x={12} h={56} w={26} color={coat} />
      <Rect size={[170, 100]} radius={48} y={-100} fill={coat} />
      <Line
        points={[[0, 0], [-40, -14], [-52, -54]]}
        position={[-84, -128]}
        stroke={coat}
        lineWidth={14}
        lineCap={'round'}
        lineJoin={'round'}
      />
      <Circle size={34} position={[-138, -186]} fill={mane} />
      <Circle size={152} position={[80, -136]} fill={mane} />
      <Circle size={106} position={[86, -136]} fill={coat} />
      <Eye x={64} y={-150} size={13} />
      <Eye x={110} y={-150} size={13} />
      <Circle size={22} position={[88, -122]} fill={palette.ink} />
      <Circle
        size={44}
        position={[88, -124]}
        stroke={palette.ink}
        lineWidth={7}
        lineCap={'round'}
        startAngle={20}
        endAngle={160}
      />
    </Node>
  );
}

export function Zebra({...rest}: NodeProps) {
  const coat = palette.cream;
  const stripe = '#2b2438';
  return (
    <Node {...rest}>
      <Leg x={-54} h={70} w={22} color={stripe} />
      <Leg x={46} h={70} w={22} color={stripe} />
      <Leg x={-24} h={74} w={22} color={coat} />
      <Leg x={16} h={74} w={22} color={coat} />
      <Rect size={[168, 96]} radius={44} y={-118} fill={coat} />
      <Rect size={[14, 74]} radius={7} position={[-46, -120]} fill={stripe} />
      <Rect size={[14, 84]} radius={7} position={[-10, -118]} fill={stripe} />
      <Rect size={[14, 76]} radius={7} position={[26, -120]} fill={stripe} />
      <Rect size={[44, 96]} radius={22} position={[70, -196]} rotation={14} fill={coat} />
      <Rect size={[86, 56]} radius={26} position={[96, -244]} fill={coat} />
      <Rect size={[12, 40]} radius={6} position={[74, -248]} fill={stripe} />
      <Eye x={104} y={-256} size={12} />
      <Line points={[[0, 0], [-6, -30]]} position={[62, -234]} stroke={stripe} lineWidth={12} lineCap={'round'} />
      <Line points={[[0, 0], [-30, 10]]} position={[-86, -150]} stroke={stripe} lineWidth={12} lineCap={'round'} />
    </Node>
  );
}

export function Monkey({...rest}: NodeProps) {
  const coat = '#a9703f';
  const face = '#e6bb8a';
  return (
    <Node {...rest}>
      <Leg x={-24} h={40} w={20} color={coat} />
      <Leg x={20} h={40} w={20} color={coat} />
      <Rect size={[96, 96]} radius={40} y={-84} fill={coat} />
      <Rect size={[70, 40]} radius={20} y={-76} fill={face} />
      <Line
        points={[[0, 0], [-42, -10], [-54, -52], [-24, -60]]}
        position={[-46, -96]}
        stroke={coat}
        lineWidth={13}
        lineCap={'round'}
        lineJoin={'round'}
      />
      <Circle size={94} y={-166} fill={coat} />
      <Circle size={44} position={[-48, -166]} fill={coat} />
      <Circle size={44} position={[48, -166]} fill={coat} />
      <Circle size={66} y={-158} fill={face} />
      <Eye x={-17} y={-180} size={13} />
      <Eye x={17} y={-180} size={13} />
      <Circle
        size={34}
        y={-158}
        stroke={palette.ink}
        lineWidth={7}
        lineCap={'round'}
        startAngle={20}
        endAngle={160}
      />
    </Node>
  );
}

export function Bird({
  color = palette.coral,
  ...rest
}: {color?: PossibleColor} & NodeProps) {
  return (
    <Node {...rest}>
      <Rect size={[104, 76]} radius={38} y={-52} fill={color} />
      <Circle size={62} position={[38, -84]} fill={color} />
      <Line points={[[0, 0], [30, 8], [0, 16]]} closed position={[62, -92]} fill={palette.sun} />
      <Eye x={46} y={-92} size={11} />
      <Circle size={54} position={[-10, -52]} fill={palette.white} opacity={0.55} />
      <Line points={[[0, 0], [-38, -22]]} position={[-42, -46]} stroke={color} lineWidth={14} lineCap={'round'} />
      <Leg x={-8} h={18} w={9} color={palette.sunDeep} />
      <Leg x={18} h={18} w={9} color={palette.sunDeep} />
    </Node>
  );
}

export function Turtle({...rest}: NodeProps) {
  const shell = '#3a9e2f';
  const shellDark = '#26761f';
  const skin = '#8ac926';
  return (
    <Node {...rest}>
      <Leg x={-46} h={24} w={22} color={skin} />
      <Leg x={34} h={24} w={22} color={skin} />
      <Circle size={78} position={[62, -40]} fill={skin} />
      <Eye x={78} y={-50} size={11} />
      <Circle size={190} y={-24} fill={shell} startAngle={180} endAngle={360} closed />
      <Circle size={44} position={[-42, -44]} fill={shellDark} />
      <Circle size={44} position={[6, -64]} fill={shellDark} />
      <Circle size={40} position={[46, -40]} fill={shellDark} />
      <Line points={[[0, 0], [-30, 6]]} position={[-92, -28]} stroke={skin} lineWidth={14} lineCap={'round'} />
    </Node>
  );
}

/** Noah: a cheerful old man in a robe, with a very large beard. */
export function Noah({...rest}: NodeProps) {
  const robe = '#5aa9e6';
  const robeDark = '#3f86bf';
  const skin = '#f2c391';
  return (
    <Node {...rest}>
      <Rect size={[120, 190]} radius={[56, 56, 20, 20]} y={-104} fill={robe} />
      <Rect size={[120, 30]} radius={12} y={-108} fill={robeDark} />
      <Line points={[[0, 0], [-46, -30]]} position={[-52, -168]} stroke={robe} lineWidth={30} lineCap={'round'} />
      <Line points={[[0, 0], [46, -30]]} position={[52, -168]} stroke={robe} lineWidth={30} lineCap={'round'} />
      <Circle size={100} y={-238} fill={skin} />
      <Circle size={104} y={-256} fill={palette.cream} startAngle={180} endAngle={360} closed />
      <Eye x={-19} y={-242} size={13} />
      <Eye x={19} y={-242} size={13} />
      <Rect size={[92, 74]} radius={[20, 20, 44, 44]} y={-186} fill={palette.cream} />
      <Circle
        size={40}
        y={-224}
        stroke={palette.ink}
        lineWidth={7}
        lineCap={'round'}
        startAngle={20}
        endAngle={160}
      />
    </Node>
  );
}
