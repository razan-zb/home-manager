import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import './MonthPage.css';
import { strings } from '../i18n';
import { resolveDay } from '../lib/days';

export default function MonthPage({
    workers,
    toggleDay,
    editWorker,
    addLeave,
    removeLeave,
}) {
    const t = strings['ar'];
    const { id, month } = useParams();
    const navigate = useNavigate();
    const worker = workers.find((w) => w.id === id);

    const [leaveFrom, setLeaveFrom] = useState('');
    const [leaveTo, setLeaveTo] = useState('');

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
    const firstDay = new Date(y, m - 1, 1).getDay();
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let worked = 0;
    const rows = [];

    for (let d = 1; d <= daysInMonth; d++) {
        const date = new Date(y, m - 1, d);
        const iso = `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
        const isFuture = date > today;
        const { value, reason } = resolveDay(worker, iso, date);
        if (value === 1 && !isFuture) worked++;
        rows.push({ d, iso, value, reason, isFuture });
    }

    const monthLeaves = (worker.leaves || []).filter((l) =>
        l.from.startsWith(month) || l.to.startsWith(month)
    );

    function submitLeave(e) {
        e.preventDefault();
        if (!leaveFrom) return;
        addLeave(id, leaveFrom, leaveTo || leaveFrom);
        setLeaveFrom('');
        setLeaveTo('');
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

                <form className="month__leave" onSubmit={submitLeave}>
                    <div className="month__leave-row">
                        <label className="month__leave-field">
                            <span>{t.leaveFrom}</span>
                            <input
                                type="date"
                                value={leaveFrom}
                                onChange={(e) => setLeaveFrom(e.target.value)}
                            />
                        </label>
                        <label className="month__leave-field">
                            <span>{t.leaveTo}</span>
                            <input
                                type="date"
                                value={leaveTo}
                                onChange={(e) => setLeaveTo(e.target.value)}
                            />
                        </label>
                    </div>
                    <div className="month__actions">
                        <button type="submit" className="month__act month__act--leave">
                            {t.takeLeave}
                        </button>
                        <button
                            type="button"
                            className="month__act month__act--back"
                            onClick={() => {
                                if (leaveFrom) {
                                    addLeave(id, leaveFrom, leaveTo || leaveFrom);
                                    setLeaveFrom('');
                                    setLeaveTo('');
                                }
                            }}
                        >
                            {t.backToWork}
                        </button>
                    </div>
                </form>

                {monthLeaves.length > 0 && (
                    <ul className="month__leaves">
                        {monthLeaves.map((l, i) => (
                            <li key={`${l.from}-${l.to}-${i}`} className="month__leave-item">
                                <span>
                                    {l.from} ← {l.to}
                                </span>
                                <button
                                    className="month__leave-del"
                                    onClick={() => removeLeave(id, l.from, l.to)}
                                    aria-label={t.delete}
                                >
                                    🗑
                                </button>
                            </li>
                        ))}
                    </ul>
                )}

                <div className="month__weekdays">
                    {t.weekdays.map((wd) => (
                        <span key={wd} className="month__weekday">
                            {wd}
                        </span>
                    ))}
                </div>

                <ul className="month__days">
                    {Array.from({ length: firstDay }).map((_, i) => (
                        <li key={`pad-${i}`} className="month__day month__day--pad" />
                    ))}

                    {rows.map((r) => (
                        <li
                            key={r.iso}
                            className={`month__day month__day--${r.reason} ${r.value ? 'is-worked' : 'is-off'
                                }`}
                        >
                            <span className="month__num">{r.d}</span>
                            <button
                                className="month__toggle"
                                disabled={r.isFuture}
                                onClick={() =>
                                    toggleDay(id, r.iso, r.value === 1 ? 0 : 1)
                                }
                            >
                                {r.value}
                            </button>
                        </li>
                    ))}
                </ul>
            </main>
        </div>
    );
}
