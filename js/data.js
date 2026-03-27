const APP_DATA = {
    settings: {
        electricityRate: 8.0, 
        co2Factor: 0.82 
    },
    // Adding room, dailyCycle (24h array of average % usage vs 100% standby), and tipContext
    devices: [
        { 
            id: 'dev-1', name: 'Set-top Box', icon: 'tv', standbyPowerW: 15, pluggedIn: true, 
            room: 'Living Room', 
            tipContext: "Unplug Set-top box at night when TV is off → save ₹1051/year without limiting viewing time.",
            dailyCycle: [100,100,100,100,100,100,100,10,10,10,100,100,100,100,10,10,10,10,10,10,10,10,100,100] // 100 = full standby loss (idle), 10 = in use
        },
        { 
            id: 'dev-2', name: 'Smart TV', icon: 'display', standbyPowerW: 5, pluggedIn: true, 
            room: 'Living Room',
            tipContext: "Use a smart power strip to kill TV standby globally.",
            dailyCycle: [100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,10,10,10,10,10,100,100]
        },
        { 
            id: 'dev-3', name: 'Phone Charger', icon: 'plug', standbyPowerW: 0.5, pluggedIn: true, 
            room: 'Bedroom',
            tipContext: "Unplugging chargers is a psychological win, saving ₹35 annually per charger.",
            dailyCycle: [10,10,10,10,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100]
        },
        { 
            id: 'dev-4', name: 'Microwave', icon: 'fire', standbyPowerW: 4, pluggedIn: true, 
            room: 'Kitchen',
            tipContext: "The microwave clock costs more energy to run all year than heating the food itself.",
            dailyCycle: [100,100,100,100,100,100,100,10,100,100,100,100,10,100,100,100,100,100,10,100,100,100,100,100]
        },
        { 
            id: 'dev-5', name: 'Wi-Fi Router', icon: 'wifi', standbyPowerW: 8, pluggedIn: true, 
            room: 'Living Room',
            tipContext: "Schedule router to turn off 1 AM - 6 AM while you sleep to conserve 5 hours of waste.",
            dailyCycle: [100,100,100,100,100,100,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,100,100]
        }
    ],
    itemsToBuy: [
        { name: 'Months of Netflix', cost: 199, icon: 'film' },
        { name: 'Swiggy Meals', cost: 150, icon: 'burger' },
        { name: 'Mobile Recharges', cost: 299, icon: 'mobile-screen' }
    ]
};
