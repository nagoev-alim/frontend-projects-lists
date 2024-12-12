import { FaRegCheckCircle } from 'react-icons/fa';
import { IoMdClose } from 'react-icons/io';
import { FiAlertCircle, FiAlertTriangle } from 'react-icons/fi';
import React from 'react';

const TOAST_CONFIG = {
  types: {
    success: {
      icon: <FaRegCheckCircle />,
      text: 'Success: This is a success toast.',
      color: 'rgb(10, 191, 48)',
      type: 'primary',
    },
    error: {
      icon: <IoMdClose />,
      text: 'Error: This is an error toast.',
      color: 'rgb(226, 77, 76)',
      type: 'danger',
    },
    warning: {
      icon: <FiAlertTriangle />,
      text: 'Warning: This is a warning toast.',
      color: 'rgb(233, 189, 12)',
      type: 'secondary',
    },
    info: {
      icon: <FiAlertCircle />,
      text: 'Info: This is an information toast.',
      color: 'rgb(52, 152, 219)',
      type: 'outline',
    },
  },
  time: 5000,
};

export default TOAST_CONFIG;
