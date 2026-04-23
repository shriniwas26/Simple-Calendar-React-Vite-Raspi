interface HeaderProps {
  dayDateStr: string;
  timeStr: string;
}

export function Header({ dayDateStr, timeStr }: HeaderProps) {
  const parts = timeStr.split(':');
  const hhmm =
    parts.length >= 2 ? `${parts[0]}:${parts[1]}` : timeStr;
  const ss = parts.length >= 3 ? parts[2] : '';

  return (
    <header className="header">
      <span className="header-pill header-pill-daydate">{dayDateStr}</span>
      <span className="header-pill header-pill-time">
        <span className="header-clock-hhmm">{hhmm}</span>
        <span className="header-clock-seconds">{ss}</span>
      </span>
    </header>
  );
}
