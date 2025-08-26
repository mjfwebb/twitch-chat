import { Button } from '../Button/Button';

import './ColorPicker.less';

interface ColorPickerProps {
  id: string;
  onChange: (color: string) => void;
  value: string;
  placeholder: string;
  setToDefault: () => void;
  canSetToTransparent?: boolean;
}

export const ColorPicker = ({ id, onChange, value, placeholder, setToDefault, canSetToTransparent = false }: ColorPickerProps) => {
  return (
    <div className="color-picker">
      <label htmlFor={id}>{value}</label>
      <input
        style={{ height: '40px' }}
        id={id}
        type="color"
        value={value === 'transparent' ? '#000000' : value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
      />
      <div className="color-picker-footer">
        <Button type="secondary" onClick={setToDefault}>
          Reset to default
        </Button>
        {canSetToTransparent && (
          <Button type="secondary" onClick={() => onChange('transparent')}>
            Set to transparent
          </Button>
        )}
      </div>
    </div>
  );
};
