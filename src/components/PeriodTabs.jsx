import './PeriodTabs.css';

const KEYS = ['day', 'week', 'month', 'year'];

export default function PeriodTabs({ period, onChange, t }) {
    return (
        <nav className="tabs">
            {KEYS.map((k) => (
                <button
                    key={k}
                    className={`tabs__btn ${period === k ? 'is-active' : ''}`}
                    onClick={() => onChange(k)}
                >
                    {t[k]}
                </button>
            ))}
        </nav>
    );
}
