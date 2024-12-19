import toast, { Toast } from 'react-hot-toast';

type ToastType = 'success' | 'error' | 'loading';

interface ToastOptions {
  duration?: number;
  position?: Toast['position'];
}

const showToast = (
  message: string,
  type: ToastType,
  options: ToastOptions = {},
) => {
  const { duration = 3000, position = 'bottom-center' } = options;
  toast[type](message, {
    duration,
    position
  })
};

export default showToast;
