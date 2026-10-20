'use client';

import CreatorDashboardNav from '@/components/CreatorDashboardNav';
import MyPackages from '@/components/MyPackages';

// Creators can buy packages from other creators too
export default function CreatorPackagesPage() {
  return <MyPackages nav={<CreatorDashboardNav profilePhoto={null} displayName="" />} />;
}
