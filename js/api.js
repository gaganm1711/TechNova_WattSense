const API_BASE = 'http://localhost:8000/api';

const Session = {
    set(user) {
        localStorage.setItem('ws_user', JSON.stringify(user));
    },
    get() {
        let u = localStorage.getItem('ws_user');
        if (!u) {
            const demoUser = { user_id: "demo_user_1", name: "SIH Judge" };
            localStorage.setItem('ws_user', JSON.stringify(demoUser));
            return demoUser;
        }
        return JSON.parse(u);
    },
    logout() {
        localStorage.removeItem('ws_user');
        window.location.href = 'index.html';
    },
    requireAuth() {
        this.get(); // Instantly skips security and generates a session seamlessly
    }
};

const API = {
    async login(email, password) {
        const res = await fetch(`${API_BASE}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.detail || "Login failed");
        Session.set(data);
        return data;
    },

    async signup(firstName, lastName, email, password) {
        const res = await fetch(`${API_BASE}/auth/signup`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ firstName, lastName, email, password })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.detail || "Signup failed");
        Session.set(data);
        return data;
    },

    async uploadBillImage(formData) {
        const res = await fetch(`${API_BASE}/vision/bill`, {
            method: 'POST',
            body: formData
        });
        return await res.json();
    },

    async getDevices() {
        const user = Session.get();
        if (!user) return [];
        const res = await fetch(`${API_BASE}/devices/${user.user_id}`);
        return await res.json();
    },

    async toggleDevice(id, pluggedIn) {
        await fetch(`${API_BASE}/devices/toggle`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id, pluggedIn })
        });
    },

    async analyze(devicesArray) {
        const user = Session.get();
        const res = await fetch(`${API_BASE}/devices/analyze`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ user_id: user ? user.user_id : "", devices: devicesArray })
        });
        return await res.json();
    }
};
