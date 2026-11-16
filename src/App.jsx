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
    function deleteWorker(id) {
        setWorkers((prev) => prev.filter((w) => w.id !== id));
    }


    function editWorker(id, patch) {
        setWorkers((prev) =>
            prev.map((w) => (w.id === id ? { ...w, ...patch } : w))
        );
    }


    function goOnLeave(id, fromIso) {
        setWorkers((prev) =>
            prev.map((w) =>
                w.id === id ? { ...w, leaveFrom: fromIso, backFrom: null } : w
            )
        );
    }

    function backToWork(id, iso) {
        setWorkers((prev) =>
            prev.map((w) => (w.id === id ? { ...w, backFrom: iso } : w))
        );
    }

    function clearLeave(id) {
        setWorkers((prev) =>
            prev.map((w) =>
                w.id === id ? { ...w, leaveFrom: null, backFrom: null } : w
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
                    element={<WorkerPage workers={workers} onDelete={deleteWorker} />}
                />

                <Route
                    path="/salon/:id/:month"
                    element={
                        <MonthPage
                            workers={workers}
                            toggleDay={toggleDay}
                            editWorker={editWorker}
                            goOnLeave={goOnLeave}
                            backToWork={backToWork}
                            clearLeave={clearLeave}
                        />




                    }
                />
            </Routes>
        </HashRouter>
    );
}
