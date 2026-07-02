import React, { useState } from "react";
import axios from "axios";
import { FaFilePdf, FaFileExcel, FaFileCsv, FaPrint, FaSpinner } from "react-icons/fa";

function ExportButtons({ reportType, filters, onPrint }) {
    const [loadingType, setLoadingType] = useState(null);
    const user = JSON.parse(localStorage.getItem("user")) || {};
    const role = user.role || "Employee";

    const handleExport = async (format) => {
        try {
            setLoadingType(format);
            const token = localStorage.getItem("token");
            const queryParams = new URLSearchParams({ type: reportType, ...filters }).toString();
            const url = `http://localhost:5000/api/reports/export/${format}?${queryParams}`;

            const response = await axios.get(url, {
                headers: { Authorization: `Bearer ${token}` },
                responseType: "blob"
            });

            const blob = new Blob([response.data]);
            const link = document.createElement("a");
            link.href = window.URL.createObjectURL(blob);
            let ext = format === "excel" ? "xlsx" : format;
            link.setAttribute("download", `${reportType}_report_${new Date().toLocaleDateString('sv')}.${ext}`);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (error) {
            console.error(`Export ${format} failed:`, error);
            alert(`Failed to export as ${format.toUpperCase()}.`);
        } finally {
            setLoadingType(null);
        }
    };

    const btnBase = {
        border: "none",
        display: "inline-flex",
        alignItems: "center",
        gap: "7px",
        padding: "10px 18px",
        borderRadius: "10px",
        fontWeight: "700",
        cursor: "pointer",
        fontSize: "13px",
        transition: "all 0.2s ease",
        boxShadow: "0 2px 8px rgba(0,0,0,0.08)"
    };

    if (role === "Employee") {
        return (
            <div style={{ display: "flex", gap: "10px" }}>
                <button
                    onClick={onPrint}
                    style={{ ...btnBase, background: "linear-gradient(135deg, #6366f1, #4f46e5)", color: "white", boxShadow: "0 4px 14px rgba(99,102,241,0.3)" }}
                    onMouseOver={(e) => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 6px 20px rgba(99,102,241,0.4)"; }}
                    onMouseOut={(e) => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "0 4px 14px rgba(99,102,241,0.3)"; }}
                >
                    <FaPrint /> Print Report
                </button>
            </div>
        );
    }

    const exportBtns = [
        { format: "pdf", label: "PDF", icon: <FaFilePdf />, gradient: "linear-gradient(135deg, #ef4444, #dc2626)", shadow: "rgba(239,68,68,0.3)" },
        { format: "excel", label: "Excel", icon: <FaFileExcel />, gradient: "linear-gradient(135deg, #22c55e, #16a34a)", shadow: "rgba(34,197,94,0.3)" },
        { format: "csv", label: "CSV", icon: <FaFileCsv />, gradient: "linear-gradient(135deg, #f59e0b, #d97706)", shadow: "rgba(245,158,11,0.3)" }
    ];

    return (
        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
            {exportBtns.map(({ format, label, icon, gradient, shadow }) => (
                <button
                    key={format}
                    disabled={loadingType !== null}
                    onClick={() => handleExport(format)}
                    style={{
                        ...btnBase,
                        background: gradient,
                        color: "white",
                        boxShadow: `0 4px 14px ${shadow}`,
                        opacity: loadingType !== null ? 0.7 : 1
                    }}
                    onMouseOver={(e) => { if (!loadingType) { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = `0 6px 20px ${shadow}`; } }}
                    onMouseOut={(e) => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = `0 4px 14px ${shadow}`; }}
                >
                    {loadingType === format ? <FaSpinner className="spin" /> : icon} {label}
                </button>
            ))}
            <button
                onClick={onPrint}
                style={{ ...btnBase, background: "linear-gradient(135deg, #6366f1, #4f46e5)", color: "white", boxShadow: "0 4px 14px rgba(99,102,241,0.3)" }}
                onMouseOver={(e) => { e.currentTarget.style.transform = "translateY(-2px)"; }}
                onMouseOut={(e) => { e.currentTarget.style.transform = "none"; }}
            >
                <FaPrint /> Print
            </button>
        </div>
    );
}

export default ExportButtons;
