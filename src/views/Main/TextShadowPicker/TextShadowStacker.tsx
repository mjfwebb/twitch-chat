import React, { useCallback, useEffect, useMemo, useState } from 'react';

import { styled } from 'styled-components';

import { TextShadowPicker } from './TextShadowPicker';

const StackWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  align-items: center;
`;

const Row = styled.div`
  display: flex;
  gap: 8px;
  align-items: flex-start;
`;

const ShadowCard = styled.div`
  border: 1px solid #3a3a3a;
  border-radius: 6px;
  overflow: hidden;
  background: #1f1f1f;
`;

const CardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #262626;
  padding: 6px 8px;
  font-size: 12px;
  color: #c7cbd1;
`;

const CardActions = styled.div`
  display: flex;
  gap: 6px;
  & > button {
    background: #333;
    color: #ddd;
    border: 1px solid #444;
    border-radius: 4px;
    padding: 2px 8px;
    cursor: pointer;
  }
  & > button:hover {
    background: #3a3a3a;
  }
`;

const FooterActions = styled.div`
  display: flex;
  justify-content: flex-start;
  margin-top: 8px;
`;

export interface TextShadowStackerProps {
  value?: string; // comma-separated text-shadow string
  onChange: (value: string) => void;
  className?: string;
}

const splitShadows = (value?: string): string[] => {
  if (!value) {
    return [];
  }
  return value
    .split(/\s*,\s*/)
    .map((s) => s.trim())
    .filter(Boolean);
};

const joinShadows = (values: string[]) => values.join(', ');

const DEFAULT_SHADOW = '1px 1px 2px #000000ff';

export const TextShadowStacker: React.FC<TextShadowStackerProps> = ({ value, onChange, className }) => {
  const initial = useMemo(() => splitShadows(value), [value]);
  const [shadows, setShadows] = useState<string[]>(initial.length ? initial : [DEFAULT_SHADOW]);

  // Keep local state in sync if parent value changes externally
  useEffect(() => {
    const next = splitShadows(value);
    const joinedNext = joinShadows(next.length ? next : [DEFAULT_SHADOW]);
    const joinedCurrent = joinShadows(shadows);
    if (joinedNext !== joinedCurrent) {
      setShadows(next.length ? next : [DEFAULT_SHADOW]);
    }
  }, [value, shadows]);

  // Emit changes to parent only for user-driven updates, not during sync from parent

  const updateAt = useCallback(
    (idx: number, v: string) => {
      setShadows((prev) => {
        const next = prev.map((s, i) => (i === idx ? v : s));
        onChange(joinShadows(next));
        return next;
      });
    },
    [setShadows, onChange],
  );

  const removeAt = useCallback(
    (idx: number) => {
      setShadows((prev) => {
        const next = prev.filter((_, i) => i !== idx);
        const finalNext = next.length ? next : [DEFAULT_SHADOW];
        onChange(joinShadows(finalNext));
        return finalNext;
      });
    },
    [onChange],
  );

  const addNew = useCallback(() => {
    setShadows((prev) => {
      const next = [...prev, DEFAULT_SHADOW];
      onChange(joinShadows(next));
      return next;
    });
  }, [onChange]);

  const move = useCallback(
    (idx: number, delta: number) => {
      setShadows((prev) => {
        const next = [...prev];
        const newIndex = idx + delta;
        if (newIndex < 0 || newIndex >= next.length) return prev;
        const [item] = next.splice(idx, 1);
        next.splice(newIndex, 0, item);
        onChange(joinShadows(next));
        return next;
      });
    },
    [onChange],
  );

  return (
    <StackWrapper className={className}>
      {shadows.map((s, idx) => (
        <ShadowCard key={idx}>
          <CardHeader>
            {shadows.length > 1 && (
              <CardActions>
                <button type="button" onClick={() => move(idx, -1)} disabled={idx === 0} title="Move up">
                  ↑
                </button>
                <button type="button" onClick={() => move(idx, 1)} disabled={idx === shadows.length - 1} title="Move down">
                  ↓
                </button>
                <button type="button" onClick={() => removeAt(idx)} title="Remove">
                  Remove
                </button>
              </CardActions>
            )}
          </CardHeader>
          <TextShadowPicker value={s} onChange={(v) => updateAt(idx, v)} />
        </ShadowCard>
      ))}

      <Row>
        <FooterActions>
          <button className="button button-secondary" type="button" onClick={addNew}>
            + Add shadow
          </button>
        </FooterActions>
      </Row>
    </StackWrapper>
  );
};
