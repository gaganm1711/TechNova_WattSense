const Main = {
    init() {
        State.init();
        UI.bindEvents();
        ChartManager.initMainChart(document.getElementById('lossChart').getContext('2d'));
        VoiceAI.init();
        
        UI.renderDevices();
        this.recalculateAll(true);
    },

    recalculateAll(isInitial = false) {
        const metrics = Calculator.calculateAllMetrics(State.devices);
        
        if (isInitial) {
            State.initialCost = metrics.cost;
            State.currentCost = metrics.cost;
        }
        
        State.currentCost = metrics.cost;
        State.currentCO2 = metrics.co2;

        UI.updateInsights(metrics, State.devices);
        ChartManager.updateMainChart(metrics.activeDevices);
        
        // Simulating the Backend Fetch call for the FastAPI layer
        this.syncWithBackend(metrics);
    },

    handleDeviceToggle(id, isTurningOff) {
        const beforeCost = State.currentCost;
        
        // Update Local State
        State.toggleDevice(id, !isTurningOff);
        document.getElementById(`toggle-${id}`).checked = !isTurningOff;
        
        // Re-render
        this.recalculateAll();

        const saved = beforeCost - State.currentCost;
        if(isTurningOff && saved > 0) {
            UI.showSnapshot(beforeCost, State.currentCost);
        }
    },

    openModal(id) {
        const device = State.devices.find(d => d.id === id);
        if(device) UI.openModal(device);
    },

    startLiveTicker() {
        State.sessionTimer = setInterval(() => {
            // How much loss per 100ms
            const lossPer100ms = State.currentCost / (365 * 24 * 60 * 60 * 10);
            State.sessionLoss += lossPer100ms;
            UI.elements.liveTicker.innerText = `₹${State.sessionLoss.toFixed(4)} lost this session`;
        }, 100);
    },

    syncWithBackend(metrics) {
        // Fast-fail gracefully if FastAPI isn't running
        fetch("http://localhost:8000/api/devices/analyze", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ devices: State.devices })
        }).then(res => res.json()).then(data => {
            console.log("FastAPI Analysis:", data);
        }).catch(err => {
            // Expected failure if backend isn't mounted, frontend still fully functional.
        });
    }
};

document.addEventListener('DOMContentLoaded', () => {
    Main.init();
});
