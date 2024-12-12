import toast from 'react-hot-toast';


const showToast = (message, type) => {
  if (!['success', 'error', 'loading'].includes(type)) {
    throw new Error(`Unsupported notification type: ${type}`);
  }

  toast[type](message, {
    duration: 3000,
    position: 'bottom-center',
  });
};

export default showToast;
