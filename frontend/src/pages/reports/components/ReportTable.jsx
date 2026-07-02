import React, { useState } from "react";
import { FaChevronLeft, FaChevronRight, FaSortAmountDownAlt } from "react-icons/fa";

const statusConfig = {
    "Active":       { color: "#14532d", bg: "#dcfce7", border: "#bbf7d0" },
    "Inactive":     { color: "#7f1d1d", bg: "#fee2e2", border: "#fecaca" },
    "Approved":     { color: "#14532d", bg: "#dcfce7", border: "#bbf7d0" },
    "Pending":      { color: "#92400e", bg: "#fef9c3", border: "#fde68a" },
    "Rejected":     { color: "#7f1d1d", bg: "#fee2e2", border: "#fecaca" },
    "Present":      { color: "#14532d", bg: "#dcfce7", border: "#bbf7d0" },
    "Absent":       { color: "#7f1d1d", bg: "#fee2e2", border: "#fecaca" },
    "Late":         { color: "#92400e", bg: "#fef9c3", border: "#fde68a" },
    "Half Day":     { color: "#9a3412", bg: "#ffedd5", border: "#fed7aa" },
    "Completed":    { color: "#14532d", bg: "#dcfce7", border: "#bbf7d0" },
    "In Progress":  { color: "#1e40af", bg: "#dbeafe", border: "#bfdbfe" },
    "On Hold":      { color: "#374151", bg: "#f3f4f6", border: "#d1d5db" },
    "Overdue":      { color: "#7f1d1d", bg: "#fee2e2", border: "#fecaca" },
    "High":         { color: "#7f1d1d", bg: "#fee2e2", border: "#fecaca" },
    "Medium":       { color: "#92400e", bg: "#fef9c3", border: "#fde68a" },
    "Low":          { color: "#14532d", bg: "#dcfce7", border: "#bbf7d0" },
};

const priorityDots = { High: "🔴", Medium: "🟡", Low: "🟢" };
const statusIcons = {
    "Pending": "⏳", "In Progress": "🚧", "On Hold": "⏸", "Completed": "✅", "Overdue": "❌",
    "Active": "🟢", "Inactive": "🔴",
    "Approved": "✅", "Rejected": "❌",
    "Present": "✅", "Absent": "❌", "Late": "⏳", "Half Day": "🕐"
};

