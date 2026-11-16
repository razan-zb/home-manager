import './CategoryList.css';
export default function CategoryList({ rows, t, onSelect }) {
    if (!rows.length) return <p className="list__empty">{t.empty}</p>;

    return (
        <ul className="list">
            {rows.map(({ category, count }) => (
                <li key={category}>
                    <button className="list__item" onClick={() => onSelect(category)}>
                        <span className="list__name">{category}</span>
                        <span className="list__count">
                            {count} {t.times}
                        </span>
                    </button>
                </li>
            ))}
        </ul>
    );
}

