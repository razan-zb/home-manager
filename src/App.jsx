import { useEffect, useMemo, useState } from 'react';
import './App.css';
import PeriodTabs from './components/PeriodTabs.jsx';
import AddButton from './components/AddButton.jsx';
import AddModal from './components/AddModal.jsx';
import CategoryList from './components/CategoryList.jsx';
import CategoryDetail from './components/CategoryDetail.jsx';
import { strings } from './i18n';

const STORAGE_KEY = 'home-manager-records';
const WEDDING = new Date(2026, 7, 4); // 4 آب 2026 (الشهر يبدأ من 0 → 7 = آب)

export default function App() {
    const [lang, setLang] = useState('ar');        // الأساس عربي
    const [period, setPeriod] = useState('day');
    const [showModal, setShowModal] = useState(false);
    const [selected, setSelected] = useState(null);
    const [married, setMarried] = useState(() => diffYMD(WEDDING, new Date()));

    const [records, setRecords] = useState(() => {
        try {
            return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
        } catch {
            return [];
        }
    });

    const t = strings[lang];
    const dir = lang === 'ar' ? 'rtl' : 'ltr';

    // اتجاه الصفحة واللغة
    useEffect(() => {
        document.documentElement.lang = lang;
        document.documentElement.dir = dir;
    }, [lang, dir]);

    // حفظ السجلات
    useEffect(() => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
    }, [records]);

    // تحديث مدة الزواج كل ساعة (يشتغل حتى لو خلّيت الصفحة مفتوحة لبكرا)
    useEffect(() => {
        const calc = () => setMarried(diffYMD(WEDDING, new Date()));
        calc();
        const id = setInterval(calc, 60 * 60 * 1000);
        return () => clearInterval(id);
    }, []);

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

        return Object.entries(groups)
            .map(([category, items]) => ({
                category,
                count: items.length,
                items: [...items].sort(
                    (a, b) => toLocalDate(b.date) - toLocalDate(a.date)
                ),
            }))
            .sort((a, b) => b.count - a.count);
    }, [records, period]);

    function deleteRecord(id) {
        setRecords((prev) => prev.filter((r) => r.id !== id));
    }

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
                        <span className="app__total-label">{t.daysMarried}</span>
                        <span className="app__total-value">
                            {formatDuration(married, t)}
                        </span>
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

/* ---------- دوال مساعدة ---------- */

// يرجع تاريخ محلي صافي (بلا UTC) — يحل مشكلة إزاحة اليوم
function toLocalDate(iso) {
    const [y, m, d] = iso.split('-').map(Number);
    return new Date(y, m - 1, d);
}

// الفرق بين تاريخين بصيغة { years, months, days }
function diffYMD(from, to) {
    const a = new Date(from);
    const b = new Date(to);
    a.setHours(0, 0, 0, 0);
    b.setHours(0, 0, 0, 0);

    let years = b.getFullYear() - a.getFullYear();
    let months = b.getMonth() - a.getMonth();
    let days = b.getDate() - a.getDate();

    if (days < 0) {
        months -= 1;
        // عدد أيام الشهر السابق لتاريخ b
        const prevMonthDays = new Date(b.getFullYear(), b.getMonth(), 0).getDate();
        days += prevMonthDays;
    }
    if (months < 0) {
        years -= 1;
        months += 12;
    }
    return { years, months, days };
}

// يحوّل المدة لنص أنيق حسب اللغة
function formatDuration({ years, months, days }, t) {
    const parts = [];
    if (years) parts.push(`${years} ${t.yearUnit}`);
    if (months) parts.push(`${months} ${t.monthUnit}`);
    if (days) parts.push(`${days} ${t.dayUnit}`);
    if (!parts.length) parts.push(`0 ${t.dayUnit}`);

    // العربي: "و" بين الأجزاء — الإنجليزي: فاصلة
    return parts.join(t.listJoin);
}

// يرجع مجال الفترة: { from, to } — كلاهما شاملان
function periodRange(period) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (period === 'day') {
        return { from: today, to: today };
    }

    if (period === 'week') {
        const day = today.getDay();              // 0=أحد … 6=سبت
        const from = new Date(today);
        from.setDate(today.getDate() - day);
        const to = new Date(from);
        to.setDate(from.getDate() + 6);
        return { from, to };
    }

    if (period === 'month') {
        const from = new Date(today.getFullYear(), today.getMonth(), 1);
        const to = new Date(today.getFullYear(), today.getMonth() + 1, 0);
        return { from, to };
    }

    if (period === 'year') {
        const from = new Date(today.getFullYear(), 0, 1);
        const to = new Date(today.getFullYear(), 11, 31);
        return { from, to };
    }

    return { from: today, to: today };
}
