import PolicyLayout from '@/components/PolicyLayout';
import fs from 'fs';
import path from 'path';

export const metadata = {
  title: 'Refund & Cancellation Policy | Reachly',
  description: 'Reachly Refund, Return, and Cancellation Policy.',
};

export default function RefundPolicyPage() {
  let content = '';
  try {
    const filePath = path.join(process.cwd(), 'public', 'files (5)', 'Reachly-Refund-and-Cancellation-Policy.md');
    content = fs.readFileSync(filePath, 'utf8');
  } catch (err) {
    console.error('Failed to read Refund Policy markdown file:', err);
  }

  return (
    <PolicyLayout
      title="Refund & Cancellation Policy"
      lastUpdated="July 9, 2026"
      markdownContent={content}
    />
  );
}
