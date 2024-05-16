import toast from 'react-hot-toast';

export default function CopyCurrentUrlToClipboard() {
  
  const copyToClipboard = () => {
    navigator.clipboard.writeText(window.location.href).then(
      () => {
        toast('🔗 Room link copied!! 📋');
      },
      () => {
        toast('Error copying room link');
      },
    );
  };

  return (
    <button onClick={copyToClipboard} className="m-0">
      🔗 Share room link
    </button>
  );
}
