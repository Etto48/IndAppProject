import random
from collections import defaultdict
import numpy as np
import matplotlib.pyplot as plt
from matplotlib import cm
from mpl_toolkits.mplot3d import Axes3D

# --- Simulation Config ---
GRID_SIZE_METERS = 100
AREA_SIZE_METERS = 5000  # Total area: 5000 x 5000 meters
GRID_CELLS = int(AREA_SIZE_METERS / GRID_SIZE_METERS)  # 50
NUM_CELLS = GRID_CELLS * GRID_CELLS  # 2500 cells
CACHE_DURATION_MINUTES = 3 * 24 * 60  # 3 days

# Number of simulation rounds for different densities
DENSITY_VALUES = list(range(100, 5001, 400))  # From 100 to 5,000 calls
SIMULATION_RUNS = 5  # Average across multiple runs for smoothing

# --- Distribution Models ---
DISTRIBUTION_MODELS = {
    "Urban": {"type": "gaussian", "mean": 2500, "std": 400},
    "Suburban": {"type": "uniform", "min": 0, "max": AREA_SIZE_METERS},
    "Downtown": {"type": "gaussian", "mean": 2500, "std": 150},
    "Tuscany": {
        "type": "composite",
        "cities": [
            {"name": "Florence", "center": (1500, 1500), "std": 300, "weight": 0.4},
            {"name": "Pisa", "center": (4000, 3500), "std": 250, "weight": 0.25},
            {"name": "Lucca", "center": (1000, 3000), "std": 200, "weight": 0.15},
        ],
        "suburban_weight": 0.2,
    }
}
JITTER_STRENGTH = 50 # small random offset in meters

