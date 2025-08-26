import { styled } from 'styled-components';

import { useUnitValue } from '../common';
import { Label } from '../inputs/Label';
import { OffsetGrid } from '../inputs/OffsetGrid';
import { TextShadowInput } from '../inputs/TextShadowInput';
import { TextShadowPickerParams } from '../types';

const Wrapper = styled.div`
  flex: 3;
  display: flex;
`;

const Inputs = styled.div`
  display: grid;
  grid-template-rows: repeat(3, 1fr);
  flex: 2;
`;

const Row = styled.div`
  grid-column: 2 / span 2;
  display: flex;
  align-items: center;
`;

const Grid = styled.div`
  flex: 2;
`;

interface Props {
  value: TextShadowPickerParams['offset'];
  onChange: (value: TextShadowPickerParams['offset']) => void;
}

export const OffsetField = ({ value, onChange }: Props) => {
  const { amount: xAmount, unit: xUnit } = useUnitValue(value.x);
  const { amount: yAmount, unit: yUnit } = useUnitValue(value.y);

  const gridChangeHandler = ({ x, y }: { x: number; y: number }) => {
    onChange({ x: ~~x + xUnit, y: ~~y + yUnit });
  };

  const inputChangeHandler = (axis: 'x' | 'y') => (val: string) => {
    onChange({ ...value, [axis]: val });
  };

  return (
    <Wrapper>
      <Inputs>
        <Row>
          <Label>X Offset</Label>
          <TextShadowInput value={value.x} onChange={inputChangeHandler('x')} />
        </Row>
        <Row>
          <Label>Y Offset</Label>
          <TextShadowInput value={value.y} onChange={inputChangeHandler('y')} />
        </Row>
      </Inputs>

      <Grid>
        <OffsetGrid offset={{ x: xAmount, y: yAmount }} onChange={gridChangeHandler} />
      </Grid>
    </Wrapper>
  );
};
