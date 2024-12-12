import { square } from 'ldrs';
import { useTheme } from '@/components/layout/ThemeProvider.tsx';

square.register();

interface SpinnerProps {
  size?: number;
  stroke?: number;
  strokeLength?: number;
  bgOpacity?: number;
  speed?: number;
}

const Spinner = ({
                   size = 35,
                   stroke = 5,
                   strokeLength = 0.25,
                   bgOpacity = 0.1,
                   speed = 1.2,
                 }: SpinnerProps) => {
  const { theme } = useTheme();
  const themeColor = theme === 'dark' ? 'white' : 'black';

  return (
    <div className="p-4 flex justify-center" aria-live="polite" aria-busy={true}>
      <l-square
        size={size}
        stroke={stroke}
        stroke-length={strokeLength}
        bg-opacity={bgOpacity}
        speed={speed}
        color={themeColor}
      />
    </div>
  );
};

export default Spinner;
