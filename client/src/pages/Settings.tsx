import { useRef, useState } from 'react';
import { useAuth } from '../auth/AuthContext';

export default function Settings() {
  const { user, updateProfile, changePassword } = useAuth();
  const [email, setEmail] = useState(user?.email ?? '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement | null>(null);

  const onSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    await updateProfile({ email });
    setMessage('Профиль обновлён');
  };

  const onChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    await changePassword({ currentPassword, newPassword });
    setCurrentPassword('');
    setNewPassword('');
    setMessage('Пароль изменён');
  };

  const onPickAvatar = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async () => {
      const dataUrl = reader.result as string;
      await updateProfile({ avatar: dataUrl });
      setMessage('Аватар обновлён');
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="container" style={{ maxWidth: 720 }}>
      <div className="grid" style={{ gridTemplateColumns: '1fr' }}>
        <div className="card">
          <h2 className="title">Настройки</h2>
          {message && <div className="muted">{message}</div>}
          <div style={{ display: 'flex', gap: 24, alignItems: 'center', marginTop: 12 }}>
            <img
              src={user?.avatar ?? 'data:image/svg+xml;utf8,<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"96\" height=\"96\"><rect width=\"100%\" height=\"100%\" fill=\"%231f2937\"/><text x=\"50%\" y=\"54%\" font-size=\"28\" text-anchor=\"middle\" fill=\"%239ca3af\">🙂</text></svg>'}
              alt="avatar"
              width={96}
              height={96}
              style={{ borderRadius: 12, border: '1px solid #1f2937' }}
            />
            <div>
              <input ref={fileRef} type="file" accept="image/*" onChange={onPickAvatar} />
              <button className="btn secondary" onClick={() => fileRef.current?.click()} type="button">Загрузить аватар</button>
            </div>
          </div>
          <div style={{ height: 16 }} />
          <form onSubmit={onSaveProfile} className="grid">
            <div className="field">
              <label className="muted">Email</label>
              <input value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <button className="btn" type="submit">Сохранить профиль</button>
          </form>
          <div style={{ height: 24 }} />
          <form onSubmit={onChangePassword} className="grid">
            <div className="field">
              <label className="muted">Текущий пароль</label>
              <input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} />
            </div>
            <div className="field">
              <label className="muted">Новый пароль</label>
              <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
            </div>
            <button className="btn" type="submit">Изменить пароль</button>
          </form>
        </div>
      </div>
    </div>
  );
}


