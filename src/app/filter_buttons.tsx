"use client";

function FilterIcon({ category, active }: { category: string, active?: boolean }) {
    let iconUrl = {
        all: './globe.svg',
        restaurant: './restaurant.svg',
        hotel: './hotel.svg',
    }[category] || './unknown.svg';

    // Active icons for restaurant and hotel are available, but not for globe.
    // Let's check if the active version exists, otherwise use the normal one.
    // A better approach would be to have consistent icon sets.
    if (active) {
        if (category === 'restaurant' || category === 'hotel') {
            iconUrl = iconUrl.replace('.svg', '_active.svg');
        }
    }

    return (
        <img src={iconUrl} alt={category} />
    );
}

type FilterButtonsProps = {
    filter: string,
    setFilter: (filter: string) => void
};

export default function FilterButtons({ filter, setFilter }: FilterButtonsProps) {
    const filters = ['all', 'hotel', 'restaurant'];

    return (
        <div className="filter-buttons-container">
            {filters.map((f) => (
                <button
                    key={f}
                    className={`filter-button ${filter === f ? "active" : ""}`}
                    onClick={() => setFilter(f)}
                >
                    <div className="filter-button-wrapper">
                        <FilterIcon category={f} active={filter === f} />
                    </div>
                </button>
            ))}
        </div>
    );
}
