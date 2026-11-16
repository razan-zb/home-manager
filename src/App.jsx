import { useEffect, useState } from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import LogPage from './pages/LogPage';
import SalonPage from './pages/SalonPage';
import WorkerPage from './pages/WorkerPage';
import MonthPage from './pages/MonthPage';

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

    /* ---------- الدوال ---------- */
    function addWorker(worker) {
        setWorkers((prev) => [
            ...prev,
            {
                id: crypto.randomUUID(),
                days: {},
                offDays: [2],
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
                        />
                    }
                />
            </Routes>
        </HashRouter>
    );
}
