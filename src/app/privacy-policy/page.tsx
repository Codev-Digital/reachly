import PolicyLayout from '@/components/PolicyLayout';
import fs from 'fs';
import path from 'path';

export const metadata = {
  title: 'Privacy Policy | Reachly',
  description: 'Reachly Privacy Policy explaining data collection and usage.',
};

export default function PrivacyPolicyPage() {
  let content = '';
  try {
    const filePath = path.join(process.cwd(), 'public', 'files (5)', 'Reachly-Privacy-Policy.md');
    content = fs.readFileSync(filePath, 'utf8');
  } catch (err) {
    console.error('Failed to read Privacy Policy markdown file:', err);
  }

  return (
    <PolicyLayout
      title="Privacy Policy"
      lastUpdated="July 9, 2026"
      markdownContent={content}
    />
  );
}
