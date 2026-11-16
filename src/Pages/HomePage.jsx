import { Link } from 'react-router-dom';
import './HomePage.css';
import { strings } from '../i18n';

export default function HomePage() {
    const t = strings['ar'];   // لاحقاً نخليها تتغير مع اللغة المختارة

    return (
        <div className="home">
            <h1 className="home__title">{t.appTitle}</h1>
            <nav className="home__menu">
                <Link className="home__btn" to="/log">
                    {t.expenses}
                </Link>
                <Link className="home__btn" to="/salon">
                    {t.salon}
                </Link>
            </nav>
        </div>
    );
}
