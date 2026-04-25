import { useEffect, useState } from 'react';

function degreesForHands(date: Date) {
  const seconds = date.getSeconds();
  const minutes = date.getMinutes();
  const hours = date.getHours() % 12;

  const secondDeg = seconds * 6;
  const minuteDeg = minutes * 6 + seconds * 0.1;
  const hourDeg = hours * 30 + minutes * 0.5;

  return { hourDeg, minuteDeg, secondDeg };
}

export function AnalogClock() {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const { hourDeg, minuteDeg, secondDeg } = degreesForHands(now);
  const quarterNumbers = [
    { label: '12', className: 'analog-clock-number-top' },
    { label: '3', className: 'analog-clock-number-right' },
    { label: '6', className: 'analog-clock-number-bottom' },
    { label: '9', className: 'analog-clock-number-left' },
  ];

  return (
    <section className="utility-panel utility-panel-clock" aria-label="Analog clock panel">
      <header className="dashboard-panel-header">
        <h2 className="dashboard-panel-title">Clock</h2>
      </header>
      <div className="analog-clock-wrap">
        <div className="analog-clock" role="img" aria-label="Analog clock">
          <div className="analog-clock-face-numbers" aria-hidden="true">
            {quarterNumbers.map((item) => (
              <span key={item.label} className={`analog-clock-number ${item.className}`}>
                {item.label}
              </span>
            ))}
          </div>
          <span className="analog-clock-hand analog-clock-hand-hour" style={{ transform: `rotate(${hourDeg}deg)` }} />
          <span
            className="analog-clock-hand analog-clock-hand-minute"
            style={{ transform: `rotate(${minuteDeg}deg)` }}
          />
          <span
            className="analog-clock-hand analog-clock-hand-second"
            style={{ transform: `rotate(${secondDeg}deg)` }}
          />
          <span className="analog-clock-center" />
        </div>
      </div>
      <div className="utility-panel-placeholder">Space reserved for mini calendar</div>
    </section>
  );
}
