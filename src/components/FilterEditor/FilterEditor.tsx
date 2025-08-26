import {} from 'react';
import type { UserFilterConfig, UserFilterRule } from '../../utils/filters';
import { Button } from '../Button/Button';
import { Space } from '../Space/Space';

import './FilterEditor.less';

type FilterEditorProps = {
  value: UserFilterConfig;
  onChange: (cfg: UserFilterConfig) => void;
};

const matchTypes: UserFilterRule['matchType'][] = ['exact', 'contains', 'wildcard'];

export function FilterEditor({ value, onChange }: FilterEditorProps) {
  const rules = value.rules ?? [];
  const hasRules = (rules?.length ?? 0) > 0;

  const addRule = () => {
    const next: UserFilterRule = { matchType: 'exact', pattern: '', caseSensitive: false };
    onChange({ rules: [...rules, next] });
  };

  const updateRule = (idx: number, patch: Partial<UserFilterRule>) => {
    const next = [...rules];
    next[idx] = { ...next[idx], ...patch } as UserFilterRule;
    onChange({ rules: next });
  };

  const removeRule = (idx: number) => {
    const next = rules.filter((_, i) => i !== idx);
    onChange({ rules: next });
  };

  const clearAll = () => onChange({ rules: [] });

  return (
    <div className="filter-editor">
      {hasRules ? (
        <div className="filter-editor-rules">
          {rules.map((r, idx) => (
            <div
              className="filter-editor-rule"
              key={idx}
              style={{ display: 'grid', gridTemplateColumns: 'repeat(4, auto)', gap: 8, alignItems: 'center' }}
            >
              <select value={r.matchType} onChange={(e) => updateRule(idx, { matchType: e.target.value as UserFilterRule['matchType'] })}>
                {matchTypes.map((mt) => (
                  <option key={mt} value={mt}>
                    {mt}
                  </option>
                ))}
              </select>
              <input
                type="text"
                placeholder="pattern"
                value={r.pattern}
                onChange={(e) => updateRule(idx, { pattern: e.target.value })}
                autoComplete="off"
              />
              <label style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                <input type="checkbox" checked={!!r.caseSensitive} onChange={(e) => updateRule(idx, { caseSensitive: e.target.checked })} />
                Case sensitive
              </label>
              <Button type="secondary" onClick={() => removeRule(idx)}>
                Remove
              </Button>
            </div>
          ))}
        </div>
      ) : (
        <p>No filters defined.</p>
      )}
      <Space>
        <Button type="secondary" onClick={addRule}>
          Add rule
        </Button>
        {hasRules && (
          <Button type="secondary" onClick={clearAll}>
            Clear all
          </Button>
        )}
      </Space>
    </div>
  );
}

export default FilterEditor;
