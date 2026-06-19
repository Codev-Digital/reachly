export default function LoginToExplore() {
  return (
    <div className="p-8 sm:p-12 bg-[#141414] border border-[rgba(200,169,126,0.3)] rounded-3xl text-center flex flex-col items-center justify-center max-w-lg mx-auto mt-8">
      <div className="w-16 h-16 bg-[rgba(200,169,126,0.1)] border border-[#C8A97E] rounded-full flex items-center justify-center mb-6">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#C8A97E" strokeWidth="2">
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
          <path d="M7 11V7a5 5 0 0110 0v4"></path>
        </svg>
      </div>
      <h3 className="text-[#C8A97E] font-serif text-3xl font-bold mb-3">Login to explore</h3>
      <p className="text-[#F9F6F2] opacity-70 font-sans text-sm mb-8 leading-relaxed">
        Please log in or sign up to view this page, manage your account, and connect with your favorite creators.
      </p>
      <div className="flex flex-col sm:flex-row gap-4 w-full">
        <a href="/login?callbackUrl=/user" className="flex-1 bg-transparent border border-[rgba(200,169,126,0.5)] text-[#C8A97E] font-sans font-semibold py-3 px-6 rounded-full hover:bg-[rgba(200,169,126,0.1)] transition-all">
          Log in
        </a>
        <a href="/signup?callbackUrl=/user" className="flex-1 bg-[#C8A97E] text-[#0C0C0C] font-sans font-semibold py-3 px-6 rounded-full hover:opacity-90 transition-all">
          Sign up
        </a>
      </div>
    </div>
  );
}