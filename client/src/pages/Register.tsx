import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      await register(email, password);
      navigate('/');
    } catch (err) {
      setError('Ошибка регистрации');
    }
  };

  return (
    <div className="container" style={{ maxWidth: 520 }}>
      <div className="card">
        <h2 className="title">Регистрация</h2>
        <form onSubmit={onSubmit} className="grid">
          <div className="field">
            <label className="muted">Email</label>
            <input placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div className="field">
            <label className="muted">Пароль</label>
            <input placeholder="••••••••" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>
          {error && <div style={{ color: '#ef4444' }}>{error}</div>}
          <button className="btn" type="submit">Зарегистрироваться</button>
          <div className="muted">Уже есть аккаунт? <Link to="/login">Войти</Link></div>
        </form>
      </div>
    </div>
  );
}


