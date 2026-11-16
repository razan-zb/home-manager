import { useNavigate, useParams } from 'react-router-dom';
import './MonthPage.css';
import { strings } from '../i18n';

export default function MonthPage({ workers, toggleDay, editWorker }) {
    const t = strings['ar'];
    const { id, month } = useParams();
    const navigate = useNavigate();
    const worker = workers.find((w) => w.id === id);

    if (!worker) {
        return (
            <div className="app">
                <main className="app__body">
                    <p className="list__empty">{t.notFound}</p>
                </main>
            </div>
        );
    }

    const [y, m] = month.split('-').map(Number);
    const daysInMonth = new Date(y, m, 0).getDate();
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let worked = 0;
    const rows = [];

    for (let d = 1; d <= daysInMonth; d++) {
        const date = new Date(y, m - 1, d);
        const iso = `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
        const isFuture = date > today;
        const isOff = worker.offDays.includes(date.getDay());
        const val = worker.days[iso] ?? (isOff ? 0 : 1);
        if (val === 1 && !isFuture) worked++;
        rows.push({ d, iso, val, isOff, isFuture });
    }

    return (
        <div className="app">
            <header className="app__header">
                <div className="app__top">
                    <button
                        className="app__lang"
                        onClick={() => navigate(`/salon/${id}`)}
                    >
                        ←
                    </button>
                    <div className="app__total">
                        <span className="app__total-label">{t.owed}</span>
                        <span className="app__total-value">
                            {worked * worker.dailyWage}
                        </span>
                    </div>
                    <span style={{ width: 44 }} />
                </div>
                <h1 className="app__title">{month}</h1>
            </header>

            <main className="app__body">
                <label className="month__wage">
                    <span>{t.dailyWage}</span>
                    <input
                        type="number"
                        value={worker.dailyWage}
                        onChange={(e) =>
                            editWorker(id, { dailyWage: Number(e.target.value) })
                        }
                    />
                </label>

                <ul className="month__days">
                    {rows.map((r) => (
                        <li
                            key={r.iso}
                            className={`month__day ${r.val ? 'is-worked' : 'is-off'} ${r.isOff ? 'is-holiday' : ''
                                }`}
                        >
                            <span className="month__num">{r.d}</span>
                            <button
                                className="month__toggle"
                                disabled={r.isFuture}
                                onClick={() =>
                                    toggleDay(id, r.iso, r.val === 1 ? 0 : 1)
                                }
                            >
                                {r.val}
                            </button>
                        </li>
                    ))}
                </ul>
            </main>
        </div>
    );
}
