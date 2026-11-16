import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import './WorkerPage.css';
import { strings } from '../i18n';
import { monthSummary } from '../lib/days';

export default function WorkerPage({ workers, onDelete }) {
    const t = strings['ar'];
    const { id } = useParams();
    const navigate = useNavigate();
    const [confirming, setConfirming] = useState(false);
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

    const months = monthsSince(worker.startDate);

    function handleDelete() {
        if (!confirming) {
            setConfirming(true);   // كبسة أولى: اسألي
            return;
        }
        onDelete(id);              // كبسة تانية: احذفي
        navigate('/salon');
    }

    return (
        <div className="app">
            <header className="app__header">
                <div className="app__top">
                    <button className="app__lang" onClick={() => navigate('/salon')}>
                        ←
                    </button>
                    <div className="app__total">
                        <span className="app__total-label">{t.dailyWage}</span>
                        <span className="app__total-value">{worker.dailyWage}</span>
                    </div>
                    <button
                        className={`app__delete ${confirming ? 'is-confirming' : ''}`}
                        onClick={handleDelete}
                        aria-label={t.deleteWorker}
                    >
                        {confirming ? t.confirmShort : '🗑'}
                    </button>
                </div>

                <h1 className="app__title">{worker.name}</h1>
            </header>

            <main className="app__body">
                <ul className="list">
                    {months.map((m) => {
                        const sum = monthSummary(worker, m.key);
                        return (
                            <li key={m.key}>
                                <Link className="list__item" to={`/salon/${id}/${m.key}`}>
                                    <span className="list__name">{m.label}</span>
                                    <span className="list__count">
                                        {sum.worked} {t.daysShort} · {sum.owed}
                                    </span>
                                </Link>
                            </li>
                        );
                    })}
                </ul>
            </main>
        </div>
    );
}

function monthsSince(startIso) {
    const [sy, sm] = startIso.split('-').map(Number);
    const today = new Date();
    const out = [];
    let y = sy;
    let m = sm;

    while (y < today.getFullYear() || (y === today.getFullYear() && m <= today.getMonth() + 1)) {
        out.push({
            key: `${y}-${String(m).padStart(2, '0')}`,
            label: new Date(y, m - 1, 1).toLocaleDateString('ar', {
                month: 'long',
                year: 'numeric',
            }),
        });
        m++;
        if (m > 12) {
            m = 1;
            y++;
        }
    }
    return out.reverse();
}
