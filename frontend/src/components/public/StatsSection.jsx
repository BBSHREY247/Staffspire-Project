import { useEffect, useState } from "react";

function StatsSection() {
    return (
        <section className="pub-stats-section">
            {/* <div className="pub-stats-grid">
                <StatCard endValue={1240} label="Clients" prefix="" suffix="+" isDotFormat />
                <StatCard endValue={85200} label="Users" prefix="" suffix="+" isDotFormat />
                <StatCard endValue={4.8} label="Reports" prefix="" suffix="M+" />
                <StatCard endValue={98.9} label="Retention" prefix="" suffix="%" />
            </div> */}
        </section>
    );
}

function StatCard({ endValue, label, prefix, suffix, isDotFormat }) {
    const [count, setCount] = useState(0);

    useEffect(() => {
        let start = 0;
        const duration = 2000;
        const stepTime = 30;
        const totalSteps = duration / stepTime;
        const stepVal = endValue / totalSteps;

        const timer = setInterval(() => {
            start += stepVal;
            if (start >= endValue) {
                setCount(endValue);
                clearInterval(timer);
            } else {
                setCount(start);
            }
        }, stepTime);

        return () => clearInterval(timer);
    }, [endValue]);

    const formatNumber = (num) => {
        if (num % 1 === 0) {
            if (isDotFormat) {
                // Return using dots as separators (e.g. 1.240)
                return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
            }
            return num.toLocaleString();
        }
        return num.toFixed(1);
    };

    return (
        <div className="pub-stat-card">
            <div className="pub-stat-number">
                {prefix}{formatNumber(count)}{suffix}
            </div>
            <div className="pub-stat-label">{label}</div>
        </div>
    );
}

export default StatsSection;