function ReportTable({ columns, keys, data = [] }) {
    const [currentPage, setCurrentPage] = useState(1);
    const [sortKey, setSortKey] = useState(null);
    const [sortDir, setSortDir] = useState("asc");
    const rowsPerPage = 10;

    // Sort logic
    let sortedData = [...data];
    if (sortKey) {
        sortedData.sort((a, b) => {
            const aVal = a[sortKey] ?? "";
            const bVal = b[sortKey] ?? "";
            if (sortDir === "asc") return String(aVal).localeCompare(String(bVal));
            return String(bVal).localeCompare(String(aVal));
        });
    }

    const totalPages = Math.max(1, Math.ceil(sortedData.length / rowsPerPage));
    const startIndex = (currentPage - 1) * rowsPerPage;
    const paginatedData = sortedData.slice(startIndex, startIndex + rowsPerPage);

    const handleSort = (key) => {
        if (sortKey === key) {
            setSortDir(prev => prev === "asc" ? "desc" : "asc");
        } else {
            setSortKey(key);
            setSortDir("asc");
        }
        setCurrentPage(1);
    };

    const formatCellValue = (key, val) => {
        if (val === undefined || val === null || val === "") return <span style={{ color: "#cbd5e1" }}>—</span>;

        // Badges for status/priority
        if (key === "status" || key === "attendance_status" || key === "priority") {
            const cleanedVal = String(val).trim();
            const cfg = statusConfig[cleanedVal];
            if (cfg) {
                const icon = key === "priority" ? (priorityDots[cleanedVal] || "") : (statusIcons[cleanedVal] || "");
                return (
                    <span style={{
                        background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}`,
                        padding: "4px 10px", borderRadius: "20px", fontSize: "12px", fontWeight: "700",
                        whiteSpace: "nowrap", display: "inline-flex", alignItems: "center", gap: "4px"
                    }}>
                        {icon} {cleanedVal}
                    </span>
                );
            }
        }

        // Format dates
        if (key.includes("date") || key === "joining_date" || key === "start_date" || key === "end_date" || key === "due_date") {
            try {
                const dateObj = new Date(val);
                if (!isNaN(dateObj.getTime())) {
                    return dateObj.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
                }
            } catch (e) {}
        }

        return String(val);
    };

    return (
        <div style={{
            background: "white",
            borderRadius: "14px",
            boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
            overflow: "hidden"
        }}>
            <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", minWidth: "800px" }}>
                    <thead>
                        <tr style={{ background: "#f8fafc", borderBottom: "2px solid #e2e8f0" }}>
                            {columns.map((col, index) => (
                                <th
                                    key={index}
                                    onClick={() => handleSort(keys[index])}
                                    style={{
                                        padding: "14px 16px",
                                        textAlign: "left",
                                        fontSize: "12px",
                                        fontWeight: "700",
                                        color: "#475569",
                                        textTransform: "uppercase",
                                        letterSpacing: "0.5px",
                                        cursor: "pointer",
                                        userSelect: "none",
                                        whiteSpace: "nowrap",
                                        transition: "color 0.2s"
                                    }}
                                    onMouseOver={(e) => e.target.style.color = "#4f8cff"}
                                    onMouseOut={(e) => e.target.style.color = "#475569"}
                                >
                                    <span style={{ display: "inline-flex", alignItems: "center", gap: "5px" }}>
                                        {col}
                                        {sortKey === keys[index] && (
                                            <FaSortAmountDownAlt size={10} style={{ transform: sortDir === "desc" ? "scaleY(-1)" : "none", color: "#4f8cff" }} />
                                        )}
                                    </span>
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {paginatedData.map((row, rowIndex) => (
                            <tr
                                key={rowIndex}
                                style={{
                                    borderBottom: "1px solid #f1f5f9",
                                    transition: "background 0.15s ease"
                                }}
                                onMouseOver={(e) => e.currentTarget.style.background = "#f8fafc"}
                                onMouseOut={(e) => e.currentTarget.style.background = "transparent"}
                            >
                                {keys.map((key, colIndex) => (
                                    <td key={colIndex} style={{
                                        padding: "13px 16px",
                                        fontSize: "13.5px",
                                        color: "#334155",
                                        fontWeight: colIndex === 0 ? "600" : "400"
                                    }}>
                                        {formatCellValue(key, row[key])}
                                    </td>
                                ))}
                            </tr>
                        ))}
                        {data.length === 0 && (
                            <tr>
                                <td colSpan={columns.length} style={{ textAlign: "center", color: "#94a3b8", padding: "50px", fontSize: "15px" }}>
                                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "10px" }}>
                                        <span style={{ fontSize: "32px" }}>📭</span>
                                        No records found for the selected criteria.
                                    </div>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            {data.length > 0 && (
                <div style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "16px 20px",
                    borderTop: "1px solid #f1f5f9",
                    background: "#fafbfd"
                }}>
                    <span style={{ fontSize: "13px", color: "#64748b", fontWeight: "500" }}>
                        Showing <strong>{startIndex + 1}</strong> to <strong>{Math.min(startIndex + rowsPerPage, data.length)}</strong> of <strong>{data.length}</strong> records
                    </span>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                        <button
                            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                            disabled={currentPage === 1}
                            style={{
                                background: currentPage === 1 ? "#f1f5f9" : "white",
                                border: "1px solid #e2e8f0",
                                borderRadius: "8px",
                                padding: "8px 12px",
                                color: currentPage === 1 ? "#cbd5e1" : "#475569",
                                cursor: currentPage === 1 ? "not-allowed" : "pointer",
                                transition: "all 0.15s",
                                display: "flex",
                                alignItems: "center"
                            }}
                        >
                            <FaChevronLeft size={11} />
                        </button>

                        {/* Page numbers */}
                        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                            let pageNum;
                            if (totalPages <= 5) {
                                pageNum = i + 1;
                            } else if (currentPage <= 3) {
                                pageNum = i + 1;
                            } else if (currentPage >= totalPages - 2) {
                                pageNum = totalPages - 4 + i;
                            } else {
                                pageNum = currentPage - 2 + i;
                            }
                            return (
                                <button
                                    key={pageNum}
                                    onClick={() => setCurrentPage(pageNum)}
                                    style={{
                                        background: currentPage === pageNum ? "#4f8cff" : "white",
                                        border: `1px solid ${currentPage === pageNum ? "#4f8cff" : "#e2e8f0"}`,
                                        borderRadius: "8px",
                                        padding: "8px 13px",
                                        color: currentPage === pageNum ? "white" : "#475569",
                                        cursor: "pointer",
                                        fontWeight: "600",
                                        fontSize: "13px",
                                        transition: "all 0.15s"
                                    }}
                                >
                                    {pageNum}
                                </button>
                            );
                        })}

                        <button
                            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                            disabled={currentPage === totalPages}
                            style={{
                                background: currentPage === totalPages ? "#f1f5f9" : "white",
                                border: "1px solid #e2e8f0",
                                borderRadius: "8px",
                                padding: "8px 12px",
                                color: currentPage === totalPages ? "#cbd5e1" : "#475569",
                                cursor: currentPage === totalPages ? "not-allowed" : "pointer",
                                transition: "all 0.15s",
                                display: "flex",
                                alignItems: "center"
                            }}
                        >
                            <FaChevronRight size={11} />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

export default ReportTable;
