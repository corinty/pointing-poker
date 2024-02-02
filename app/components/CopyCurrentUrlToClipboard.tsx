import {useState} from 'react';

export default function CopyCurrentUrlToClipboard() {
  const [copiedSuccessfully, setCopiedSuccessfully] = useState(false);
  const [copiedUnsuccessfully, setCopiedUnsuccessfully] = useState(false);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(window.location.href).then(
      () => {
        setCopiedSuccessfully(true);
        setTimeout(() => setCopiedSuccessfully(false), 3000);
      },
      () => {
        setCopiedUnsuccessfully(true);
        setTimeout(() => setCopiedUnsuccessfully(false), 3000);
      },
    );
  };

  return (
    <div>
      <div onClick={copyToClipboard} style={{cursor: 'pointer'}}>
        🔗 Share room link
      </div>
      <div style={{fontSize: '80%', fontWeight: 'lighter'}}>
        {copiedSuccessfully && (
          <div style={{paddingTop: '1em', paddingLeft: '1em'}}>
            Copied link to clipboard!
          </div>
        )}
        {copiedUnsuccessfully && (
          <div style={{paddingTop: '1em', paddingLeft: '1em'}}>
            Failed to copy link to clipboard
          </div>
        )}
      </div>
    </div>
  );
}
