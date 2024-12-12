import { showToast } from '.';

const copyToClipboard = async (textToCopy: string): Promise<void> => {
  if (!textToCopy || textToCopy.trim().length === 0) {
    showToast('Cannot copy empty text', 'error');
    return;
  }

  try {
    await navigator.clipboard.writeText(textToCopy);
    showToast('Successfully copied to clipboard', 'success');
  } catch (error) {
    console.error('Error when copying to clipboard:', error);
    showToast('Error when copying to clipboard', 'error');
  }
};

export default copyToClipboard;
