'use client';

import { useEffect, useState } from 'react';
import { QrCode } from 'lucide-react';

interface BankTransferQRProps {
  amount: number;
  currency: string;
  reference: string;
}

export function BankTransferQR({ amount, currency, reference }: BankTransferQRProps) {
  const [bankInfo, setBankInfo] = useState<{
    bank_name: string;
    bank_iban: string;
    bank_bic: string;
    bank_account_holder: string;
  } | null>(null);
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/checkout/bank-info')
      .then(r => r.json())
      .then(info => {
        setBankInfo(info);
        generateQR(info, amount, currency, reference);
      })
      .catch(() => {});
  }, [amount, currency, reference]);

  async function generateQR(
    info: { bank_iban: string; bank_bic: string; bank_account_holder: string },
    amt: number,
    cur: string,
    ref: string
  ) {
    // EPC QR Code format (EPC069-12)
    const epcData = [
      'BCD',           // Service Tag
      '002',           // Version
      '1',             // Encoding (UTF-8)
      'SCT',           // SEPA Credit Transfer
      info.bank_bic.replace(/"/g, ''),
      info.bank_account_holder.replace(/"/g, ''),
      info.bank_iban.replace(/"/g, '').replace(/\s/g, ''),
      `${cur}${amt.toFixed(2)}`,
      '',              // Purpose
      ref,             // Reference
      '',              // Display text
      '',              // Information
    ].join('\n');

    // Use a simple QR code generation via API
    const encoded = encodeURIComponent(epcData);
    setQrDataUrl(`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encoded}`);
  }

  if (!bankInfo) {
    return (
      <div className="flex flex-col items-center gap-2 py-4">
        <QrCode className="h-12 w-12 text-muted-foreground animate-pulse" />
        <p className="text-xs text-muted-foreground">Loading bank details...</p>
      </div>
    );
  }

  const iban = bankInfo.bank_iban.replace(/"/g, '');
  const holder = bankInfo.bank_account_holder.replace(/"/g, '');
  const bic = bankInfo.bank_bic.replace(/"/g, '');
  const bank = bankInfo.bank_name.replace(/"/g, '');

  return (
    <div className="flex flex-col items-center gap-4">
      {qrDataUrl && (
        <div className="rounded-lg border bg-white p-3">
          <img src={qrDataUrl} alt="Bank Transfer QR Code" className="h-[180px] w-[180px]" />
        </div>
      )}
      <p className="text-xs text-muted-foreground text-center">Scan with your banking app to pay</p>
      <div className="w-full rounded-lg border p-3 space-y-1.5 text-xs">
        <div className="flex justify-between">
          <span className="text-muted-foreground">Bank</span>
          <span className="font-medium">{bank}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Account Holder</span>
          <span className="font-medium">{holder}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">IBAN</span>
          <span className="font-mono font-medium">{iban}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">BIC</span>
          <span className="font-mono font-medium">{bic}</span>
        </div>
      </div>
    </div>
  );
}
