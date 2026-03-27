const State = {
    devices: [],
    initialCost: 0,
    currentCost: 0,
    currentCO2: 0,
    savedPercentage: 0,
    sessionTimer: 0,
    sessionLoss: 0,
    
    init() {
        this.devices = JSON.parse(JSON.stringify(APP_DATA.devices)); // Deep copy
    },

    toggleDevice(id, forcePluggedIn = null) {
        const device = this.devices.find(d => d.id === id);
        if(!device) return null;
        
        device.pluggedIn = forcePluggedIn !== null ? forcePluggedIn : !device.pluggedIn;
        return device;
    },

    getActiveDevices() {
        return this.devices.filter(d => d.pluggedIn);
    }
};
