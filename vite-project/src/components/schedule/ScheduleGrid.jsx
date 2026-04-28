import "../../styles/schedulestyle.css";

const START_HOUR = 10;
const END_HOUR = 22;

const days = [
  "Segunda", "Terça-Feira", "Quarta-Feira",
  "Quinta-Feira", "Sexta-Feira", "Sábado", "Domingo"
];

function toMinutes(time) {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
}

export default function ScheduleGrid({ events = [], onEventClick }) {
  const hours = [];
  for (let h = START_HOUR; h <= END_HOUR; h++) {
    hours.push(`${h}:00`);
  }

  const getTop = (time) =>
    ((toMinutes(time) - START_HOUR * 60) / 60) * 60;

  const getHeight = (start, end) =>
    ((toMinutes(end) - toMinutes(start)) / 60) * 60;

  return (
    <div className="calendar">
      <div className="calendar-header">
        <div className="corner" />
        {days.map(day => (
          <div key={day} className="day-header">{day}</div>
        ))}
      </div>

      <div className="calendar-body">
        <div className="time-column">
          {hours.map(h => (
            <div key={h} className="time">{h}</div>
          ))}
        </div>

        <div className="grid">
          {days.map(day => (
            <div key={day} className="day-column">
              {hours.map(h => (
                <div key={`${day}-${h}`} className="row" />
              ))}

              {events
                .filter(e => e.day === day)
                .map(e => {
                  const height = getHeight(e.start, e.end);

                  const isSmall = height < 50;
                  const isMedium = height < 80;
                  const isLarge = height >= 110;

                  return (
                    <div
                      key={e.id}
                      className="event"
                      onClick={() => onEventClick(e)}
                      style={{
                        top: getTop(e.start),
                        height: height
                      }}
                    >
                      <div className="event-title">{e.title}</div>

                      {!isSmall && (
                        <div className="event-time">
                          {e.start} - {e.end}
                        </div>
                      )}

                      {!isSmall && !isMedium && (
                        <div className="event-prof">
                          {e.professor}
                        </div>
                      )}

                      {isLarge && e.estudio && (
                        <div className="event-studio">
                          📍 {e.estudio}
                        </div>
                      )}
                    </div>
                  );
                })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}