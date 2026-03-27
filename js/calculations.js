const Calculator = {
    getYearlyWaste(watts) {
        return (watts * 24 * 365) / 1000;
    },

    getCost(kwh) {
        return kwh * APP_DATA.settings.electricityRate;
    },

    getCO2(kwh) {
        return kwh * APP_DATA.settings.co2Factor;
    },

    calculateAllMetrics(devices) {
        let totalWatts = 0;
        let activeDevices = [];

        devices.forEach(d => {
            if (d.pluggedIn) {
                totalWatts += d.standbyPowerW;
                activeDevices.push(d);
            }
        });

        const kwh = this.getYearlyWaste(totalWatts);
        return {
            cost: this.getCost(kwh),
            co2: this.getCO2(kwh),
            activeDevices
        };
    },

    // AI Insight rules
    generateInsight(devices) {
        const alwaysOn = devices.filter(d => d.pluggedIn && d.standbyPowerW > 0);
        if (alwaysOn.length >= 4) {
            return "Your home has a constant energy leak pattern (24/7 devices active).";
        } else if (alwaysOn.length > 0) {
            const vampire = alwaysOn.reduce((prev, cur) => prev.standbyPowerW > cur.standbyPowerW ? prev : cur);
            return `Unplug your ${vampire.name} to see maximum instant savings.`;
        }
        return "Peak Efficiency! 0 wasted energy.";
    },

    getRoomStats(devices) {
        let rooms = {};
        let totalStats = 0;
        
        devices.forEach(d => {
            if (d.pluggedIn) {
                rooms[d.room] = (rooms[d.room] || 0) + d.standbyPowerW;
                totalStats += d.standbyPowerW;
            }
        });

        return Object.keys(rooms).map(room => {
            return {
                room: room,
                percent: totalStats > 0 ? Math.round((rooms[room] / totalStats) * 100) : 0
            }
        });
    }
};
