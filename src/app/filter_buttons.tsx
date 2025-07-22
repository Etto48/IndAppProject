"use client";

function FilterOption({ category, icon, active, setFilter }: { category: string, icon: string, active: boolean, setFilter: (filter: string) => void }) {
    return (
        <button className={"filter-button " + (active ? "active" : "")} onClick={() => setFilter(category)}>
            <div className="filter-button-wrapper">
                <img src={icon} alt={category} />
            </div>
        </button>
    );
}

export default function FilterButtons({ filter, setFilter }: { filter: string, setFilter: (filter: string) => void }) {
    const filters = [
        { category: 'all', icon: './globe.svg' },
        { category: 'hotel', icon: './hotel.svg' },
        { category: 'restaurant', icon: './restaurant.svg' },
    ];

    return (
        <div className="filter-buttons-container">
            {filters.map(({ category, icon }) => (
                <FilterOption
                    key={category}
                    category={category}
                    icon={icon}
                    active={filter === category}
                    setFilter={setFilter}
                />
            ))}
        </div>
    );
}
