import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './SalonPage.css';
import { strings } from '../i18n';

export default function SalonPage({ workers, onAdd }) {
    const t = strings['ar'];
    const navigate = useNavigate();
    const [showForm, setShowForm] = useState(false);

    return (
        <div className="app">
            <header className="app__header">
                <div className="app__top">
                    <button className="app__lang" onClick={() => navigate('/')}>
                        ←
                    </button>
                    <div className="app__total">
                        <span className="app__total-label">{t.workersCount}</span>
                        <span className="app__total-value">{workers.length}</span>
                    </div>
                    <span style={{ width: 44 }} />
                </div>
                <h1 className="app__title">{t.salon}</h1>
            </header>

            <main className="app__body">
                {workers.length === 0 ? (
                    <p className="list__empty">{t.noWorkers}</p>
                ) : (
                    <ul className="list">
                        {workers.map((w) => (
                            <li key={w.id}>
                                <Link className="list__item" to={`/salon/${w.id}`}>
                                    <span className="list__name">{w.name}</span>
                                    <span className="list__count">{w.dailyWage}</span>
                                </Link>
                            </li>
                        ))}
                    </ul>
                )}
            </main>

            <button
                className="fab"
                onClick={() => setShowForm(true)}
                aria-label={t.addWorker}
            >
                +
            </button>

            {showForm && (
                <AddWorkerForm
                    t={t}
                    onSave={(w) => {
                        onAdd(w);
                        setShowForm(false);
                    }}
                    onClose={() => setShowForm(false)}
                />
            )}
        </div>
    );
}

function AddWorkerForm({ t, onSave, onClose }) {
    const today = new Date().toISOString().slice(0, 10);
    const [name, setName] = useState('');
    const [wage, setWage] = useState('');
    const [startDate, setStartDate] = useState(today);

    function submit(e) {
        e.preventDefault();
        if (!name.trim() || !wage) return;
        onSave({
            name: name.trim(),
            dailyWage: Number(wage),
            startDate,
        });
    }

    return (
        <div className="modal" onClick={onClose}>
            <form
                className="modal__box"
                onClick={(e) => e.stopPropagation()}
                onSubmit={submit}
            >
                <h2 className="modal__title">{t.addWorker}</h2>

                <label className="modal__label">{t.workerName}</label>
                <input
                    className="modal__input"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    autoFocus
                />

                <label className="modal__label">{t.dailyWage}</label>
                <input
                    className="modal__input"
                    type="number"
                    value={wage}
                    onChange={(e) => setWage(e.target.value)}
                />

                <label className="modal__label">{t.startDate}</label>
                <input
                    className="modal__input"
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                />

                <div className="modal__actions">
                    <button type="button" className="modal__btn" onClick={onClose}>
                        {t.cancel}
                    </button>
                    <button type="submit" className="modal__btn modal__btn--primary">
                        {t.save}
                    </button>
                </div>
            </form>
        </div>
    );
}
