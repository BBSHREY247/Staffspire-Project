import { useEffect, useRef } from "react";

const stats = [
    { icon: "groups", value: 9120, label: "Employees Managed", suffix: "+" },
    { icon: "assignment_turned_in", value: 152000, label: "Attendance Records", suffix: "+" },
    { icon: "monitoring", value: 2736, label: "Reports Generated", suffix: "+" },
    { icon: "task_alt", value: 49856, label: "Tasks Completed", suffix: "+" },
];

function StatsSection() {
    const countersRef = useRef([]);

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        const el = entry.target;
                        const target = parseInt(el.getAttribute("data-target"), 10);
                        const duration = 2000;
                        const step = target / (duration / 16);
                        let current = 0;

                        const update = () => {
                            current += step;
                            if (current < target) {
                                el.textContent = Math.floor(current).toLocaleString();
                                requestAnimationFrame(update);
                            } else {
                                el.textContent = target.toLocaleString() + "+";
                            }
                        };
                        update();
                        observer.unobserve(el);
                    }
                });
            },
            { threshold: 0.3 }
        );

        const els = countersRef.current;
        els.forEach((el) => el && observer.observe(el));
        return () => els.forEach((el) => el && observer.unobserve(el));
    }, []);

    return (
        <section className="ss-stats-section">
            <div className="ss-stats-grid">
                {stats.map((stat, i) => (
                    <div className="ss-stat-card reveal-fade-in" key={i} style={{ transitionDelay: `${i * 100}ms` }}>
                        <span className="material-symbols-outlined ss-stat-icon">{stat.icon}</span>
                        <h3
                            className="ss-stat-number"
                            data-target={stat.value}
                            ref={(el) => (countersRef.current[i] = el)}
                        >
                            0
                        </h3>
                        <p className="ss-stat-label">{stat.label}</p>
                    </div>
                ))}
            </div>
        </section>
    );
}

export default StatsSection;
