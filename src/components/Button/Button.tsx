import './Button.less';

interface ButtonProps {
  className?: string;
  onClick?: () => void;
  children: React.ReactNode;
  type: 'primary' | 'secondary' | 'ghost';
}

export const Button = (props: ButtonProps) => {
  return (
    <button className={`button ${props.className} button-${props.type}`} onClick={props.onClick}>
      {props.children}
    </button>
  );
};
