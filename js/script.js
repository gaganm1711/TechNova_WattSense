document.addEventListener('DOMContentLoaded', () => {
    
    const scanned = JSON.parse(localStorage.getItem('ws_scanned_devs') || "[]");
    let devices = scanned.length > 0 ? scanned : [...APP_DATA.devices];
    let chartInstance = null;
    let initialTotalCost = 0;
    
    // Core Elements
    const totalLossEl = document.getElementById('total-loss');
    const totalCO2El = document.getElementById('total-co2');
    const scaleImpactValueEl = document.getElementById('scale-impact-value');
    
    const vampireNameEl = document.getElementById('vampire-name');
    const vampireCostEl = document.getElementById('vampire-cost');
    const vampireIconEl = document.getElementById('vampire-icon-element');
    
    const deviceListEl = document.getElementById('device-list');
    const bestActionTextEl = document.getElementById('best-action-text');
    const autoFixBtn = document.getElementById('auto-fix-btn');
    const recoveryTextEl = document.getElementById('recovery-text');
    
    // Snapshot Overlay Elements
    const snapshotOverlay = document.getElementById('snapshot-overlay');
    const snapBeforeEl = document.getElementById('snap-before');
    const snapAfterEl = document.getElementById('snap-after');
    const snapSavedEl = document.getElementById('snap-saved');
    
    // Gamification & Extras
    const efficiencyScoreEl = document.getElementById('efficiency-score');
    const userLevelEl = document.getElementById('user-level');
    const buyItemsEl = document.getElementById('buy-items');
    const leaderboardEl = document.getElementById('leaderboard');
    const liveLossTickerEl = document.getElementById('live-loss-ticker');

    let sessionLoss = 0;
    let baselineCost = 0; // For ticker calculation

    // Initialization
    function init() {
        renderSimulatorList();
        updateCalculations(true);
        startLiveTicker();
    }

    // Helper: Calculate Yearly Cost & CO2
    function calculateMetrics(watts) {
        const kwh = (watts * 24 * 365) / 1000;
        return {
            cost: kwh * APP_DATA.settings.electricityRate,
            co2: kwh * APP_DATA.settings.co2Factor
        };
    }

    // Primary state update loop
    function updateCalculations(isInitial = false) {
        let totalWatts = 0;
        let activeDevices = [];
        
        devices.forEach(dev => {
            if (dev.pluggedIn) {
                totalWatts += dev.standbyPowerW;
                activeDevices.push(dev);
            }
        });

        const totalMetrics = calculateMetrics(totalWatts);
        baselineCost = totalMetrics.cost;

        if (isInitial) {
            initialTotalCost = totalMetrics.cost;
        }

        // Animate total numbers
        animateValue(totalLossEl, parseInt(totalLossEl.innerText.replace('₹', '').replace(',', '')) || 0, Math.round(totalMetrics.cost), 500, '₹');
        totalCO2El.innerText = totalMetrics.co2.toFixed(1);
        
        // Scale Impact Line (1 million homes)
        const scaleCrores = (totalMetrics.cost * 1000000) / 10000000; // in Crores
        scaleImpactValueEl.innerText = scaleCrores.toFixed(1);

        // Update Energy Vampire
        if (activeDevices.length > 0) {
            const vampire = activeDevices.reduce((prev, current) => (prev.standbyPowerW > current.standbyPowerW) ? prev : current);
            const vampireMetrics = calculateMetrics(vampire.standbyPowerW);
            vampireNameEl.innerText = vampire.name;
            vampireCostEl.innerText = `₹${Math.round(vampireMetrics.cost)}`;
            vampireIconEl.className = `fa-solid fa-${vampire.icon}`;
            
            // Update Sticky Action
            bestActionTextEl.innerHTML = `Unplug <strong>${vampire.name}</strong> &rarr; <span class="text-green">Save ₹${Math.round(vampireMetrics.cost)}/year</span>`;
            autoFixBtn.onclick = () => { triggerToggle(vampire.id); };
            autoFixBtn.style.display = 'block';
        } else {
            vampireNameEl.innerText = "No Leaks Detected!";
            vampireCostEl.innerText = "₹0";
            vampireIconEl.className = "fa-solid fa-check";
            vampireIconEl.parentElement.style.color = "var(--accent-green)";
            
            bestActionTextEl.innerHTML = `You are running at peak efficiency!`;
            autoFixBtn.style.display = 'none';
        }

        // Calculate Gamification & Scores
        const savedAmount = initialTotalCost - totalMetrics.cost;
        const score = Math.min(100, 72 + Math.round((savedAmount / initialTotalCost) * 28) || 72);
        efficiencyScoreEl.innerText = score;
        
        if(score >= 95) userLevelEl.innerText = "Eco Hero";
        else if(score >= 85) userLevelEl.innerText = "Saver";
        else userLevelEl.innerText = "Beginner";
        
        // Update Recovery Insight (Time-to-recover)
        if (savedAmount > 0) {
            // E.g. we pretend that breaking habit takes 1 month focus, so savings accumulate quickly.
            // "You recover this loss in X months" => A psychological twist to show real impact.
            recoveryTextEl.innerHTML = `You've stopped <span class="text-green">₹${Math.round(savedAmount)}</span> going down the drain!`;
        } else {
            recoveryTextEl.innerHTML = `You recover standby loss instantly by unplugging. Zero cost to act.`;
        }

        updateChart();
        updateExtras(savedAmount);
    }

    function renderSimulatorList() {
        deviceListEl.innerHTML = '';
        devices.forEach(dev => {
            const devMetrics = calculateMetrics(dev.standbyPowerW);
            
            const div = document.createElement('div');
            div.className = 'device-item';
            div.innerHTML = `
                <div class="device-info">
                    <div class="icon"><i class="fa-solid fa-${dev.icon}"></i></div>
                    <div>
                        <div class="device-name">${dev.name}</div>
                        <div class="device-cost">₹${Math.round(devMetrics.cost)}/yr</div>
                    </div>
                </div>
                <label class="switch">
                    <input type="checkbox" id="toggle-${dev.id}" ${dev.pluggedIn ? 'checked' : ''} ${dev.ignoreForToggle ? 'disabled' : ''}>
                    <span class="slider"></span>
                </label>
            `;
            
            const checkbox = div.querySelector('input');
            if(!dev.ignoreForToggle) {
                checkbox.addEventListener('change', (e) => {
                    handleToggleEvent(dev.id, !e.target.checked);
                });
            }
            deviceListEl.appendChild(div);
        });
    }

    function triggerToggle(id) {
        // Toggle via button click
        const checkbox = document.getElementById(`toggle-${id}`);
        if(checkbox) {
            checkbox.checked = !checkbox.checked;
            handleToggleEvent(id, !checkbox.checked);
        }
    }

    function handleToggleEvent(id, isTurnedOff) {
        // Find device
        const idx = devices.findIndex(d => d.id === id);
        if(idx === -1) return;
        
        const devMetrics = calculateMetrics(devices[idx].standbyPowerW);
        const prevTotal = baselineCost;
        
        // Update state
        devices[idx].pluggedIn = !isTurnedOff;
        
        // Compute new metrics
        updateCalculations();
        
        const newTotal = baselineCost;
        const saved = prevTotal - newTotal;

        if(isTurnedOff && saved > 0) {
            showSnapshot(prevTotal, newTotal, saved);
        }
    }

    function showSnapshot(before, after, saved) {
        snapBeforeEl.innerText = `₹${Math.round(before)}`;
        snapAfterEl.innerText = `₹${Math.round(after)}`;
        snapSavedEl.innerText = `₹${Math.round(saved)}`;
        
        totalLossEl.classList.remove('text-red');
        totalLossEl.classList.add('text-green');
        setTimeout(() => {
            totalLossEl.classList.add('text-red');
            totalLossEl.classList.remove('text-green');
        }, 2500);

        snapshotOverlay.classList.remove('hidden');
        
        // Hide after 2 seconds
        setTimeout(() => {
            snapshotOverlay.classList.add('hidden');
        }, 2000);
    }

    function updateChart() {
        const activeDevices = devices.filter(d => d.pluggedIn && d.standbyPowerW > 0);
        
        const labels = activeDevices.map(d => d.name);
        const data = activeDevices.map(d => calculateMetrics(d.standbyPowerW).cost);
        
        if (chartInstance) {
            chartInstance.data.labels = labels;
            chartInstance.data.datasets[0].data = data;
            chartInstance.update();
        } else {
            const ctx = document.getElementById('lossChart').getContext('2d');
            chartInstance = new Chart(ctx, {
                type: 'doughnut',
                data: {
                    labels: labels,
                    datasets: [{
                        data: data,
                        backgroundColor: [
                            '#ff3b30', '#ff9500', '#0a84ff', '#ffcc00', '#5e5ce6', '#ff2d55'
                        ],
                        borderWidth: 2,
                        borderColor: '#151b2b'
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: { position: 'right', labels: { color: '#f8fafc' } }
                    },
                    cutout: '65%'
                }
            });
        }
    }

    function updateExtras(savedAmount) {
        buyItemsEl.innerHTML = '';
        APP_DATA.itemsToBuy.forEach(item => {
            const qty = Math.floor(savedAmount / item.cost);
            if (qty > 0) {
                const div = document.createElement('div');
                div.className = 'buy-item';
                div.innerHTML = `<i class="fa-solid fa-${item.icon}"></i> <span><strong>${qty}</strong> ${item.name}</span>`;
                buyItemsEl.appendChild(div);
            }
        });

        if (buyItemsEl.innerHTML === '') {
            buyItemsEl.innerHTML = '<span class="text-muted text-sm">Unplug devices to see what you can buy!</span>';
        }

        // Leaderboard Update
        APP_DATA.leaderboard.find(l => l.name === 'You').savings = savedAmount;
        let sortedLb = [...APP_DATA.leaderboard].sort((a, b) => b.savings - a.savings);
        
        leaderboardEl.innerHTML = '';
        sortedLb.forEach((entry, idx) => {
            const div = document.createElement('div');
            div.className = `lb-row ${entry.name === 'You' ? 'active' : ''}`;
            div.innerHTML = `<span>#${idx+1} ${entry.name}</span> <span>${entry.savings > 0 ? '+₹'+entry.savings : '₹'+entry.savings}</span>`;
            leaderboardEl.appendChild(div);
        });

        // Neighbor comparison removed.
    }

    function startLiveTicker() {
        setInterval(() => {
            // How much loss per milisecond
            // yearly cost / (365 * 24 * 60 * 60 * 10) for 100ms intervals
            const lossPer100ms = baselineCost / (365 * 24 * 60 * 60 * 10);
            sessionLoss += lossPer100ms;
            
            liveLossTickerEl.innerText = `₹${sessionLoss.toFixed(4)} lost in this session`;
        }, 100);
    }

    // Number animation utility
    function animateValue(obj, start, end, duration, prefix="") {
        let startTimestamp = null;
        const step = (timestamp) => {
            if (!startTimestamp) startTimestamp = timestamp;
            const progress = Math.min((timestamp - startTimestamp) / duration, 1);
            obj.innerHTML = prefix + Math.floor(progress * (end - start) + start);
            if (progress < 1) {
                window.requestAnimationFrame(step);
            }
        };
        window.requestAnimationFrame(step);
    }

    init();
});
