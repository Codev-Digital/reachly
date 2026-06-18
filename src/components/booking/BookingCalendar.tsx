'use client';

import { useState } from 'react';

interface BookingCalendarProps {
  selectedDate: Date | null;
  onDateSelect: (date: Date) => void;
}

export default function BookingCalendar({ selectedDate, onDateSelect }: BookingCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const daysInMonth = new Date(
    currentMonth.getFullYear(),
    currentMonth.getMonth() + 1,
    0
  ).getDate();

  const firstDay = new Date(
    currentMonth.getFullYear(),
    currentMonth.getMonth(),
    1
  ).getDay();

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const isPast = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date < today;
  };

  const isSelected = (date: Date) => {
    return selectedDate && selectedDate.toDateString() === date.toDateString();
  };

  const prevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
  };

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
  };

  const days = [];
  for (let i = 0; i < firstDay; i++) {
    days.push(<div key={`empty-${i}`} />);
  }

  for (let i = 1; i <= daysInMonth; i++) {
    const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), i);
    days.push(
      <button
        key={i}
        disabled={isPast(date)}
        onClick={() => onDateSelect(date)}
        className={`aspect-square flex items-center justify-center font-sans text-xs sm:text-sm rounded-lg transition-all ${
          isPast(date)
            ? 'text-[#F9F6F2] opacity-20 cursor-not-allowed'
            : isSelected(date)
            ? 'bg-[rgba(200,169,126,0.5)] border border-[#C8A97E] text-[#0C0C0C] font-semibold'
            : isToday(date)
            ? 'bg-[rgba(200,169,126,0.2)] border border-[#C8A97E] text-[#C8A97E] font-semibold'
            : 'bg-[#141414] text-[#F9F6F2] hover:bg-[rgba(200,169,126,0.1)] hover:text-[#C8A97E]'
        }`}
      >
        {i}
      </button>
    );
  }

  return (
    <div className="bg-[#141414] border border-[rgba(200,169,126,0.3)] rounded-xl p-4 sm:p-5">
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={prevMonth}
          className="w-9 h-9 rounded-lg border border-[rgba(200,169,126,0.3)] text-[#C8A97E] flex items-center justify-center hover:bg-[rgba(200,169,126,0.1)] transition-all"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>
        <span className="font-serif text-sm sm:text-base font-semibold text-[#F9F6F2]">
          {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
        </span>
        <button
          onClick={nextMonth}
          className="w-9 h-9 rounded-lg border border-[rgba(200,169,126,0.3)] text-[#C8A97E] flex items-center justify-center hover:bg-[rgba(200,169,126,0.1)] transition-all"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </button>
      </div>
      <div className="grid grid-cols-7 mb-2 gap-1">
        {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(d => (
          <div key={d} className="text-center font-sans text-[#F9F6F2] text-xs opacity-50 py-1">
            {d}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {days}
      </div>
    </div>
  );
}