# Helper
def get_grid_cell(x, y):
    return (int(x // GRID_SIZE_METERS), int(y // GRID_SIZE_METERS))

def get_coordinates(model_params):
    """Generates coordinates based on the specified distribution model."""
    model_type = model_params["type"]
    
    if model_type == "gaussian":
        mean, std = model_params["mean"], model_params["std"]
        x_base, y_base = random.gauss(mean, std), random.gauss(mean, std)
    
    elif model_type == "uniform":
        min_val, max_val = model_params["min"], model_params["max"]
        x_base, y_base = random.uniform(min_val, max_val), random.uniform(min_val, max_val)

    elif model_type == "composite":
        is_suburban = random.random() < model_params["suburban_weight"]
        if not is_suburban:
            cities = model_params["cities"]
            city_weights = [city["weight"] for city in cities]
            total_city_weight = sum(city_weights)
            normalized_weights = [w / total_city_weight for w in city_weights]
            
            chosen_city = random.choices(cities, weights=normalized_weights, k=1)[0]
            
            center_x, center_y = chosen_city["center"]
            std = chosen_city["std"]
            x_base, y_base = random.gauss(center_x, std), random.gauss(center_y, std)
        else:
            x_base, y_base = random.uniform(0, AREA_SIZE_METERS), random.uniform(0, AREA_SIZE_METERS)
            
    # Add jitter and clamp to bounds
    x = x_base + random.uniform(-JITTER_STRENGTH, JITTER_STRENGTH)
    y = y_base + random.uniform(-JITTER_STRENGTH, JITTER_STRENGTH)
    x = min(max(x, 0), AREA_SIZE_METERS - 1)
    y = min(max(y, 0), AREA_SIZE_METERS - 1)
    
    return x, y

def simulate_density(num_calls, model_params):
    heat_map = defaultdict(int)
    total_hits = 0
    total_calls = 0
    total_misses = 0

    for _ in range(SIMULATION_RUNS):
        cache = defaultdict(list)
        cache_hits = 0
        cache_misses = 0

        for _ in range(num_calls):
            timestamp = random.randint(0, CACHE_DURATION_MINUTES)
            x, y = get_coordinates(model_params)
            cell = get_grid_cell(x, y)

            cached_times = cache[cell]
            hit = any(timestamp - t <= CACHE_DURATION_MINUTES for t in cached_times)

            if hit:
                cache_hits += 1
            else:
                cache_misses += 1
                cache[cell].append(timestamp)

            heat_map[cell] += int(hit)

        total_hits += cache_hits
        total_misses += cache_misses
        total_calls += (cache_hits + cache_misses)

    average_hit_rate = (total_hits / total_calls) if total_calls else 0
    per_cell_avg_hits = {k: v / SIMULATION_RUNS for k, v in heat_map.items()}

    return average_hit_rate, per_cell_avg_hits, total_hits, total_misses

# --- Main Simulation Loop ---
all_hit_rates = {}

for model_name, model_params in DISTRIBUTION_MODELS.items():
    print(f"--- Running Simulation for {model_name} Distribution ---")
    
    hit_rates = []
    density_values = []
    grid_hit_matrix = np.zeros((GRID_CELLS, GRID_CELLS))
    
    # For plotting random points
    sample_coords = []

    for density in DENSITY_VALUES:
        print(f"Simulating density: {density} calls...")

        avg_hit_rate, per_cell_hits, _, _ = simulate_density(density, model_params)
        hit_rates.append(avg_hit_rate)
        density_values.append(density)

        for (x, y), hits in per_cell_hits.items():
            if 0 <= x < GRID_CELLS and 0 <= y < GRID_CELLS:
                grid_hit_matrix[y][x] += hits
        
        # Collect a sample of coordinates for the highest density plot
        if density == DENSITY_VALUES[-1]:
            for _ in range(200): # Sample 200 points
                sample_coords.append(get_coordinates(model_params))

    all_hit_rates[model_name] = hit_rates
    
    max_hits = np.max(grid_hit_matrix)
    grid_hit_matrix_normalized = grid_hit_matrix / max_hits if max_hits > 0 else grid_hit_matrix

    # --- 3D Plotting ---
    fig = plt.figure(figsize=(14, 9))
    ax = fig.add_subplot(111, projection='3d')

    X = np.arange(0, GRID_CELLS)
    Y = np.arange(0, GRID_CELLS)
    X, Y = np.meshgrid(X, Y)
    Z = grid_hit_matrix_normalized

    surf = ax.plot_surface(X, Y, Z, cmap=cm.viridis, rstride=1, cstride=1, linewidth=0, antialiased=False, alpha=0.8)
    
    # Plot sample points
    if sample_coords:
        xs, ys = zip(*sample_coords)
        grid_xs = [x / GRID_SIZE_METERS for x in xs]
        grid_ys = [y / GRID_SIZE_METERS for y in ys]
        ax.scatter(grid_ys, grid_xs, zs=1.0, zdir='z', c='red', s=10, label='Sample API Calls')

    ax.set_xlabel('Grid X (100m blocks)')
    ax.set_ylabel('Grid Y (100m blocks)')
    ax.set_zlabel('Normalized Cache Hit Probability')
    ax.set_title(f'Cache Hit Distribution for {model_name} Model')
    ax.legend()
    fig.colorbar(surf, shrink=0.5, aspect=5, label='Normalized Hit Rate')
    plt.tight_layout()
    plt.show()

# --- Summary Plot ---
plt.figure(figsize=(12, 7))
for model_name, rates in all_hit_rates.items():
    plt.plot(DENSITY_VALUES, [r * 100 for r in rates], marker='o', linestyle='-', label=model_name)

plt.title('Comparative Cache Hit Rate vs. API Request Density')
plt.xlabel('Number of API Requests (per area over 3 days)')
plt.ylabel('Cache Hit Rate / API Calls Saved (%)')
plt.legend()
plt.grid(True)
plt.tight_layout()
plt.show()

# --- Final Text Overview ---
print("\n--- Cache Performance Summary ---")

scenarios = {
    "Urban (City)": {"model": "Downtown", "calls": 5000},
    "Mid-Density": {"model": "Urban", "calls": 2500},
    "Rural": {"model": "Suburban", "calls": 500},
    "Tuscany Region": {"model": "Tuscany", "calls": 3000},
}

for name, scenario in scenarios.items():
    model_params = DISTRIBUTION_MODELS[scenario["model"]]
    num_calls = scenario["calls"]
    
    # Run a dedicated simulation for the summary
    _, _, total_hits, total_misses = simulate_density(num_calls, model_params)
    total_calls = total_hits + total_misses
    hit_rate_percent = (total_hits / total_calls * 100) if total_calls else 0
    miss_rate_percent = (total_misses / total_calls * 100) if total_calls else 0

    print(f"\n--- {name} Simulation ---")
    print(f"Total API Calls: {total_calls}")
    print(f"Cache Hits: {total_hits} ({hit_rate_percent:.2f}%)")
    print(f"Cache Misses: {total_misses} ({miss_rate_percent:.2f}%)")
    print(f"Estimated API Calls Saved: {hit_rate_percent:.2f}%")