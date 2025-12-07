import React, { useMemo } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useThemeStore } from '../stores/themeStore';

interface CalendarViewProps {
  selectedDate: Date;
  onSelectDate: (date: Date) => void;
  onMonthChange?: (date: Date) => void; // Parent can handle loading other data
}

/**
 * Calendar View Component
 * Displays a monthly calendar with navigation
 */
export function CalendarView({
  selectedDate,
  onSelectDate,
  onMonthChange,
}: CalendarViewProps): React.JSX.Element {
  const colors = useThemeStore((state) => state.colors);
  const phaseColor = useThemeStore((state) => state.phaseColor);

  // Memoize calendar logic
  const { monthLabel, days } = useMemo(() => {
    const year = selectedDate.getFullYear();
    const month = selectedDate.getMonth();
    
    // Month Label
    const date = new Date(year, month);
    const label = date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

    // Days calculation
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDay = new Date(year, month, 1).getDay(); // 0 = Sunday

    const calendarDays = [];
    
    // Empty slots for previous month
    for (let i = 0; i < firstDay; i++) {
      calendarDays.push(null);
    }
    
    // Days of current month
    for (let i = 1; i <= daysInMonth; i++) {
      calendarDays.push(new Date(year, month, i));
    }

    return { monthLabel: label, days: calendarDays };
  }, [selectedDate]);

  const handlePrevMonth = () => {
    const newDate = new Date(selectedDate);
    newDate.setMonth(newDate.getMonth() - 1);
    // Be careful with day overflow (e.g. Mar 31 -> Feb 28/29)
    // Actually for month nav, we usually just want to go to *some* day in that month.
    // Ideally user might want to stay on "Same Day" or go to "1st".
    // Let's go to the same day if possible, or last day of month.
    
    if (selectedDate.getDate() > 28) {
       // Check if we skipped a month (e.g. going Jan 31 -> Feb -> Mar) because Feb doesn't have 31.
       // The setMonth behavior handles this by overflowing.
       // e.g. Jan 31 -> setMonth(Feb) -> Mar 3 (or 2).
       // We want Feb 28.
       // Actually, simplified approach: pass the 1st of the new month to parent?
       // But parent expects a "Select Date".
       // Let's just update the view but keep selection? 
       // No, simpler to just select the 1st of the new month for navigation purposes
    }
    // Simplest: select the 1st of the previous month
    newDate.setDate(1); 
    onSelectDate(newDate);
    onMonthChange?.(newDate);
  };

  const handleNextMonth = () => {
    const newDate = new Date(selectedDate);
    newDate.setMonth(newDate.getMonth() + 1);
    newDate.setDate(1);
    onSelectDate(newDate);
    onMonthChange?.(newDate);
  };

  const isSameDay = (d1: Date, d2: Date) => {
    return (
      d1.getDate() === d2.getDate() &&
      d1.getMonth() === d2.getMonth() &&
      d1.getFullYear() === d2.getFullYear()
    );
  };

  const isToday = (d: Date) => {
    return isSameDay(d, new Date());
  };

  const renderDay = (date: Date | null, index: number) => {
    if (!date) {
      return <View key={`empty-${index}`} style={styles.dayCell} />;
    }

    const isSelected = isSameDay(date, selectedDate);
    const checkToday = isToday(date);

    return (
      <TouchableOpacity
        key={date.toISOString()}
        style={[
          styles.dayCell,
          isSelected && { backgroundColor: phaseColor, borderRadius: 20 },
          !isSelected && checkToday && { borderWidth: 1, borderColor: phaseColor, borderRadius: 20 },
        ]}
        onPress={() => onSelectDate(date)}
      >
        <Text
          style={[
            styles.dayText,
            { color: isSelected ? '#FFFFFF' : colors.text },
            !isSelected && checkToday && { color: phaseColor, fontWeight: '700' },
          ]}
        >
          {date.getDate()}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.surface }]}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: colors.background }]}>
        <Text style={[styles.monthLabel, { color: colors.text }]}>{monthLabel}</Text>
        <View style={styles.navButtons}>
          <TouchableOpacity onPress={handlePrevMonth} style={styles.navButton}>
            <Text style={[styles.navButtonText, { color: colors.text }]}>←</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={handleNextMonth} style={styles.navButton}>
             <Text style={[styles.navButtonText, { color: colors.text }]}>→</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Weekday Labels */}
      <View style={styles.weekRow}>
        {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((day) => (
          <View key={day} style={styles.dayCell}>
             <Text style={[styles.weekDayText, { color: colors.textSecondary }]}>{day}</Text>
          </View>
        ))}
      </View>

      {/* Days Grid */}
      <View style={styles.daysGrid}>
        {days.map((day, index) => renderDay(day, index))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    paddingBottom: 8,
    borderBottomWidth: 1,
  },
  monthLabel: {
    fontSize: 18,
    fontWeight: '600',
  },
  navButtons: {
    flexDirection: 'row',
    gap: 16,
  },
  navButton: {
    padding: 4,
  },
  navButtonText: {
    fontSize: 18,
    fontWeight: '600',
  },
  weekRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  daysGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    // justifyContent: 'space-between', // Can cause gaps, better to use fixed widths or percentages if possible? 
    // Flex wrap with specific widths is safer.
  },
  dayCell: {
    width: '14.28%', // 100% / 7
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  weekDayText: {
    fontSize: 12,
    fontWeight: '500',
  },
  dayText: {
    fontSize: 14,
  },
});
