interface HeaderProps {
  dateLabelStr: string;
  timeStr: string;
}

export function Header({ dateLabelStr, timeStr }: HeaderProps) {
  const hhmm = timeStr.slice(0, 5);
  const ss = timeStr.slice(5);

  return (
    <header className="header">
      <span className="header-date">{dateLabelStr}</span>
      <span className="header-clock">
        {hhmm}<span className="header-clock-seconds">{ss}</span>
      </span>
    </header>
  );
}
