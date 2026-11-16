import './AddButton.css';

export default function AddButton({ onClick, label }) {
    return (
        <button className="fab" onClick={onClick} aria-label={label}>
            +
        </button>
    );
}
