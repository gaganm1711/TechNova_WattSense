const UI = {
    elements: {
        landing: document.getElementById('landing-page'),
        dashboard: document.getElementById('dashboard'),
        demoBtn: document.getElementById('try-demo-btn'),
        totalLoss: document.getElementById('total-loss'),
        totalCO2: document.getElementById('total-co2'),
        devicesList: document.getElementById('device-list'),
        vampireName: document.getElementById('vampire-name'),
        vampireCost: document.getElementById('vampire-cost'),
        vampireIcon: document.getElementById('vampire-icon-element'),
        insightText: document.getElementById('insight-engine-text'),
        autoFixBtn: document.getElementById('auto-fix-btn'),
        savedPercent: document.getElementById('saved-percent'),
        progressFill: document.getElementById('progress-fill'),
        buyItems: document.getElementById('buy-items'),
        snapshot: document.getElementById('snapshot-overlay'),
        modal: document.getElementById('device-modal'),
        roomBreakdown: document.getElementById('room-breakdown'),
        efficiencyScore: document.getElementById('efficiency-score'),
        badgeLevel: document.getElementById('user-badge-level'),
        liveTicker: document.getElementById('live-loss-ticker')
    },

    bindEvents() {
        this.elements.demoBtn.addEventListener('click', () => {
            this.elements.landing.classList.remove('active');
            this.elements.landing.classList.add('hidden');
            setTimeout(() => {
                this.elements.dashboard.classList.remove('hidden');
                this.elements.dashboard.classList.add('active');
                if(!State.sessionTimer) Main.startLiveTicker();
            }, 500);
        });

        document.getElementById('close-modal-btn').addEventListener('click', () => {
            this.elements.modal.classList.add('hidden');
        });
    },

    renderDevices() {
        this.elements.devicesList.innerHTML = '';
        State.devices.forEach(dev => {
            const cost = Calculator.getCost(Calculator.getYearlyWaste(dev.standbyPowerW));
            
            const div = document.createElement('div');
            div.className = 'device-item glass-panel';
            div.innerHTML = `
                <div class="device-info" onclick="Main.openModal('${dev.id}')" style="pointer-events: auto; cursor: pointer; flex-grow: 1;">
                    <div class="icon" style="color: var(--accent-blue)"><i class="fa-solid fa-${dev.icon}"></i></div>
                    <div>
                        <div style="font-weight: 600;">${dev.name}</div>
                        <div class="text-sm text-muted">₹${Math.round(cost)}/yr • ${dev.room}</div>
                    </div>
                </div>
                <label class="switch">
                    <input type="checkbox" id="toggle-${dev.id}" ${dev.pluggedIn ? 'checked' : ''} onchange="Main.handleDeviceToggle('${dev.id}', !this.checked)">
                    <span class="slider"></span>
                </label>
            `;
            this.elements.devicesList.appendChild(div);
        });
    },

    updateInsights(metrics, devices) {
        // Hero Values
        this.animateValue(this.elements.totalLoss, parseInt(this.elements.totalLoss.innerText.replace(/\D/g, ''))||0, Math.round(metrics.cost), 500, '₹');
        this.elements.totalCO2.innerText = metrics.co2.toFixed(1);

        // Smart Engine Text
        const insight = Calculator.generateInsight(devices);
        this.elements.insightText.innerText = insight;

        // Vampire Detection
        if (metrics.activeDevices.length > 0) {
            const vampire = metrics.activeDevices.reduce((prev, cur) => prev.standbyPowerW > cur.standbyPowerW ? prev : cur);
            const vCost = Calculator.getCost(Calculator.getYearlyWaste(vampire.standbyPowerW));
            
            this.elements.vampireName.innerText = vampire.name;
            this.elements.vampireCost.innerText = `₹${Math.round(vCost)}`;
            this.elements.vampireIcon.className = `fa-solid fa-${vampire.icon}`;
            
            this.elements.autoFixBtn.style.display = 'block';
            this.elements.autoFixBtn.onclick = () => Main.handleDeviceToggle(vampire.id, true);
        } else {
            this.elements.vampireName.innerText = "No Leaks";
            this.elements.vampireCost.innerText = "₹0";
            this.elements.vampireIcon.className = "fa-solid fa-check";
            this.elements.autoFixBtn.style.display = 'none';
        }

        // Room breakdown
        const rooms = Calculator.getRoomStats(devices);
        this.elements.roomBreakdown.innerHTML = rooms.map(r => `<span class="room-tag">${r.room}: ${r.percent}%</span>`).join('');

        // Progress & Gamification
        const saved = State.initialCost - metrics.cost;
        let percent = State.initialCost > 0 ? (saved / State.initialCost) * 100 : 0;
        if(percent < 0) percent = 0;
        
        this.elements.savedPercent.innerText = Math.round(percent) + '%';
        this.elements.progressFill.style.width = percent + '%';
        
        const score = Math.round(50 + (percent/2));
        this.elements.efficiencyScore.innerText = score;
        if(percent > 60) this.elements.badgeLevel.innerText = "Eco Hero";
        else if(percent > 20) this.elements.badgeLevel.innerText = "Saver";
        else this.elements.badgeLevel.innerText = "Beginner";
    },

    showSnapshot(before, after) {
        document.getElementById('snap-before').innerText = `₹${Math.round(before)}`;
        document.getElementById('snap-after').innerText = `₹${Math.round(after)}`;
        document.getElementById('snap-saved').innerText = `₹${Math.round(before - after)}`;
        
        this.elements.snapshot.classList.remove('hidden');
        setTimeout(() => this.elements.snapshot.classList.add('hidden'), 2500);
    },

    openModal(device) {
        document.getElementById('modal-name').innerText = device.name;
        document.getElementById('modal-room').innerText = device.room;
        document.getElementById('modal-icon').className = `fa-solid fa-${device.icon}`;
        document.getElementById('modal-tip-context').innerHTML = `<i class="fa-solid fa-lightbulb text-gold"></i> ${device.tipContext}`;
        
        const kwhYear = Calculator.getYearlyWaste(device.standbyPowerW);
        const costYear = Calculator.getCost(kwhYear);
        
        document.getElementById('modal-yearly').innerText = `₹${Math.round(costYear)}`;
        document.getElementById('modal-monthly').innerText = `₹${Math.round(costYear/12)}`;
        document.getElementById('modal-daily').innerText = `₹${(costYear/365).toFixed(2)}`;

        this.elements.modal.classList.remove('hidden');
        
        // Render timeline
        const ctx = document.getElementById('timelineChart').getContext('2d');
        ChartManager.renderTimelineChart(ctx, device);
    },

    animateValue(obj, start, end, duration, prefix) {
        let startTimestamp = null;
        const step = (timestamp) => {
            if (!startTimestamp) startTimestamp = timestamp;
            const progress = Math.min((timestamp - startTimestamp) / duration, 1);
            obj.innerHTML = prefix + Math.floor(progress * (end - start) + start);
            if (progress < 1) window.requestAnimationFrame(step);
        };
        window.requestAnimationFrame(step);
    }
};
