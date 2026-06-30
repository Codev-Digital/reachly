'use client';

import { motion } from 'framer-motion';

export default function HeroImage() {
  const column1 = [
    '/assets/ahsan-khan.jpg',
    '/assets/bilal.png',
    '/assets/danaer-mobeen.png',
    '/assets/danish.png',
  ];

  const column2 = [
    '/assets/hania.png',
    '/assets/mahira-khan.jpg',
    '/assets/new-man.jpg',
    '/assets/sajal-ali.jpg',
  ];

  const column3 = [
    '/assets/dure.png',
    '/assets/feroz.jpg',
    '/assets/mahira_khan.png',
    '/assets/sara-khan.jpg',
  ];

  // Duplicate arrays to make them scroll seamlessly
  const scroll1 = [...column1, ...column1, ...column1];
  const scroll2 = [...column2, ...column2, ...column2];
  const scroll3 = [...column3, ...column3, ...column3];

  return (
    <div className="relative w-full h-full overflow-hidden rounded-[24px] md:rounded-[32px] bg-gradient-to-b from-[#0014B4] to-[#000B9C] flex flex-col justify-between p-6 sm:p-8">
      {/* Tilted Marquee Container */}
      <div className="absolute inset-0 overflow-hidden pb-48">
        <div className="w-[120%] h-[120%] -rotate-12 -translate-x-[10%] -translate-y-[10%] flex gap-4 justify-center">
          
          {/* Column 1 - Upwards */}
          <div className="w-[30%] overflow-hidden relative h-full">
            <motion.div
              animate={{ y: ['0%', '-50%'] }}
              transition={{ duration: 18, repeat: Infinity, ease: 'linear' }}
              className="flex flex-col gap-4"
            >
              {scroll1.map((src, i) => (
                <div
                  key={i}
                  className="aspect-[3/4] w-full rounded-2xl overflow-hidden border-2 border-white/10 shadow-lg bg-blue-950 shrink-0"
                >
                  <img src={src} alt="Creator" className="w-full h-full object-cover" />
                </div>
              ))}
            </motion.div>
          </div>

          {/* Column 2 - Downwards */}
          <div className="w-[30%] overflow-hidden relative h-full">
            <motion.div
              animate={{ y: ['-50%', '0%'] }}
              transition={{ duration: 22, repeat: Infinity, ease: 'linear' }}
              className="flex flex-col gap-4"
            >
              {scroll2.map((src, i) => (
                <div
                  key={i}
                  className="aspect-[3/4] w-full rounded-2xl overflow-hidden border-2 border-white/10 shadow-lg bg-blue-950 shrink-0"
                >
                  <img src={src} alt="Creator" className="w-full h-full object-cover" />
                </div>
              ))}
            </motion.div>
          </div>

          {/* Column 3 - Upwards */}
          <div className="w-[30%] overflow-hidden relative h-full">
            <motion.div
              animate={{ y: ['0%', '-50%'] }}
              transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
              className="flex flex-col gap-4"
            >
              {scroll3.map((src, i) => (
                <div
                  key={i}
                  className="aspect-[3/4] w-full rounded-2xl overflow-hidden border-2 border-white/10 shadow-lg bg-blue-950 shrink-0"
                >
                  <img src={src} alt="Creator" className="w-full h-full object-cover" />
                </div>
              ))}
            </motion.div>
          </div>

        </div>
      </div>

      {/* Bottom overlay for readability of text */}
      <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-gradient-to-t from-[#000B9C] via-[#000B9C]/90 to-transparent pointer-events-none z-10" />

      {/* Center/Bottom text content */}
      <div className="mt-auto relative z-20 text-center max-w-lg mx-auto pb-4">
        <h2 className="font-sans font-black text-2xl sm:text-3xl lg:text-4xl text-white tracking-tight uppercase mb-4">
          Learn from Pakistani Creators
        </h2>
        <p className="font-sans text-xs sm:text-sm text-white/80 leading-relaxed">
          Learn the skills, strategies, and systems behind successful content, brands, and online businesses—directly from the people who built them and achieved lasting success.
        </p>
      </div>
    </div>
  );
}
