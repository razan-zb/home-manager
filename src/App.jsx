import { useEffect, useState } from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import HomePage from './Pages/HomePage';
import LogPage from './Pages/LogPage';
import SalonPage from './Pages/SalonPage';
import WorkerPage from './Pages/WorkerPage';
import MonthPage from './Pages/MonthPage';

const WORKERS_KEY = 'home-manager-workers';

export default function App() {
    /* ---------- حالة العمال ---------- */
    const [workers, setWorkers] = useState(() => {
        try {
            return JSON.parse(localStorage.getItem(WORKERS_KEY)) || [];
        } catch {
            return [];
        }
    });

    useEffect(() => {
        localStorage.setItem(WORKERS_KEY, JSON.stringify(workers));
    }, [workers]);

    /* ---------- الدوال (كلها جوّا المكوّن) ---------- */

    function addWorker(worker) {
        setWorkers((prev) => [
            ...prev,
            {
                id: crypto.randomUUID(),
                days: {},
                offDays: [2],
                leaves: [],
                ...worker,
            },
        ]);
    }

    function toggleDay(id, iso, val) {
        setWorkers((prev) =>
            prev.map((w) =>
                w.id === id ? { ...w, days: { ...w.days, [iso]: val } } : w
            )
        );
    }

    function editWorker(id, patch) {
        setWorkers((prev) =>
            prev.map((w) => (w.id === id ? { ...w, ...patch } : w))
        );
    }

    // يضيف فترة عطلة من تاريخ لتاريخ
    function addLeave(id, from, to = from) {
        setWorkers((prev) =>
            prev.map((w) =>
                w.id === id
                    ? { ...w, leaves: [...(w.leaves || []), { from, to }] }
                    : w
            )
        );
    }

    // يحذف فترة عطلة محددة
    function removeLeave(id, from, to) {
        setWorkers((prev) =>
            prev.map((w) =>
                w.id === id
                    ? {
                        ...w,
                        leaves: (w.leaves || []).filter(
                            (l) => !(l.from === from && l.to === to)
                        ),
                    }
                    : w
            )
        );
    }


    /* ---------- الراوتر ---------- */
    return (
        <HashRouter>
            <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/log" element={<LogPage />} />
                <Route
                    path="/salon"
                    element={<SalonPage workers={workers} onAdd={addWorker} />}
                />
                <Route
                    path="/salon/:id"
                    element={<WorkerPage workers={workers} />}
                />
                <Route
                    path="/salon/:id/:month"
                    element={
                        <MonthPage
                            workers={workers}
                            toggleDay={toggleDay}
                            editWorker={editWorker}
                            addLeave={addLeave}
                            removeLeave={removeLeave}
                        />

                    }
                />
            </Routes>
        </HashRouter>
    );
}
