import { useState } from 'react';
import './AddModal.css';

export default function AddModal({ t, onSave, onClose }) {
    const today = new Date().toISOString().slice(0, 10);
    const [category, setCategory] = useState('');
    const [date, setDate] = useState(today);
    const [note, setNote] = useState('');

    function submit(e) {
        e.preventDefault();
        if (!category.trim()) return;
        onSave({ category: category.trim(), date, note: note.trim() });
    }

    return (
        <div className="modal" onClick={onClose}>
            <form className="modal__box" onClick={(e) => e.stopPropagation()} onSubmit={submit}>
                <h2 className="modal__title">{t.addTitle}</h2>

                <label className="modal__label">{t.category}</label>
                <input
                    className="modal__input"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    placeholder={t.newCategory}
                    autoFocus
                />

                <label className="modal__label">{t.date}</label>
                <input
                    type="date"
                    className="modal__input"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                />

                <label className="modal__label">{t.note}</label>
                <input
                    className="modal__input"
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
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
