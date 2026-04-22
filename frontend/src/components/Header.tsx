interface HeaderProps {
  dateStr: string;
  timeStr: string;
}

export function Header({ dateStr, timeStr }: HeaderProps) {
  return (
    <header className="header">
      <span className="header-date">{dateStr}</span>
      <span className="header-clock">{timeStr}</span>
    </header>
  );
}
