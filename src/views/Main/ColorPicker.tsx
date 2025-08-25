interface ColorPickerProps {
  id: string;
  onChange: (color: string) => void;
  value: string;
  placeholder: string;
  setToDefault: () => void;
}

export const ColorPicker = ({ id, onChange, value, placeholder, setToDefault }: ColorPickerProps) => {
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
      <button className="button button-secondary" onClick={setToDefault}>
        Reset to default
      </button>
    </div>
  );
};
