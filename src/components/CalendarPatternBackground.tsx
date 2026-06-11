import { useMemo } from 'react';
import { StyleSheet, useWindowDimensions } from 'react-native';
import Svg, { Rect } from 'react-native-svg';

const BRICK_WIDTH = 52;
const BRICK_HEIGHT = 22;

type CalendarPatternBackgroundProps = {
  backgroundOpacity?: number;
  brickFillOpacity?: number;
  brickStrokeOpacity?: number;
};

export function CalendarPatternBackground({
  backgroundOpacity = 0.52,
  brickFillOpacity = 0.01,
  brickStrokeOpacity = 0.12,
}: CalendarPatternBackgroundProps) {
  const { height, width } = useWindowDimensions();
  const bricks = useMemo(() => {
    const columns = Math.ceil(width / BRICK_WIDTH) + 3;
    const rows = Math.ceil(height / BRICK_HEIGHT) + 2;

    return Array.from({ length: rows * columns }, (_, index) => {
      const row = Math.floor(index / columns);
      const column = index % columns;
      const offset = row % 2 === 0 ? 0 : -BRICK_WIDTH / 2;

      return {
        key: `${row}-${column}`,
        x: column * BRICK_WIDTH + offset,
        y: row * BRICK_HEIGHT,
      };
    });
  }, [height, width]);

  return (
    <Svg height={height} pointerEvents="none" style={StyleSheet.absoluteFill} width={width}>
      <Rect fill="#fdba74" fillOpacity={backgroundOpacity} height={height} width={width} />
      {bricks.map((brick) => (
        <Rect
          fill="#c2410c"
          fillOpacity={brickFillOpacity}
          height={BRICK_HEIGHT}
          key={brick.key}
          stroke="#c2410c"
          strokeOpacity={brickStrokeOpacity}
          strokeWidth={1.2}
          width={BRICK_WIDTH}
          x={brick.x}
          y={brick.y}
        />
      ))}
    </Svg>
  );
}
