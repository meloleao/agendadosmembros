import React, { useState } from 'react';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  textToShare: string;
}

const ShareModal: React.FC<ShareModalProps> = ({ isOpen, onClose, title, textToShare }) => {
  const [copySuccess, setCopySuccess] = useState('');

  const handleCopyToClipboard = () => {
    navigator.clipboard.writeText(textToShare).then(() => {
      setCopySuccess('Texto copiado para a área de transferência!');
      setTimeout(() => setCopySuccess(''), 2000);
    }, (err) => {
      setCopySuccess('Falha ao copiar o texto.');
      console.error('Could not copy text: ', err);
    });
  };
  
  const handleShareOnWhatsApp = () => {
    const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(textToShare)}`;
    window.open(whatsappUrl, '_blank');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
      <div className="bg-white rounded-lg shadow-2xl p-6 w-full max-w-lg">
        <div className="flex justify-between items-center mb-4 border-b pb-3">
          <h2 className="text-xl font-bold text-tce-pi-green">{title}</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-800 text-2xl">&times;</button>
        </div>
        
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            Abaixo está um resumo para você compartilhar.
          </p>
          <div className="bg-gray-100 p-4 rounded-md border border-gray-200 max-h-[40vh] overflow-y-auto">
            <pre className="whitespace-pre-wrap text-gray-800 text-sm font-sans">{textToShare}</pre>
          </div>
          
          {copySuccess && <p className="text-sm text-green-600 text-center">{copySuccess}</p>}

          <div className="pt-4 flex flex-col sm:flex-row justify-end gap-3 border-t mt-6">
             <button 
              type="button" 
              onClick={onClose} 
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 order-last sm:order-first"
            >
              Fechar
            </button>
            <button 
              type="button" 
              onClick={handleCopyToClipboard} 
              className="px-4 py-2 bg-tce-pi-blue text-white rounded-md hover:bg-opacity-90"
            >
              Copiar Texto
            </button>
            <button
              type="button"
              onClick={handleShareOnWhatsApp}
              className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 flex items-center justify-center gap-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path d="M10.523 1.482C5.068 1.482 1.482 5.068 1.482 10.523c0 1.903.54 3.69 1.488 5.257L1.482 18.518l2.788-1.48c1.51.892 3.25.142 5.253.142h.002c5.455 0 9.04-4.585 9.04-9.04s-4.585-9.04-9.04-9.04zm4.24 6.704c-.197-.393-.393-.59-.785-.59-.295 0-.59.196-.786.393-.196.196-.885.885-1.08 1.08-.196.196-.393.295-.59.196-.785-.295-1.372-.59-1.96-1.178-.983-1.08-1.57-2.16-1.767-2.553-.196-.393-.196-.59 0-.786.196-.196.393-.393.59-.59.196-.196.295-.393.393-.59.196-.196 0-.393-.196-.785l-1.178-2.75c-.196-.59-.393-.785-.786-.785-.295 0-.59 0-.785.196s-.885.885-1.08 1.08c-.196.196-.393.393-.59.59-.196.196-.393.393-.393.785 0 .393.196.785.393 1.178.196.393.885 1.768 2.16 3.142 1.668 1.668 3.142 2.75 4.91 3.535.59.295 1.178.49 1.768.59.59.196 1.178 0 1.57-.196.393-.196.885-.885 1.08-1.08.196-.196.393-.393.59-.59.196-.196.196-.393 0-.59l-1.178-2.75z" />
              </svg>
              WhatsApp
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShareModal;
