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
      <input style={{ height: '40px' }} id={id} type="color" value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} />
      <button className="button button-secondary" onClick={setToDefault}>
        Set to default
      </button>
    </div>
  );
};
