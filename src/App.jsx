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
        const { from, to } = periodRange(period);
        const inRange = records.filter((r) => {
            const d = toLocalDate(r.date);
            return d >= from && d <= to;
        });

        const groups = {};
        for (const r of inRange) {
            if (!groups[r.category]) groups[r.category] = [];
            groups[r.category].push(r);
        }
        // ... باقي التجميع زي ما هو
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

// يرجع تاريخ محلي صافي (بلا UTC) — يحل مشكلة إزاحة اليوم
function toLocalDate(iso) {
    const [y, m, d] = iso.split('-').map(Number);
    return new Date(y, m - 1, d);
}

// يرجع مجال الفترة: { from, to } — كلاهما شاملان
function periodRange(period) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (period === 'day') {
        return { from: today, to: today };
    }

    if (period === 'week') {
        // الأسبوع يبدأ أحد (0) وينتهي سبت (6)
        const day = today.getDay();              // 0=أحد … 6=سبت
        const from = new Date(today);
        from.setDate(today.getDate() - day);     // رجوع للأحد
        const to = new Date(from);
        to.setDate(from.getDate() + 6);          // السبت
        return { from, to };
    }

    if (period === 'month') {
        // نفس الشهر الحالي (أول يوم ← آخر يوم)
        const from = new Date(today.getFullYear(), today.getMonth(), 1);
        const to = new Date(today.getFullYear(), today.getMonth() + 1, 0);
        return { from, to };
    }

    if (period === 'year') {
        // نفس السنة الحالية
        const from = new Date(today.getFullYear(), 0, 1);
        const to = new Date(today.getFullYear(), 11, 31);
        return { from, to };
    }

    return { from: today, to: today };
}
