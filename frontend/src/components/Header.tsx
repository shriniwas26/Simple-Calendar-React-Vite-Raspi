interface HeaderProps {
  weekdayStr: string;
  dayMonthStr: string;
  timeStr: string;
}

export function Header({ weekdayStr, dayMonthStr, timeStr }: HeaderProps) {
  return (
    <header className="header">
      <div className="header-date">
        <span className="header-weekday">{weekdayStr}</span>
        <span className="header-daymonth">{dayMonthStr}</span>
      </div>
      <span className="header-clock">{timeStr}</span>
    </header>
  );
}
