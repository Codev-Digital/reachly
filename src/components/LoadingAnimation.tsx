'use client';

import { useEffect, useState } from 'react';
import { useLottie } from 'lottie-react';

export default function LoadingAnimation() {
  const [animationData, setAnimationData] = useState<any>(null);

  useEffect(() => {
    fetch('/loading.json')
      .then(res => res.json())
      .then(data => setAnimationData(data))
      .catch(err => console.error('Error loading animation:', err));
  }, []);

  // Default empty animation data so useLottie is always called
  const defaultAnimationData = {
    v: '5.5.7',
    fr: 60,
    ip: 0,
    op: 1,
    w: 500,
    h: 500,
    nm: '',
    ddd: 0,
    assets: [],
    layers: [],
  };

  const options = {
    animationData: animationData || defaultAnimationData,
    loop: true,
    autoplay: true,
  };

  const { View } = useLottie(options);

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-white">
      <div className="w-64 h-64">
        {View}
      </div>
    </div>
  );
}
