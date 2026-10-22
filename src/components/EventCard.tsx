'use client';

import Link from 'next/link';
import { Calendar, Clock, Eye, EyeOff, MapPin, Pencil } from 'lucide-react';
import { cn } from '@/lib/cn';

export interface EventCardData {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  /** Optional cover image URL. A gradient is used when missing. */
  image?: string;
  /** Hidden events are not shown on the public profile. */
  visible: boolean;
}

interface EventCardProps {
  event: EventCardData;
  /** Opens hide / unhide confirmation (creator manage view). */
  onToggleVisibility?: (id: string) => void;
  /** When true, shows the edit control linking to the edit page. */
  showEdit?: boolean;
  onClick?: (id: string) => void;
}

/** Event tile: full grid-cell width, 270px tall, 8px radius. */
export default function EventCard({
  event,
  onToggleVisibility,
  showEdit = false,
  onClick,
}: EventCardProps) {
  return (
    <div
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onClick={() => onClick?.(event.id)}
      onKeyDown={(e) => {
        if (onClick && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault();
          onClick(event.id);
        }
      }}
      className={cn(
        'group relative h-[270px] w-full overflow-hidden rounded-[8px] bg-[#0A1FD6] text-white',
        onClick && 'cursor-pointer'
      )}
    >
      {/* Cover */}
      {event.image ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={event.image}
          alt=""
          className={cn(
            'absolute inset-0 h-full w-full object-cover transition-all duration-300 group-hover:scale-105',
            !event.visible && 'grayscale opacity-70'
          )}
        />
      ) : (
        <div
          className={cn(
            'absolute inset-0 transition-all duration-300',
            !event.visible && 'grayscale opacity-70'
          )}
          style={{
            background:
              'radial-gradient(120% 90% at 0% 0%, #FF5A36 0%, rgba(255,90,54,0) 55%), radial-gradient(90% 70% at 100% 10%, #1B8CFF 0%, rgba(27,140,255,0) 60%), linear-gradient(180deg, #0B1B8F 0%, #050A3A 100%)',
          }}
        />
      )}

      {/* Readability overlay: dark on top, brand blue at the bottom */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/45 via-black/30 to-[#0012FF]/55" />

      {/* Creator actions */}
      {(onToggleVisibility || showEdit) && (
        <div className="absolute right-3 top-3 z-10 flex items-center gap-2">
          {showEdit && (
            <Link
              href={`/creators/events/${event.id}/edit`}
              aria-label="Edit event"
              title="Edit event"
              onClick={(e) => e.stopPropagation()}
              className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-white/25 text-white backdrop-blur-sm transition-colors hover:bg-white/45"
            >
              <Pencil size={14} strokeWidth={2.25} />
            </Link>
          )}
          {onToggleVisibility && (
            <button
              type="button"
              aria-label={event.visible ? 'Hide event' : 'Show event'}
              title={event.visible ? 'Visible to followers' : 'Hidden from followers'}
              onClick={(e) => {
                e.stopPropagation();
                onToggleVisibility(event.id);
              }}
              className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-white/25 text-white backdrop-blur-sm transition-colors hover:bg-white/45"
            >
              {event.visible ? <Eye size={14} /> : <EyeOff size={14} />}
            </button>
          )}
        </div>
      )}

      {!event.visible && (
        <span className="absolute left-3 top-3 z-10 rounded-full bg-black/45 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-white/95 backdrop-blur-sm">
          Hidden
        </span>
      )}

      {/* Details */}
      <div className="absolute inset-x-0 bottom-0 flex flex-col gap-1 p-4 sm:p-5">
        <h3 className="truncate font-inter text-xl font-bold leading-tight tracking-tight sm:text-2xl">
          {event.title}
        </h3>
        <p className="line-clamp-1 text-xs text-white/85">{event.description}</p>

        <div className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] font-medium text-white/90">
          <span className="flex items-center gap-1.5">
            <Calendar size={12} className="shrink-0" />
            {event.date}
          </span>
          <span className="flex items-center gap-1.5">
            <Clock size={12} className="shrink-0" />
            {event.time}
          </span>
        </div>
        <span className="flex min-w-0 items-center gap-1.5 text-[11px] font-medium text-white/90">
          <MapPin size={12} className="shrink-0" />
          <span className="truncate">{event.location}</span>
        </span>
      </div>
    </div>
  );
}
