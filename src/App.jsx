import { useEffect, useMemo, useState } from 'react';
import './App.css';
import PeriodTabs from './components/PeriodTabs.jsx';
import AddButton from './components/AddButton.jsx';
import AddModal from './components/AddModal.jsx';
import CategoryList from './components/CategoryList.jsx';
import CategoryDetail from './components/CategoryDetail.jsx';

import { strings } from './i18n';

const STORAGE_KEY = 'home-manager-records';

export default function App() {
    const [lang, setLang] = useState('ar');        // الأساس عربي
    const [period, setPeriod] = useState('day');
    const [showModal, setShowModal] = useState(false);
    const [selected, setSelected] = useState(null); // اسم الفئة المفتوحة

    const [records, setRecords] = useState(() => {
        try {
            return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
        } catch {
            return [];
        }
    });

    const t = strings[lang];
    const dir = lang === 'ar' ? 'rtl' : 'ltr';


    function deleteRecord(id) {
        setRecords((prev) => prev.filter((r) => r.id !== id));
    }

    useEffect(() => {
        document.documentElement.lang = lang;
        document.documentElement.dir = dir;
    }, [lang, dir]);

    useEffect(() => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
    }, [records]);

    const rows = useMemo(() => {
        const from = periodStart(period);
        const inRange = records.filter((r) => new Date(r.date) >= from);

        const groups = {};
        for (const r of inRange) {
            if (!groups[r.category]) groups[r.category] = [];
            groups[r.category].push(r);
        }

        return Object.entries(groups)
            .map(([category, items]) => ({
                category,
                count: items.length,
                items: items.sort((a, b) => new Date(b.date) - new Date(a.date)), // الأحدث أول
            }))
            .sort((a, b) => b.count - a.count);
    }, [records, period]);

    const WEDDING = new Date(2026, 7, 4); // 4 أغسطس 2026 — الشهر يبدأ من 0 فـ 7 = آب

    const total = useMemo(() => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const ms = today - WEDDING;
        return Math.floor(ms / (1000 * 60 * 60 * 24)); // عدد الأيام الكاملة
    }, []);

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
                {selected ? (
                    <CategoryDetail
                        category={rows.find((r) => r.category === selected)}
                        t={t}
                        onBack={() => setSelected(null)}
                        onDelete={deleteRecord}
                    />

                ) : (
                    <CategoryList rows={rows} t={t} onSelect={setSelected} />
                )}
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
