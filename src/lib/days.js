export function resolveDay(worker, iso, date) {
    if (worker.days[iso] !== undefined) {
        return { value: worker.days[iso], reason: 'manual' };
    }
    if (iso < worker.startDate) {
        return { value: 0, reason: 'before' };
    }

    const onLeave = worker.leaveFrom && iso >= worker.leaveFrom;
    const back = worker.backFrom && iso >= worker.backFrom;

    // رجع للشغل: من backFrom وطالع = 1
    if (back) {
        // بس ناقص العطلة الأسبوعية
        if (worker.offDays.includes(date.getDay())) {
            return { value: 0, reason: 'holiday' };
        }
        return { value: 1, reason: 'work' };
    }

    // بعطلة: من leaveFrom وطالع = 0
    if (onLeave) {
        return { value: 0, reason: 'leave' };
    }

    if (worker.offDays.includes(date.getDay())) {
        return { value: 0, reason: 'holiday' };
    }
    return { value: 1, reason: 'work' };
}

export function monthSummary(worker, monthKey) {
    const [y, m] = monthKey.split('-').map(Number);
    const daysInMonth = new Date(y, m, 0).getDate();
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let worked = 0;
    for (let d = 1; d <= daysInMonth; d++) {
        const date = new Date(y, m - 1, d);
        if (date > today) break;
        const iso = `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
        if (resolveDay(worker, iso, date).value === 1) worked++;
    }
    return { worked, owed: worked * worker.dailyWage };
}
