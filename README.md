# WattSense – AI-based green energy estimator

## Project Overview
**WattSense AI** is an interactive web platform that helps users identify **hidden energy consumption** (phantom power) from household appliances. Many devices draw electricity even when turned off or in standby mode, leading to unnecessary energy waste, higher bills, and increased carbon footprint.  

Our platform estimates the **monthly energy cost and CO₂ emissions** for appliances, visualizes the biggest energy vampires, and provides **actionable energy-saving recommendations**.

---

## Features

### Core MVP Features
1. **Appliance Selection**
   - Users can select multiple appliances from a dropdown menu.
   - The platform calculates **phantom power consumption** for each selected appliance.

2. **Energy Calculation**
   - Standby power is converted into **annual energy usage (kWh)**.
   - Cost is calculated based on the user’s local electricity rate.
   - CO₂ emissions are estimated using average grid emission factors.

3. **Visualization Dashboard**
   - Bar charts and pie charts display **appliance-wise energy waste**.
   - Highlights the **biggest energy vampires** in the household.

4. **Energy-Saving Recommendations**
   - Suggestions like “Unplug idle chargers,” “Turn off TV standby,” or “Use smart power strips” to reduce waste.

### Advanced/Optional Features
- **Appliance Image Detection**: Users can upload a photo of the appliance; AI detects its type and size to estimate energy consumption automatically.
- **Electricity Bill Upload**: Users can upload bills, and the platform analyzes total consumption to compare with estimated phantom power usage.
- **Interactive Savings Simulator**: Users toggle appliances on/off to see **live updates on cost and CO₂ savings**.

---

## How It Works

1. **User Input**
   - Select appliances manually.
   - Enter electricity rate (₹/kWh) or upload electricity bill.

2. **Backend Processing**
   - **Appliance Database**: Contains standby power data.
   - **Energy Calculator**: Computes annual phantom energy consumption and cost.
   - **Carbon Emission Module**: Converts energy usage into CO₂ emissions.
   - **Recommendation Engine**: Generates tips to reduce energy waste.

3. **Formula Used**
   - Energy Consumption(kWh) = power(W) * 24 * number of days (based on month) / 1000
   - Cost Estimation = Energy Consumption * electricity per unit
   - 1kWh = 0.82kg Oxygen (India)
   - Carbon Emission = Energy Consumption * 0.82

4. **Visualization**
   - Displays charts showing energy consumption, cost, and carbon footprint.
   - Highlights the most energy-consuming appliances for easy understanding.

---

## Tech Stack

- **Frontend**: React, ShadCN Components, chart.js for data visualization
- **Backend**: Flask(Python)
- **AI/OCR Modules**: GROQ(Llama-3.0-70b-versatile)
- **Database**: MongoDB
---

## Installation & Setup

1. Clone the repository:

```bash
git clone https://github.com/gaganm1711/TechNova_WattSense.git
cd TechNova_WattSense
