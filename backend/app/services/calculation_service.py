def calculate_metrics(devices, rate=8.0, co2_factor=0.82):
    total_cost = 0
    total_co2 = 0

    for d in devices:
        if d.get("pluggedIn"):
            energy = (d.get("standbyPowerW", 0) * 24 * 365) / 1000
            cost = energy * rate
            co2 = energy * co2_factor

            total_cost += cost
            total_co2 += co2

    return {
        "total_cost": round(total_cost, 2),
        "total_co2": round(total_co2, 2)
    }
