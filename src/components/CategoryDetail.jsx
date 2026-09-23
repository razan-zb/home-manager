import './CategoryDetail.css';
export default function CategoryDetail({ category, t, onBack, onDelete }) {

export default function CategoryDetail({ category, t, onBack }) {
    if (!category) return null;

    return (
        <div className="detail">
            <div className="detail__head">
                <button className="detail__back" onClick={onBack}>
                    ←
                </button>
                <h2 className="detail__title">{category.category}</h2>
                <span className="detail__total">
                    {category.count} {t.times}
                </span>
            </div>

            <ul className="detail__list">
                {category.items.map((r) => (
                    <li key={r.id} className="detail__item">
                        <span className="detail__note">
                            {r.note || t.noNote}
                        </span>
                        <span className="detail__date">{formatDate(r.date)}</span>
                        <button
                            className="detail__delete"
                            onClick={() => {
                                if (confirm(t.confirmDelete)) onDelete(r.id);
                            }}

                            aria-label={t.delete}
                        >
                            🗑
                        </button>
                    </li>
                ))}
            </ul>

        </div>
    );
}

function formatDate(iso) {
    return new Date(iso).toLocaleDateString('ar-EG', {
        day: 'numeric', month: 'long', year: 'numeric',
    });
}
