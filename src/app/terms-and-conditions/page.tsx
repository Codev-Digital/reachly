import PolicyLayout from '@/components/PolicyLayout';
import fs from 'fs';
import path from 'path';

export const metadata = {
  title: 'Terms and Conditions | Reachly',
  description: 'Terms and Conditions governing access and use of Reachly platform.',
};

export default function TermsAndConditionsPage() {
  let content = '';
  try {
    const filePath = path.join(process.cwd(), 'public', 'files (5)', 'Reachly-Terms-and-Conditions.md');
    content = fs.readFileSync(filePath, 'utf8');
  } catch (err) {
    console.error('Failed to read Terms and Conditions markdown file:', err);
  }

  return (
    <PolicyLayout
      title="Terms and Conditions"
      lastUpdated="July 9, 2026"
      markdownContent={content}
    />
  );
}
