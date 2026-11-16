import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import './MonthPage.css';
import { strings } from '../i18n';
import { resolveDay } from '../lib/days';

export default function MonthPage({
    workers,
    toggleDay,
    editWorker,
    goOnLeave,
    backToWork,
}) {
    const t = strings['ar'];
    const { id, month } = useParams();
    const navigate = useNavigate();
    const worker = workers.find((w) => w.id === id);

    // تاريخ بداية العطلة اللي تختاريه أنت
    const [leaveDate, setLeaveDate] = useState(`${month}-01`);
    // تاريخ الرجوع
    const [backDate, setBackDate] = useState(`${month}-01`);

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

                <div className="month__leave-box">
                    {worker.onLeave ? (
                        <>
                            <div className="month__status">
                                <span className="month__badge is-leave">
                                    {t.onLeaveSince} {worker.leaveFrom}
                                </span>
                            </div>
                            <label className="month__leave-field">
                                <span>{t.backDateLabel}</span>
                                <input
                                    type="date"
                                    value={backDate}
                                    onChange={(e) => setBackDate(e.target.value)}
                                />
                            </label>
                            <button
                                className="month__act month__act--back"
                                onClick={() => backToWork(id, backDate)}
                            >
                                {t.backToWork}
                            </button>
                        </>
                    ) : (
                        <>
                            <label className="month__leave-field">
                                <span>{t.leaveFromLabel}</span>
                                <input
                                    type="date"
                                    value={leaveDate}
                                    onChange={(e) => setLeaveDate(e.target.value)}
                                />
                            </label>
                            <button
                                className="month__act month__act--leave"
                                onClick={() => goOnLeave(id, leaveDate)}
                            >
                                {t.takeLeave}
                            </button>
                        </>
                    )}
                </div>

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
