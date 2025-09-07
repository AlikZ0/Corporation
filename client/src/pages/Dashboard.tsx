import { useAuth } from '../auth/AuthContext';

export default function Dashboard() {
  const { user } = useAuth();
  return (
    <div className="container">
      <div className="grid" style={{ gridTemplateColumns: '1fr' }}>
        <div className="card">
          <h2 className="title">Личный кабинет</h2>
          <div className="muted">Добро пожаловать!</div>
          <div style={{ height: 12 }} />
          <div className="grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
            <div>
              <div className="muted">User ID</div>
              <div>{user?.id}</div>
            </div>
            <div>
              <div className="muted">Email</div>
              <div>{user?.email}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


