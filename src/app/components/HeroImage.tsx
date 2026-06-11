
import Image from 'next/image';

export default function HeroImage() {
  return (
    <div className="relative w-full h-full overflow-hidden rounded-[20px] md:rounded-[30px]">
      <Image
        src="/Group 2085668106.png"
        alt="Hero"
        fill
        className="object-cover"
        priority
      />
      
      {/* Stats Overlay */}
      <div className="absolute bottom-0 left-3 right-3 sm:left-5 sm:right-5">
        <div className="glass-effect rounded-[20px] md:rounded-[30px] px-4 py-3 sm:px-6 sm:py-4 md:px-10 md:py-2">
          <div className="flex items-center justify-around gap-2 sm:gap-4 md:gap-8">
            <div className="text-center">
              <p className="font-serif text-[24px] sm:text-[32px] md:text-[44px] font-medium text-[#C8A97E]">10k+</p>
              <p className="font-sans text-[10px] sm:text-[14px] md:text-[18px] font-medium italic text-white mt-0.5 md:mt-1">Sessions Completed</p>
            </div>
            <div className="text-center">
              <p className="font-serif text-[24px] sm:text-[32px] md:text-[44px] font-medium text-[#C8A97E]">500+</p>
              <p className="font-sans text-[10px] sm:text-[14px] md:text-[18px] font-medium italic text-white mt-0.5 md:mt-1">Verified Creators</p>
            </div>
            <div className="text-center">
              <p className="font-serif text-[24px] sm:text-[32px] md:text-[44px] font-medium text-[#C8A97E]">4.9</p>
              <p className="font-sans text-[10px] sm:text-[14px] md:text-[18px] font-medium italic text-white mt-0.5 md:mt-1">Average Rating</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
