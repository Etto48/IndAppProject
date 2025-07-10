export default function StarsBar({ stars }: { stars: number }) {
    return (
        <div className="stars-bar">
            <div className="stars" style={{ width: `${(stars / 5) * 100}%` }}>
            </div>
        </div>
    )
}