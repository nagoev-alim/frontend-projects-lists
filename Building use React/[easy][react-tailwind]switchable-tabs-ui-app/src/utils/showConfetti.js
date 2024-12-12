import confetti from 'canvas-confetti';
import { getRandomNumber } from '@utils';

/**
 * Отображает эффект конфетти на экране.
 * Использует случайные значения для угла, разброса и количества частиц.
 */
const showConfetti = () => {
  const confettiOptions = {
    angle: getRandomNumber(55, 125),
    spread: getRandomNumber(50, 70),
    particleCount: getRandomNumber(50, 100),
    origin: { y: 0.6 },
  };

  confetti(confettiOptions);
};

export default showConfetti;
