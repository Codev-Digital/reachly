'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import Image from 'next/image';

interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  venue: string;
  category: string;
  image: string;
  status: 'Upcoming' | 'Completed' | 'Cancelled';
}

export default function AdminEventsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState('All Categories');

  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedEventType, setSelectedEventType] = useState('');
  const [isTypeDropdownOpen, setIsTypeDropdownOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const eventTypes = [
    'Workshops',
    'Hackathons',
    'Science Fairs',
    'Conferences',
    'Panel Discussions'
  ];

  const initialEvents: Event[] = [
    {
      id: 'EVT-10245',
      title: 'Creator Growth',
      description: 'Grow your audience and brand.',
      date: '5 July 2026',
      time: '2PM - 6PM',
      venue: 'Nishat Hotel, Gulberg, Lahore',
      category: 'Workshops',
      image: '/assets/event-1.jpg',
      status: 'Upcoming'
    },
    {
      id: 'EVT-10246',
      title: 'Creator Growth',
      description: 'Grow your audience and brand.',
      date: '5 July 2026',
      time: '2PM - 6PM',
      venue: 'Nishat Hotel, Gulberg, Lahore',
      category: 'Hackathons',
      image: '/assets/event-2.jpg',
      status: 'Upcoming'
    },
    {
      id: 'EVT-10247',
      title: 'Creator Growth',
      description: 'Grow your audience and brand.',
      date: '5 July 2026',
      time: '2PM - 6PM',
      venue: 'Nishat Hotel, Gulberg, Lahore',
      category: 'Science Fairs',
      image: '/assets/event-1.jpg',
      status: 'Completed'
    },
    {
      id: 'EVT-10248',
      title: 'Creator Growth',
      description: 'Grow your audience and brand.',
      date: '5 July 2026',
      time: '2PM - 6PM',
      venue: 'Nishat Hotel, Gulberg, Lahore',
      category: 'Conferences',
      image: '/assets/event-2.jpg',
      status: 'Upcoming'
    },
    {
      id: 'EVT-10249',
      title: 'Creator Growth',
      description: 'Grow your audience and brand.',
      date: '5 July 2026',
      time: '2PM - 6PM',
      venue: 'Nishat Hotel, Gulberg, Lahore',
      category: 'Panel Discussions',
      image: '/assets/event-1.jpg',
      status: 'Cancelled'
    },
    {
      id: 'EVT-10250',
      title: 'Creator Growth',
      description: 'Grow your audience and brand.',
      date: '5 July 2026',
      time: '2PM - 6PM',
      venue: 'Nishat Hotel, Gulberg, Lahore',
      category: 'Workshops',
      image: '/assets/event-2.jpg',
      status: 'Completed'
    },
    {
      id: 'EVT-10251',
      title: 'Creator Growth',
      description: 'Grow your audience and brand.',
      date: '5 July 2026',
      time: '2PM - 6PM',
      venue: 'Nishat Hotel, Gulberg, Lahore',
      category: 'Conferences',
      image: '/assets/event-1.jpg',
      status: 'Upcoming'
    },
    {
      id: 'EVT-10252',
      title: 'Creator Growth',
      description: 'Grow your audience and brand.',
      date: '5 July 2026',
      time: '2PM - 6PM',
      venue: 'Nishat Hotel, Gulberg, Lahore',
      category: 'Workshops',
      image: '/assets/event-2.jpg',
      status: 'Upcoming'
    },
    {
      id: 'EVT-10253',
      title: 'Creator Growth',
      description: 'Grow your audience and brand.',
      date: '5 July 2026',
      time: '2PM - 6PM',
      venue: 'Nishat Hotel, Gulberg, Lahore',
      category: 'Panel Discussions',
      image: '/assets/event-1.jpg',
      status: 'Completed'
    }
  ];

  const [events, setEvents] = useState<Event[]>(initialEvents);

  // Filter logic
  const filteredEvents = events.filter(evt => {
    const matchesSearch = evt.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      evt.venue.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory = selectedCategoryFilter === 'All Categories' || evt.category === selectedCategoryFilter;

    return matchesSearch && matchesCategory;
  });

  const handleAddEventTypeSubmit = () => {
    if (selectedEventType) {
      alert(`Event Type "${selectedEventType}" added successfully!`);
      setShowAddModal(false);
      setSelectedEventType('');
    }
  };

  return (
    <motion.div
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.2 }}
      className="pb-12"
    >
      {/* Declarative clip path for curved image lower right notch */}
      <svg width="0" height="0" className="absolute">
        <defs>
          <clipPath id="cover-clip-s1" clipPathUnits="objectBoundingBox">
            <path
              d="
                M0 .94
                C0 .975 .025 1 .06 1
                H.82

                C.88 1 .90 .97 .90 .93
                V.76

                C.90 .68 .94 .64 .98 .62
                C.995 .61 1 .59 1 .56

                V.06
                C1 .025 .975 0 .94 0

                H.06
                C.025 0 0 .025 0 .06
                Z
              "
            />
          </clipPath>
        </defs>
      </svg>

      {/* Greetings & Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <p className="text-gray-500 font-sans text-sm sm:text-base mb-1">Hello Anna Chris!</p>
          <h1 className="text-3xl sm:text-4xl font-bold font-sans text-black">
            <span className="text-[#0012FF] font-black">Event</span> Management{' '}
            <span className="text-gray-400 font-normal text-sm sm:text-base">Overview & Control</span>
          </h1>
        </div>

        {/* Add Event Type Button */}
        <button
          onClick={() => setShowAddModal(true)}
          className="sm:self-end px-6 py-3 bg-[#0012FF] text-white rounded-2xl text-sm font-bold shadow-md shadow-[#0012FF]/20 hover:bg-[#0012FF]/95 transition-all"
        >
          + Add Event Type
        </button>
      </div>

      {/* Interlocking Metrics Cards (Dashboard Cards Design) */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-start w-full gap-1 sm:gap-7 mb-10 overflow-visible">
        {/* Card 1: Total Users */}
        <div className="relative w-full sm:w-[26%] aspect-[329/160] p-6 flex flex-col justify-between overflow-visible z-[1]">
          <img
            src="/assets/admin-user-rc-1.svg"
            alt=""
            className="absolute inset-0 w-full h-full object-fill -z-10 pointer-events-none"
          />
          <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-[#0012FF] shadow-sm">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
            </svg>
          </div>
          <div className="mt-auto">
            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Total Events</p>
            <p className="text-2xl font-black text-[#0012FF]">1,410</p>
          </div>
        </div>

        {/* Card 2: Active Users */}
        <div className="relative w-full sm:w-[28.5%] aspect-[361/160] pl-10 pr-6 py-6 flex flex-col justify-between overflow-visible z-[2] mt-4 sm:mt-0 sm:-ml-[3.9%]">
          <img
            src="/assets/admin-user-rc-2.svg"
            alt=""
            className="absolute inset-0 w-full h-full object-fill -z-10 pointer-events-none"
          />
          <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-[#10B981] shadow-sm">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
          <div className="mt-auto">
            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Completed Events</p>
            <p className="text-2xl font-black text-[#10B981]">1,376</p>
          </div>
        </div>

        {/* Card 3: Inactive Users */}
        <div className="relative w-full sm:w-[28.5%] aspect-[363/160] pl-10 pr-6 py-6 flex flex-col justify-between overflow-visible z-[3] mt-4 sm:mt-0 sm:-ml-[3.9%]">
          <img
            src="/assets/admin-user-rc-3.svg"
            alt=""
            className="absolute inset-0 w-full h-full object-fill -z-10 pointer-events-none"
          />
          <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-[#EF4444] shadow-sm">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </div>
          <div className="mt-auto">
            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Cancelled Events</p>
            <p className="text-2xl font-black text-[#EF4444]">34</p>
          </div>
        </div>

        {/* Card 4: Pending Approval */}
        <div className="relative w-full sm:w-[28.5%] aspect-[363/160] pl-10 pr-6 py-6 flex flex-col justify-between overflow-visible z-[4] mt-4 sm:mt-0 sm:-ml-[3.9%]">
          <img
            src="/assets/admin-user-rc-4.svg"
            alt=""
            className="absolute inset-0 w-full h-full object-fill -z-10 pointer-events-none"
          />
          <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-[#F59E0B] shadow-sm">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
          </div>
          <div className="mt-auto">
            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Upcoming Events</p>
            <p className="text-2xl font-black text-[#F59E0B]">234</p>
          </div>
        </div>
      </div>

      {/* Main Categories & Search Filters Row */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-8">
        {/* Categories Tab selector */}
        <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0">
          {['All Categories', 'Workshops', 'Hackathons', 'Science Fairs', 'Conferences', 'Panel Discussions'].map((cat) => {
            const isSelected = selectedCategoryFilter === cat;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategoryFilter(cat)}
                className={`px-5 py-2.5 rounded-full text-xs font-bold whitespace-nowrap transition-all ${isSelected
                  ? 'bg-[#0012FF] text-white shadow-md shadow-[#0012FF]/20'
                  : 'bg-white border border-gray-100 text-gray-400 hover:bg-gray-50'
                  }`}
              >
                {cat}
              </button>
            );
          })}
        </div>

        {/* Search Input */}
        <div className="relative w-full lg:w-80">
          <input
            type="text"
            placeholder="Search by name"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-100 rounded-2xl text-sm text-black placeholder-gray-400 focus:outline-none focus:border-blue-500 shadow-sm transition-colors"
          />
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
          >
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
        </div>
      </div>

      {/* Events Grid layout */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredEvents.length > 0 ? (
          filteredEvents.map((evt, idx) => (
            <motion.div
              key={evt.id}
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: idx * 0.05 }}
              className="bg-white rounded-[32px] overflow-hidden border border-gray-100/80 shadow-sm relative flex flex-col justify-between"
            >
              {/* Cover Banner using SVG Clip notch */}
              <div className="w-full aspect-[320/180] relative overflow-visible">
                <img
                  src={evt.image}
                  alt={evt.title}
                  className="absolute inset-0 w-full h-full object-cover"
                  style={{ clipPath: 'url(#cover-clip-s1)' }}
                />

                {/* Niche Badge */}
                <span className="absolute left-4 top-4 bg-white/90 backdrop-blur-sm text-gray-800 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase shadow-sm">
                  {evt.category}
                </span>

                {/* Eye Icon Circle sitting inside the bottom right notch outside the clip */}
                <button
                  className="absolute bottom-1 right-1.5 w-8 h-8 rounded-full bg-white border border-gray-100 flex items-center justify-center shadow-sm cursor-pointer hover:bg-gray-50 transition-all"
                  title="View Event Details"
                >
                  <svg
                    width="15"
                    height="15"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    className="text-gray-400"
                  >
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                </button>
              </div>

              {/* Text Information below Banner */}
              <div className="p-6 pt-2 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="font-sans font-black text-xl text-black leading-tight">
                    {evt.title}
                  </h3>
                  <p className="text-xs text-gray-400 font-bold mt-1 uppercase tracking-wide">
                    {evt.description}
                  </p>

                  {/* Date & Time Row */}
                  <div className="flex items-center gap-4 mt-4 text-xs text-gray-500">
                    <span className="flex items-center gap-1.5 font-bold">
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-[#0012FF]">
                        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                        <line x1="16" y1="2" x2="16" y2="6" />
                        <line x1="8" y1="2" x2="8" y2="6" />
                        <line x1="3" y1="10" x2="21" y2="10" />
                      </svg>
                      {evt.date}
                    </span>
                    <span className="flex items-center gap-1.5 font-bold">
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-[#0012FF]">
                        <circle cx="12" cy="12" r="10" />
                        <polyline points="12 6 12 12 16 14" />
                      </svg>
                      {evt.time}
                    </span>
                  </div>
                </div>

                {/* Location row */}
                <div className="flex items-center gap-1.5 text-xs text-gray-500 font-bold mt-3.5">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-[#0012FF]">
                    <path d="M12 2a8 8 0 0 0-8 8c0 5.25 8 12 8 12s8-6.75 8-12a8 8 0 0 0-8-8z" />
                    <circle cx="12" cy="10" r="3" />
                  </svg>
                  {evt.venue}
                </div>
              </div>
            </motion.div>
          ))
        ) : (
          <div className="col-span-full bg-white rounded-[32px] p-12 text-center border border-gray-100 shadow-sm">
            <p className="text-gray-400 font-semibold text-sm">No events found matching current category filter.</p>
          </div>
        )}
      </div>

      {/* Pagination Footer */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-10 pt-6 border-t border-gray-100">
        <p className="text-xs font-semibold text-gray-400">Showing {filteredEvents.length} of {events.length}</p>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setCurrentPage(1)}
            className="w-8 h-8 rounded-full border border-gray-100 flex items-center justify-center text-gray-400 hover:bg-gray-50 transition-colors"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
          <button
            className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${currentPage === 1
              ? 'bg-[#0012FF] text-white shadow-md shadow-[#0012FF]/20'
              : 'text-gray-500 hover:bg-gray-50'
              }`}
            onClick={() => setCurrentPage(1)}
          >
            1
          </button>
          <button
            className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${currentPage === 2
              ? 'bg-[#0012FF] text-white shadow-md shadow-[#0012FF]/20'
              : 'text-gray-500 hover:bg-gray-50'
              }`}
            onClick={() => setCurrentPage(2)}
          >
            2
          </button>
          <button
            onClick={() => setCurrentPage(2)}
            className="w-8 h-8 rounded-full border border-gray-100 flex items-center justify-center text-gray-400 hover:bg-gray-50 transition-colors"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>
        </div>
      </div>

      {/* Add Event Type Modal */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-[100] p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAddModal(false)}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative overflow-visible w-full max-w-lg flex flex-col items-center p-8 pt-12 pb-8 z-10 bg-transparent animate-fade-in"
            >
              {/* SVG Background */}
              <img
                src="/assets/cancel-card.svg"
                alt=""
                className="absolute inset-0 w-full h-full object-fill pointer-events-none -z-10"
              />

              {/* Close Button */}
              <button
                onClick={() => setShowAddModal(false)}
                className="absolute -mt-20 left-1/2 -translate-x-1/2 w-10 h-10 rounded-full bg-white shadow-md flex items-center justify-center border border-gray-100/50 text-gray-500 hover:bg-gray-50 transition-all z-20"
              >
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                >
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>

              {/* Responsive Illustration */}
              <div className="w-28 sm:w-36 md:w-44 lg:w-56 mt-3 mb-4">
                <Image
                  src="/assets/add-category.png"
                  alt="Add event type"
                  width={240}
                  height={170}
                  className="w-full h-auto object-contain"
                />
              </div>

              <h3 className="text-xl sm:text-2xl font-bold text-black mb-2 text-center">
                Add Event Type
              </h3>

              <p className="text-xs sm:text-sm text-gray-500 text-center mb-6">
                Add a new event type.
              </p>

              {/* Event Type Dropdown Selection */}
              <div className="w-full mb-6 relative">
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Event Type</label>
                <button
                  onClick={() => setIsTypeDropdownOpen(!isTypeDropdownOpen)}
                  className="w-full flex items-center justify-between px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm font-semibold text-gray-800 hover:bg-gray-50 transition-all text-left"
                >
                  <span>{selectedEventType || 'Select Event Type'}</span>
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    className={`transition-transform duration-200 ${isTypeDropdownOpen ? 'rotate-180' : ''}`}
                  >
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </button>

                <AnimatePresence>
                  {isTypeDropdownOpen && (
                    <>
                      <div className="fixed inset-0 z-20" onClick={() => setIsTypeDropdownOpen(false)} />
                      <motion.div
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 5 }}
                        className="absolute left-0 right-0 mt-1 bg-white border border-gray-100 rounded-xl shadow-xl z-30 max-h-48 overflow-y-auto py-1"
                      >
                        {eventTypes.map((type) => (
                          <button
                            key={type}
                            onClick={() => {
                              setSelectedEventType(type);
                              setIsTypeDropdownOpen(false);
                            }}
                            className={`w-full text-left px-4 py-2.5 text-sm font-semibold transition-all ${selectedEventType === type
                              ? 'bg-[#0012FF] text-white'
                              : 'text-gray-600 hover:bg-gray-50'
                              }`}
                          >
                            {type}
                          </button>
                        ))}
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 w-full">
                <button
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-all bg-white"
                >
                  Cancel
                </button>

                <button
                  onClick={handleAddEventTypeSubmit}
                  disabled={!selectedEventType}
                  className="flex-1 py-2.5 bg-[#0012FF] disabled:bg-blue-300 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 transition-all"
                >
                  Add
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
