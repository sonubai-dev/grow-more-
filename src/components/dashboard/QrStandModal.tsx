import React from 'react';
import { Copy, Printer } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';

interface QrStandModalProps {
  isOpen: boolean;
  onClose: () => void;
  reviewLink: string;
  copied: boolean;
  onCopyLink: () => void;
}

export const QrStandModal: React.FC<QrStandModalProps> = ({
  isOpen,
  onClose,
  reviewLink,
  copied,
  onCopyLink,
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Printable QR Stand Code"
      description="Display this QR code at checkout counters, tables, or invoices for instant customer scans."
      maxWidth="sm"
    >
      <div className="flex flex-col items-center space-y-6 py-2 text-center">
        <div className="p-4 bg-white rounded-2xl border-2 border-slate-900 shadow-md flex items-center justify-center">
          <img
            src={`https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(reviewLink)}`}
            alt="Review Page QR Code"
            className="w-48 h-48 rounded-lg object-contain"
            loading="lazy"
          />
        </div>

        <div className="text-xs text-slate-600">
          Directs scanner to: <span className="font-mono font-bold text-indigo-600">{reviewLink}</span>
        </div>

        <div className="w-full flex gap-3">
          <Button
            variant="outline"
            className="flex-1 text-xs"
            onClick={onCopyLink}
            leftIcon={<Copy className="w-3.5 h-3.5" />}
          >
            {copied ? 'Review link copied' : 'Copy Review Link'}
          </Button>
          <Button
            variant="primary"
            className="flex-1 text-xs"
            onClick={() => {
              window.print();
            }}
            leftIcon={<Printer className="w-3.5 h-3.5" />}
          >
            Print Stand Kit
          </Button>
        </div>
      </div>
    </Modal>
  );
};
