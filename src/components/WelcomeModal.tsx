'use client';

type WelcomePath = 'user' | 'creator';

export default function WelcomeModal({
  firstName,
  selected,
  onSelect,
  onNext,
  loading,
}: {
  firstName: string;
  selected: WelcomePath | null;
  onSelect: (path: WelcomePath) => void;
  onNext: () => void;
  loading: boolean;
}) {
  const cards: {
    id: WelcomePath;
    title: string;
    description: string;
    iconSrc: string;
    iconAlt: string;
  }[] = [
    {
      id: 'user',
      title: 'I am a user',
      description: 'Book 1-on-1 sessions and learn directly from Pakistani creators.',
      iconSrc: '/assets/users.svg',
      iconAlt: 'User',
    },
    {
      id: 'creator',
      title: 'I am a creator',
      description: 'Share your knowledge and monetize your expertise through sessions.',
      iconSrc: '/assets/creator.svg',
      iconAlt: 'Creator',
    },
  ];

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 sm:p-6">
      <div className="welcome-backdrop absolute inset-0 bg-black/50" />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="welcome-modal-title"
        className="welcome-dialog relative w-full max-w-[920px] bg-white rounded-xl sm:rounded-2xl shadow-2xl px-6 py-8 sm:px-10 sm:py-10"
      >
        <h1
          id="welcome-modal-title"
          className="font-sans text-[22px] sm:text-[30px] font-bold text-[#222325] leading-snug tracking-tight mt-13 text-center"
        >
          {firstName}, your account has been created! What brings you to Reachly?
        </h1>
        <p className="mt-2 font-sans text-sm sm:text-[15px] text-gray-500 text-center">
          We&apos;ll tailor your experience to fit your needs.
        </p>

        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {cards.map((card) => {
            const isSelected = selected === card.id;
            return (
              <button
                key={card.id}
                type="button"
                onClick={() => onSelect(card.id)}
                className={`relative text-left rounded-xl border-2 p-5 sm:p-6 min-h-[180px] sm:min-h-[200px] transition-colors duration-200 cursor-pointer ${
                  isSelected
                    ? 'border-[#0012FF] bg-white'
                    : 'border-gray-200 bg-white hover:border-[#0012FF]'
                }`}
              >
                <span
                  className={`absolute top-4 right-4 w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                    isSelected ? 'border-[#0012FF]' : 'border-gray-300'
                  }`}
                >
                  {isSelected && <span className="w-2.5 h-2.5 rounded-full bg-[#0012FF]" />}
                </span>

                <div className="mb-5">
                  <img
                    src={card.iconSrc}
                    alt={card.iconAlt}
                    className="w-12 h-12 object-contain pointer-events-none select-none"
                  />
                </div>

                <div>
                  <h2 className="font-sans font-bold text-[16px] sm:text-[17px] text-[#222325]">
                    {card.title}
                  </h2>
                  <p className="mt-2 font-sans text-xs sm:text-[13px] text-gray-400 leading-relaxed pr-4">
                    {card.description}
                  </p>
                </div>
              </button>
            );
          })}
        </div>

        <div className="mt-8 flex justify-end">
          <button
            type="button"
            onClick={onNext}
            disabled={!selected || loading}
            className={`min-w-[108px] px-7 py-2.5 rounded-md font-sans font-semibold text-sm transition-all ${
              selected && !loading
                ? 'bg-[#0012FF] text-white hover:bg-[#0010d0] cursor-pointer'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }`}
          >
            {loading ? (
              <span className="inline-flex items-center gap-2">
                <span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                Next
              </span>
            ) : (
              'Next'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
