def generate_insight(devices):
    always_on = [d for d in devices if d.get("pluggedIn") and d.get("standbyPowerW", 0) > 0]

    if len(always_on) >= 4:
        return "Your home has a constant energy leak pattern (24/7 devices active)."
    elif always_on:
        vampire = max(always_on, key=lambda d: d.get("standbyPowerW", 0))
        return f"Unplug your {vampire.get('name')} to eliminate your biggest energy leak."

    return "Peak Efficiency! 0 wasted energy."
