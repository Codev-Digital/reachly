export interface PaymentReceiptInput {
  id: string;
  creator: {
    name: string;
    username?: string;
  };
  session: string;
  method: string;
  date: string;
  time?: string;
  amount: string;
  status: string;
}

export function escapeHtml(value: string): string {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export function getReceiptFilename(txnId: string): string {
  const safeId = String(txnId || 'transaction')
    .trim()
    .replace(/[^a-zA-Z0-9_-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '') || 'transaction';
  return `reachly-receipt-${safeId}.html`;
}

export function formatPaymentReceiptHtml(
  txn: PaymentReceiptInput,
  payerName?: string
): string {
  const generatedAt = new Date().toLocaleString('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
  const safeId = escapeHtml(txn.id || 'N/A');
  const safePayer = escapeHtml(payerName?.trim() || 'Reachly User');
  const safeCreatorName = escapeHtml(txn.creator?.name || 'Creator');
  const safeCreatorHandle = txn.creator?.username ? escapeHtml(txn.creator.username) : '';
  const safeSession = escapeHtml(txn.session || '1:1 Session');
  const safeMethod = escapeHtml(txn.method || 'N/A');
  const safeDate = escapeHtml(txn.date || 'N/A');
  const safeTime = escapeHtml(txn.time || 'N/A');
  const safeAmount = escapeHtml(txn.amount || 'PKR 0');
  const safeStatus = escapeHtml(txn.status || 'Completed');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Payment Receipt - ${safeId}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background: #f8f8fa; color: #111827; margin: 0; padding: 32px 16px; }
    .card { max-width: 640px; margin: 0 auto; background: #ffffff; border: 1px solid #e5e7eb; border-radius: 16px; padding: 32px; box-shadow: 0 4px 24px rgba(0,0,0,0.05); }
    .header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 1px solid #f3f4f6; padding-bottom: 20px; margin-bottom: 24px; }
    .brand { font-size: 22px; font-weight: 800; color: #0012FF; letter-spacing: -0.02em; }
    .subtitle { font-size: 12px; color: #6b7280; margin-top: 4px; }
    .badge { display: inline-block; padding: 6px 12px; border-radius: 999px; font-size: 12px; font-weight: 700; background: #eef2ff; color: #0012FF; }
    .row { display: flex; justify-content: space-between; gap: 16px; padding: 12px 0; border-bottom: 1px solid #f3f4f6; font-size: 14px; }
    .label { color: #6b7280; font-weight: 500; }
    .value { color: #111827; font-weight: 600; text-align: right; }
    .total { display: flex; justify-content: space-between; align-items: center; margin-top: 20px; padding: 16px; background: #f8faff; border-radius: 12px; }
    .total-label { font-size: 14px; font-weight: 700; color: #374151; }
    .total-amount { font-size: 20px; font-weight: 800; color: #0012FF; }
    .footer { margin-top: 24px; font-size: 12px; color: #9ca3af; text-align: center; }
  </style>
</head>
<body>
  <div class="card">
    <div class="header">
      <div>
        <div class="brand">Reachly</div>
        <div class="subtitle">Official Payment Receipt</div>
      </div>
      <div class="badge">${safeStatus}</div>
    </div>
    <div class="row"><span class="label">Transaction ID</span><span class="value">${safeId}</span></div>
    <div class="row"><span class="label">Billed To</span><span class="value">${safePayer}</span></div>
    <div class="row"><span class="label">Creator</span><span class="value">${safeCreatorName}${safeCreatorHandle ? ` (${safeCreatorHandle})` : ''}</span></div>
    <div class="row"><span class="label">Session</span><span class="value">${safeSession}</span></div>
    <div class="row"><span class="label">Payment Method</span><span class="value">${safeMethod}</span></div>
    <div class="row"><span class="label">Session Date</span><span class="value">${safeDate}</span></div>
    <div class="row"><span class="label">Session Time</span><span class="value">${safeTime}</span></div>
    <div class="total">
      <span class="total-label">Total Amount</span>
      <span class="total-amount">${safeAmount}</span>
    </div>
    <div class="footer">Generated on ${escapeHtml(generatedAt)} &bull; Thank you for using Reachly</div>
  </div>
</body>
</html>`;
}

export function downloadPaymentReceipt(
  txn: PaymentReceiptInput,
  payerName?: string
): void {
  const html = formatPaymentReceiptHtml(txn, payerName);
  const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = getReceiptFilename(txn.id);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
