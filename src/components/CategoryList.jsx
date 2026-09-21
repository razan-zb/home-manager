import './CategoryList.css';

export default function CategoryList({ rows, t }) {
    if (!rows.length) return <p className="list__empty">{t.empty}</p>;

    return (
        <ul className="list">
            {rows.map(({ category, count }) => (
                <li key={category} className="list__item">
                    <span className="list__name">{category}</span>
                    <span className="list__count">
                        {count} {t.times}
                    </span>
                </li>
            ))}
        </ul>
    );
}
