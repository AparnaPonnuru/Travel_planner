import React, { useState, useMemo } from 'react';
import { Calendar, ChevronLeft, ChevronRight, ArrowRight, Clock } from 'lucide-react';

interface CalendarDatePickerProps {
  startDate: string;
  endDate: string;
  durationDays: number;
  onDatesChange: (start: string, end: string, days: number) => void;
}

export default function CalendarDatePicker({
  startDate,
  endDate,
  durationDays,
  onDatesChange,
}: CalendarDatePickerProps) {
  // Calendar view month (defaults to startDate's month)
  const initialDate = useMemo(() => {
    return startDate ? new Date(startDate) : new Date();
  }, [startDate]);

  const [viewYear, setViewYear] = useState(initialDate.getFullYear());
  const [viewMonth, setViewMonth] = useState(initialDate.getMonth()); // 0-indexed
  const [hoverDate, setHoverDate] = useState<string | null>(null);
  const [selectingStep, setSelectingStep] = useState<'start' | 'end'>('start');

  const todayStr = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return today.toISOString().split('T')[0];
  }, []);

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const handlePrevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear(y => y - 1);
    } else {
      setViewMonth(m => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear(y => y + 1);
    } else {
      setViewMonth(m => m + 1);
    }
  };

  // Generate calendar grid
  const calendarDays = useMemo(() => {
    const firstDay = new Date(viewYear, viewMonth, 1).getDay(); // 0 is Sun
    // Adjust so week starts on Monday: 0 (Mon) -> 6 (Sun)
    const startOffset = (firstDay + 6) % 7;
    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();

    const days: Array<{
      dateStr: string;
      dayNumber: number;
      isCurrentMonth: boolean;
      isPast: boolean;
    }> = [];

    // Empty padding days from previous month
    for (let i = 0; i < startOffset; i++) {
      days.push({
        dateStr: '',
        dayNumber: 0,
        isCurrentMonth: false,
        isPast: true,
      });
    }

    for (let d = 1; d <= daysInMonth; d++) {
      const monthStr = String(viewMonth + 1).padStart(2, '0');
      const dayStr = String(d).padStart(2, '0');
      const dateStr = `${viewYear}-${monthStr}-${dayStr}`;
      const isPast = dateStr < todayStr;

      days.push({
        dateStr,
        dayNumber: d,
        isCurrentMonth: true,
        isPast,
      });
    }

    return days;
  }, [viewYear, viewMonth, todayStr]);

  const handleDayClick = (dateStr: string) => {
    if (!dateStr || dateStr < todayStr) return;

    if (selectingStep === 'start' || dateStr < startDate) {
      // Pick start date, preserve duration or default to 5 days
      const start = new Date(dateStr);
      const end = new Date(start);
      end.setDate(start.getDate() + (durationDays - 1));
      const endStr = end.toISOString().split('T')[0];
      onDatesChange(dateStr, endStr, durationDays);
      setSelectingStep('end');
    } else {
      // Pick end date
      const start = new Date(startDate);
      const end = new Date(dateStr);
      const diffMs = end.getTime() - start.getTime();
      const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24)) + 1;
      const finalDays = Math.max(1, diffDays);
      onDatesChange(startDate, dateStr, finalDays);
      setSelectingStep('start');
    }
  };

  const handleQuickDuration = (days: number) => {
    const start = startDate ? new Date(startDate) : new Date();
    const end = new Date(start);
    end.setDate(start.getDate() + (days - 1));
    const startStr = start.toISOString().split('T')[0];
    const endStr = end.toISOString().split('T')[0];
    onDatesChange(startStr, endStr, days);
  };

  const formatDateDisplay = (dateStr: string) => {
    if (!dateStr) return 'Select date';
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div style={{
      background: '#FFFFFF',
      borderRadius: '24px',
      border: '1px solid #ECE5D8',
      padding: '24px',
      boxShadow: '0 8px 30px rgba(24, 30, 75, 0.04)',
      display: 'flex',
      flexDirection: 'column',
      gap: '20px',
    }}>
      {/* ── Top Bar: Date Range Summary & Selected Duration ── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr auto 1fr',
        alignItems: 'center',
        gap: '12px',
        padding: '14px 18px',
        background: '#FAF6ED',
        borderRadius: '18px',
        border: '1px solid #EFEAE0',
      }}>
        {/* Start Date Box */}
        <div
          onClick={() => setSelectingStep('start')}
          style={{
            cursor: 'pointer',
            padding: '8px 12px',
            borderRadius: '12px',
            background: selectingStep === 'start' ? '#FFFFFF' : 'transparent',
            border: selectingStep === 'start' ? '1px solid #DF6951' : '1px solid transparent',
            transition: 'all 0.2s',
          }}
        >
          <div style={{ fontSize: '11px', fontWeight: 800, color: '#DF6951', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Departure Date
          </div>
          <div style={{ fontSize: '15px', fontWeight: 800, color: '#181E4B', marginTop: '2px' }}>
            {formatDateDisplay(startDate)}
          </div>
        </div>

        {/* Center Days Badge */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '4px',
        }}>
          <div style={{
            background: '#181E4B',
            color: '#FFFFFF',
            padding: '4px 12px',
            borderRadius: '20px',
            fontSize: '12px',
            fontWeight: 800,
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
          }}>
            <Clock size={12} />
            <span>{durationDays} Days</span>
          </div>
          <ArrowRight size={14} color="#8A8FA3" />
        </div>

        {/* Return Date Box */}
        <div
          onClick={() => setSelectingStep('end')}
          style={{
            cursor: 'pointer',
            padding: '8px 12px',
            borderRadius: '12px',
            textAlign: 'right',
            background: selectingStep === 'end' ? '#FFFFFF' : 'transparent',
            border: selectingStep === 'end' ? '1px solid #DF6951' : '1px solid transparent',
            transition: 'all 0.2s',
          }}
        >
          <div style={{ fontSize: '11px', fontWeight: 800, color: '#DF6951', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Return Date
          </div>
          <div style={{ fontSize: '15px', fontWeight: 800, color: '#181E4B', marginTop: '2px' }}>
            {formatDateDisplay(endDate)}
          </div>
        </div>
      </div>

      {/* ── Quick Duration Presets ── */}
      <div>
        <div style={{ fontSize: '11px', fontWeight: 800, color: '#5E6282', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '8px' }}>
          Quick Duration Presets
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '8px' }}>
          {[3, 4, 5, 7, 10].map(d => (
            <button
              key={d}
              type="button"
              onClick={() => handleQuickDuration(d)}
              style={{
                padding: '10px 8px',
                borderRadius: '14px',
                fontSize: '13px',
                fontWeight: 700,
                border: durationDays === d ? '2px solid #DF6951' : '1px solid #ECE5D8',
                background: durationDays === d ? '#FFF2ED' : '#FAF6ED',
                color: durationDays === d ? '#DF6951' : '#181E4B',
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
            >
              {d} Days
            </button>
          ))}
        </div>
      </div>

      {/* ── Month Header Navigation ── */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 4px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Calendar size={18} color="#DF6951" />
          <span style={{ fontSize: '16px', fontWeight: 800, color: '#181E4B' }}>
            {monthNames[viewMonth]} {viewYear}
          </span>
        </div>

        <div style={{ display: 'flex', gap: '6px' }}>
          <button
            type="button"
            onClick={handlePrevMonth}
            style={{
              width: '34px',
              height: '34px',
              borderRadius: '10px',
              background: '#FAF6ED',
              border: '1px solid #ECE5D8',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#181E4B',
            }}
          >
            <ChevronLeft size={16} />
          </button>
          <button
            type="button"
            onClick={handleNextMonth}
            style={{
              width: '34px',
              height: '34px',
              borderRadius: '10px',
              background: '#FAF6ED',
              border: '1px solid #ECE5D8',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#181E4B',
            }}
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {/* ── Day Names Header (Mon - Sun) ── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(7, 1fr)',
        textAlign: 'center',
        fontSize: '11px',
        fontWeight: 800,
        color: '#8A8FA3',
        letterSpacing: '0.04em',
      }}>
        {['MO', 'TU', 'WE', 'TH', 'FR', 'SA', 'SU'].map(day => (
          <div key={day} style={{ padding: '6px 0' }}>{day}</div>
        ))}
      </div>

      {/* ── Calendar Days Grid ── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(7, 1fr)',
        rowGap: '6px',
      }}>
        {calendarDays.map((item, index) => {
          if (!item.isCurrentMonth) {
            return <div key={`empty-${index}`} style={{ height: '38px' }} />;
          }

          const isStart = item.dateStr === startDate;
          const isEnd = item.dateStr === endDate;
          const isInRange = item.dateStr >= startDate && item.dateStr <= (hoverDate && hoverDate > startDate ? hoverDate : endDate);
          const isSingle = isStart && isEnd;

          let bg = 'transparent';
          let textColor = item.isPast ? '#C3C7D4' : '#181E4B';
          let borderRad = '8px';

          if (isStart || isEnd) {
            bg = '#DF6951';
            textColor = '#FFFFFF';
            borderRad = isStart ? '12px 0 0 12px' : '0 12px 12px 0';
            if (isSingle) borderRad = '12px';
          } else if (isInRange) {
            bg = '#FFF2ED';
            textColor = '#DF6951';
            borderRad = '0px';
          }

          return (
            <div
              key={item.dateStr}
              onClick={() => !item.isPast && handleDayClick(item.dateStr)}
              onMouseEnter={() => !item.isPast && setHoverDate(item.dateStr)}
              onMouseLeave={() => setHoverDate(null)}
              style={{
                height: '38px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: item.isPast ? 'not-allowed' : 'pointer',
                background: bg,
                color: textColor,
                borderRadius: borderRad,
                fontWeight: isStart || isEnd ? 800 : isInRange ? 700 : 600,
                fontSize: '13px',
                position: 'relative',
                transition: 'background 0.15s, color 0.15s',
              }}
            >
              {item.dayNumber}
            </div>
          );
        })}
      </div>

      {/* Footer hint */}
      <div style={{
        fontSize: '11px',
        color: '#8A8FA3',
        textAlign: 'center',
        paddingTop: '8px',
        borderTop: '1px solid #FAF6ED',
      }}>
        Click departure date, then return date to customize your trip length
      </div>
    </div>
  );
}
