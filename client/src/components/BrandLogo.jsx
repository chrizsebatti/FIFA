import logo from '../assets/vector/soccer-edathirinji-logo.png';

export default function BrandLogo({ className = '', blend = true }) {
  return (
    <img
      src={logo}
      alt="SOCCER EDATHIRINJI"
      draggable={false}
      className={`select-none object-contain ${blend ? 'mix-blend-screen' : ''} ${className}`}
    />
  );
}
