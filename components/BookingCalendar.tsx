'use client';
import { useState, useMemo } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isBefore, startOfDay, addMonths, subMonths } from 'date-fns';
import { ChevronLeft, ChevronRight, Clock, Calendar } from 'lucide-react';
import { AvailabilitySlot } from '@/lib/types';
import BookingModal from './BookingModal';
export default function BookingCalendar({ slots }: { slots: AvailabilitySlot[] }) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<AvailabilitySlot | null>(null);
  const today = startOfDay(new Date());
  const daysInMonth = useMemo(() => eachDayOfInterval({ start: startOfMonth(currentMonth), end: endOfMonth(currentMonth) }), [currentMonth]);
  const slotsOnDay = (day: Date) => slots.filter(s => isSameDay(new Date(s.start_time), day));
  const selectedDaySlots = selectedDate ? slotsOnDay(selectedDate) : [];
  const firstDayOffset = startOfMonth(currentMonth).getDay();
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 card">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-semibold text-slate-700 text-lg">{format(currentMonth, 'MMMM yyyy')}</h2>
          <div className="flex gap-2">
            <button onClick={() => setCurrentMonth(subMonths(currentMonth, 1))} className="p-2 rounded-lg hover:bg-slate-100"><ChevronLeft className="w-4 h-4" /></button>
            <button onClick={() => setCurrentMonth(addMonths(currentMonth, 1))} className="p-2 rounded-lg hover:bg-slate-100"><ChevronRight className="w-4 h-4" /></button>
          </div>
        </div>
        <div className="grid grid-cols-7 gap-1 mb-2">
          {['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map(d => <div key={d} className="text-center text-xs font-semibold text-slate-400 py-2">{d}</div>)}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {Array.from({ length: firstDayOffset }).map((_, i) => <div key={`e${i}`} />)}
          {daysInMonth.map(day => {
            const isPast = isBefore(startOfDay(day), today);
            const isSelected = selectedDate ? isSameDay(day, selectedDate) : false;
            const hasSlots = slotsOnDay(day).length > 0 && !isPast;
            return (
              <button key={day.toISOString()} onClick={() => hasSlots && setSelectedDate(day)} disabled={!hasSlots}
                className={`relative p-2 rounded-xl text-sm font-medium transition-all min-h-[44px] flex flex-col items-center justify-center
                  ${isSelected ? 'bg-brand-600 text-white shadow-md' : ''}
                  ${hasSlots && !isSelected ? 'bg-brand-50 text-brand-700 hover:bg-brand-100 cursor-pointer' : ''}
                  ${!hasSlots ? 'text-slate-300 cursor-default' : ''}`}>
                <span>{format(day, 'd')}</span>
                {hasSlots && !isSelected && <span className="block w-1.5 h-1.5 rounded-full bg-brand-400 mt-0.5" />}
              </button>
            );
          })}
        </div>
        <div className="mt-4 flex items-center gap-4 text-xs text-slate-400">
          <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-brand-100 border border-brand-300 inline-block" /> Available</span>
          <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-brand-600 inline-block" /> Selected</span>
        </div>
      </div>
      <div className="card">
        {selectedDate ? (
          <>
            <div className="flex items-center gap-2 mb-4">
              <Calendar className="w-4 h-4 text-brand-500" />
              <h3 className="font-semibold text-slate-700">{format(selectedDate, 'EEE, MMM d')}</h3>
            </div>
            <div className="space-y-2">
              {selectedDaySlots.map(slot => (
                <button key={slot.id} onClick={() => setSelectedSlot(slot)} className="w-full text-left p-3 rounded-xl border border-slate-100 hover:border-brand-300 hover:bg-brand-50 transition-all">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5 text-brand-400" />
                      <span className="text-sm font-semibold text-slate-700">{format(new Date(slot.start_time), 'h:mm a')}</span>
                    </div>
                    <span className="text-xs text-brand-600 font-semibold">Book &rarr;</span>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5 ml-5">Up to 2 hours</p>
                </button>
              ))}
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center h-full py-12 text-center">
            <Calendar className="w-10 h-10 text-slate-200 mb-3" />
            <p className="text-slate-400 text-sm">Select a highlighted date to see available slots.</p>
          </div>
        )}
      </div>
      {selectedSlot && <BookingModal slot={selectedSlot} onClose={() => setSelectedSlot(null)} />}
    </div>
  );
}
