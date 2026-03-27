const ChartManager = {
    mainChart: null,
    modalChart: null,

    initMainChart(ctx) {
        this.mainChart = new Chart(ctx, {
            type: 'doughnut',
            data: { labels: [], datasets: [{ data: [], backgroundColor: ['#ff3b30', '#ff9500', '#0a84ff', '#ffcc00', '#5e5ce6'], borderWidth: 1, borderColor: '#151b2b' }] },
            options: { responsive: true, maintainAspectRatio: false, cutout: '70%', plugins: { legend: { position: 'right', labels: { color: '#f8fafc' } } } }
        });
    },

    updateMainChart(activeDevices) {
        if (!this.mainChart) return;
        const labels = activeDevices.map(d => d.name);
        const data = activeDevices.map(d => Calculator.getCost(Calculator.getYearlyWaste(d.standbyPowerW)));
        this.mainChart.data.labels = labels;
        this.mainChart.data.datasets[0].data = data;
        this.mainChart.update();
    },

    renderTimelineChart(ctx, device) {
        if (this.modalChart) this.modalChart.destroy();
        
        // Simulating curve: dailyCycle maps 100% idle vs 10% usage (where standby is bypassed) into Wasted Power metric
        const hours = Array.from({length: 24}, (_, i) => `${i}:00`);
        const wasteData = device.dailyCycle.map(val => (val / 100) * device.standbyPowerW); 

        this.modalChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: hours,
                datasets: [{
                    label: 'Standby Power Wasted (Watts)',
                    data: wasteData,
                    borderColor: '#ff3b30',
                    backgroundColor: 'rgba(255, 59, 48, 0.2)',
                    fill: true,
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    x: { ticks: { color: '#94a3b8' } },
                    y: { ticks: { color: '#94a3b8' } }
                },
                plugins: {
                    legend: { display: false }
                }
            }
        });
    }
};
