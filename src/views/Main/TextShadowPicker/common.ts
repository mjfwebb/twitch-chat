import { useEffect, useState } from 'react';

import type { TextShadowPickerParams } from './types';

export const unitRegex = /(-?\d*(?:\.\d+)?)(r?em|px|%)$/;

export const parseShadowString = (value: string): TextShadowPickerParams => {
  // We need to split by spaces, but keep rgb()/rgba() intact
  const parts: string[] = [];
  let depth = 0;
  let token = '';
  for (let i = 0; i < value.length; i++) {
    const ch = value[i];
    if (ch === '(') depth++;
    if (ch === ')') depth = Math.max(0, depth - 1);
    if (ch === ' ' && depth === 0) {
      if (token) {
        parts.push(token);
        token = '';
      }
      continue;
    }
    token += ch;
  }
  if (token) parts.push(token);

  // Typical order: x y blur color OR color x y blur. Accept either by detecting color token
  const isColor = (s?: string) => !!s && (/^#([0-9a-f]{6}|[0-9a-f]{8})$/i.test(s) || /^rgba?\(/i.test(s));

  let x = parts[0];
  let y = parts[1];
  let blur = parts[2];
  let color = parts[3];

  if (isColor(parts[0])) {
    // color-first
    color = parts[0];
    x = parts[1];
    y = parts[2];
    blur = parts[3];
  }

  return { offset: { x, y }, color, blur };
};

export const buildShadowString = (params: TextShadowPickerParams): string => {
  const values = [params.offset?.x || '0', params.offset?.y || '0', params.blur, params.color || '#000000'].filter((p) => !!p);
  return values.join(' ');
};

export const parseHexColor = (value: string): { color: string; alpha: number } | null => {
  const match = value.match(/#(?<hex>[0-9A-F]{6,8})/i);
  const hex = match?.groups?.hex;
  if (hex) {
    let alpha = 255;
    if (hex.length === 8) {
      alpha = parseInt(hex.substring(6, 8), 16);
    }
    return { alpha, color: '#' + hex.substring(0, 6) };
  }
  return null;
};

export const parseRgbColor = (value: string): { color: string; alpha: number } | null => {
  const m = value.match(/^rgba?\(\s*(?<r>\d{1,3})\s*,\s*(?<g>\d{1,3})\s*,\s*(?<b>\d{1,3})(?:\s*,\s*(?<a>\d*\.\d+|\d+))?\s*\)$/i);
  if (!m || !m.groups) return null;
  const r = Math.max(0, Math.min(255, parseInt(m.groups.r)));
  const g = Math.max(0, Math.min(255, parseInt(m.groups.g)));
  const b = Math.max(0, Math.min(255, parseInt(m.groups.b)));
  let a = 1;
  if (m.groups.a != null) {
    const av = parseFloat(m.groups.a);
    // If provided as 0-1, scale to 255. If >1 assume already 0-255 and clamp
    a = av <= 1 ? av : Math.min(255, Math.max(0, av)) / 255;
  }
  const toHex = (n: number) => n.toString(16).padStart(2, '0');
  const color = `#${toHex(r)}${toHex(g)}${toHex(b)}`;
  const alpha = Math.round(a * 255);
  return { color, alpha };
};

export const useUnitValue = (value: string) => {
  const [amount, setAmount] = useState(0);
  const [unit, setUnit] = useState('px');

  useEffect(() => {
    const matches = value.match(unitRegex);

    if (matches?.length === 3) {
      setAmount(parseFloat(matches[1]));
      setUnit(matches[2]);
    }
  }, [value]);

  return { unit, amount, setUnit, setAmount };
};
