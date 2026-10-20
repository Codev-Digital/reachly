'use client';

import UserNavbar from '@/components/UserNavbar';
import MyPackages from '@/components/MyPackages';

export default function UserPackagesPage() {
  return <MyPackages nav={<UserNavbar />} />;
}
