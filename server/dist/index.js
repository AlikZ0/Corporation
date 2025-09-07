import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { randomUUID } from 'node:crypto';
const app = express();
app.use(cors());
app.use(express.json({ limit: '1mb' }));
const users = new Map();
const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret_change_me';
function signToken(payload) {
    return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}
function authMiddleware(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader)
        return res.status(401).json({ message: 'No token' });
    const [, token] = authHeader.split(' ');
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded;
        next();
    }
    catch (e) {
        return res.status(401).json({ message: 'Invalid token' });
    }
}
app.post('/api/auth/register', async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password)
        return res.status(400).json({ message: 'email and password required' });
    const exists = [...users.values()].some((u) => u.email === email);
    if (exists)
        return res.status(409).json({ message: 'Email already registered' });
    const id = randomUUID();
    const passwordHash = await bcrypt.hash(password, 10);
    const user = { id, email, passwordHash };
    users.set(id, user);
    const token = signToken({ id, email });
    return res.json({ token });
});
app.post('/api/auth/login', async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password)
        return res.status(400).json({ message: 'email and password required' });
    const user = [...users.values()].find((u) => u.email === email);
    if (!user)
        return res.status(401).json({ message: 'Invalid credentials' });
    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok)
        return res.status(401).json({ message: 'Invalid credentials' });
    const token = signToken({ id: user.id, email: user.email });
    return res.json({ token });
});
app.get('/api/me', authMiddleware, (req, res) => {
    const { id } = req.user;
    const user = users.get(id);
    if (!user)
        return res.status(404).json({ message: 'Not found' });
    const { email, avatarDataUrl } = user;
    res.json({ id, email, avatar: avatarDataUrl ?? null });
});
// Обновление профиля: email, avatarDataUrl (data:URL)
app.patch('/api/me', authMiddleware, async (req, res) => {
    const { id } = req.user;
    const user = users.get(id);
    if (!user)
        return res.status(404).json({ message: 'Not found' });
    const { email, avatar } = req.body;
    if (email) {
        const exists = [...users.values()].some((u) => u.email === email && u.id !== id);
        if (exists)
            return res.status(409).json({ message: 'Email already taken' });
        user.email = email;
    }
    if (avatar !== undefined) {
        if (avatar === null)
            user.avatarDataUrl = undefined;
        else if (typeof avatar === 'string' && avatar.startsWith('data:'))
            user.avatarDataUrl = avatar;
        else
            return res.status(400).json({ message: 'Invalid avatar' });
    }
    users.set(id, user);
    // Можно пере-выдать токен (на случай если в токене нужен email)
    const token = signToken({ id: user.id, email: user.email });
    return res.json({ ok: true, token });
});
// Смена пароля
app.post('/api/auth/change-password', authMiddleware, async (req, res) => {
    const { id } = req.user;
    const user = users.get(id);
    if (!user)
        return res.status(404).json({ message: 'Not found' });
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword)
        return res.status(400).json({ message: 'currentPassword and newPassword required' });
    const ok = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!ok)
        return res.status(401).json({ message: 'Invalid current password' });
    user.passwordHash = await bcrypt.hash(newPassword, 10);
    users.set(id, user);
    return res.json({ ok: true });
});
const port = Number(process.env.PORT) || 4000;
app.listen(port, () => {
    console.log(`Server listening on http://localhost:${port}`);
});
