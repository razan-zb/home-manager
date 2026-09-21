import { useEffect, useMemo, useState } from 'react';
import './App.css';
import PeriodTabs from './components/PeriodTabs.jsx';
import AddButton from './components/AddButton.jsx';
import AddModal from './components/AddModal.jsx';
import CategoryList from './components/CategoryList.jsx';
import { strings } from './i18n';

const STORAGE_KEY = 'home-manager-records';

export default function App() {
    const [lang, setLang] = useState('ar');        // الأساس عربي
    const [period, setPeriod] = useState('day');
    const [showModal, setShowModal] = useState(false);
    const [records, setRecords] = useState(() => {
        try {
            return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
        } catch {
            return [];
        }
    });

    const t = strings[lang];
    const dir = lang === 'ar' ? 'rtl' : 'ltr';

    useEffect(() => {
        document.documentElement.lang = lang;
        document.documentElement.dir = dir;
    }, [lang, dir]);

    useEffect(() => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
    }, [records]);

    // فلترة حسب الفترة + التجميع
    const rows = useMemo(() => {
        const from = periodStart(period);
        const inRange = records.filter((r) => new Date(r.date) >= from);

        const counts = {};
        for (const r of inRange) {
            counts[r.category] = (counts[r.category] || 0) + 1;
        }
        return Object.entries(counts)
            .sort((a, b) => b[1] - a[1])
            .map(([category, count]) => ({ category, count }));
    }, [records, period]);

    const total = rows.reduce((sum, r) => sum + r.count, 0);

    function addRecord(record) {
        setRecords((prev) => [
            ...prev,
            { ...record, id: crypto.randomUUID() },
        ]);
        setShowModal(false);
    }

    return (
        <div className="app" dir={dir}>
            <header className="app__header">
                <div className="app__top">
                    <button
                        className="app__lang"
                        onClick={() => setLang((l) => (l === 'ar' ? 'en' : 'ar'))}
                    >
                        {lang === 'ar' ? 'EN' : 'عربي'}
                    </button>
                    <div className="app__total">
                        <span className="app__total-label">{t.total}</span>
                        <span className="app__total-value">{total}</span>
                    </div>
                </div>
                <h1 className="app__title">{t.expenses}</h1>
            </header>

            <PeriodTabs period={period} onChange={setPeriod} t={t} />

            <main className="app__body">
                <CategoryList rows={rows} t={t} />
            </main>

            <AddButton onClick={() => setShowModal(true)} label={t.add} />

            {showModal && (
                <AddModal
                    t={t}
                    onSave={addRecord}
                    onClose={() => setShowModal(false)}
                />
            )}
        </div>
    );
}

// بداية الفترة المختارة (من اليوم الحالي للخلف)
function periodStart(period) {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    if (period === 'day') return d;
    if (period === 'week') d.setDate(d.getDate() - 7);
    else if (period === 'month') d.setMonth(d.getMonth() - 1);
    else if (period === 'year') d.setFullYear(d.getFullYear() - 1);
    return d;
}
