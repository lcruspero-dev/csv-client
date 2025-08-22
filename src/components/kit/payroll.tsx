import React, { useState } from "react";

const PayrollCalculator: React.FC = () => {
    const [employeeName, setEmployeeName] = useState<string>("");
    const [dailyRate, setDailyRate] = useState<number>(0);
    const [hoursWorked, setHoursWorked] = useState<number>(0);

    const [generated, setGenerated] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setGenerated(true);
    };

    const hourlyRate = dailyRate > 0 ? dailyRate / 8 : 0;
    const grossSalary = hourlyRate * hoursWorked;
    const netSalary = grossSalary; 

    return (
        <div style={{ fontFamily: "Arial, sans-serif", margin: "20px" }}>
            <h2>Payroll Form</h2>

            <form
                onSubmit={handleSubmit}
                style={{
                    marginBottom: "20px",
                    padding: "15px",
                    border: "1px solid #ccc",
                    borderRadius: "8px",
                    maxWidth: "400px",
                }}
            >
                <label style={{ display: "block", marginTop: "10px", fontWeight: "bold" }}>
                    Employee Name:
                </label>
                <input
                    type="text"
                    value={employeeName}
                    onChange={(e) => setEmployeeName(e.target.value)}
                    required
                    style={{
                        width: "100%",
                        padding: "6px",
                        marginTop: "4px",
                        marginBottom: "12px",
                        border: "1px solid #ccc",
                        borderRadius: "5px",
                    }}
                />

                <label style={{ display: "block", marginTop: "10px", fontWeight: "bold" }}>
                    Daily Rate:
                </label>
                <input
                    type="number"
                    step="0.01"
                    value={dailyRate}
                    onChange={(e) => setDailyRate(parseFloat(e.target.value))}
                    required
                    style={{
                        width: "100%",
                        padding: "6px",
                        marginTop: "4px",
                        marginBottom: "12px",
                        border: "1px solid #ccc",
                        borderRadius: "5px",
                    }}
                />

                <label style={{ display: "block", marginTop: "10px", fontWeight: "bold" }}>
                    Hours Worked (per month):
                </label>
                <input
                    type="number"
                    value={hoursWorked}
                    onChange={(e) => setHoursWorked(parseInt(e.target.value))}
                    required
                    style={{
                        width: "100%",
                        padding: "6px",
                        marginTop: "4px",
                        marginBottom: "12px",
                        border: "1px solid #ccc",
                        borderRadius: "5px",
                    }}
                />

                <button
                    type="submit"
                    style={{
                        background: "#4CAF50",
                        color: "white",
                        padding: "10px 15px",
                        border: "none",
                        borderRadius: "5px",
                        cursor: "pointer",
                    }}
                >
                    Generate Payslip
                </button>
            </form>

            {generated && (
                <div>
                    <h3>Payslip</h3>
                    <table
                        style={{
                            borderCollapse: "collapse",
                            width: "60%",
                            maxWidth: "500px",
                            marginTop: "15px",
                        }}
                    >
                        <tbody>
                            <tr>
                                <th style={{ border: "1px solid #ccc", padding: "10px 15px", background: "#f2f2f2" }}>
                                    Employee Name
                                </th>
                                <td style={{ border: "1px solid #ccc", padding: "10px 15px" }}>
                                    {employeeName}
                                </td>
                            </tr>
                            <tr>
                                <th style={{ border: "1px solid #ccc", padding: "10px 15px", background: "#f2f2f2" }}>
                                    Daily Rate
                                </th>
                                <td style={{ border: "1px solid #ccc", padding: "10px 15px" }}>
                                    ₱{dailyRate.toFixed(2)}
                                </td>
                            </tr>
                            <tr>
                                <th style={{ border: "1px solid #ccc", padding: "10px 15px", background: "#f2f2f2" }}>
                                    Hourly Rate
                                </th>
                                <td style={{ border: "1px solid #ccc", padding: "10px 15px" }}>
                                    ₱{hourlyRate.toFixed(2)}
                                </td>
                            </tr>
                            <tr>
                                <th style={{ border: "1px solid #ccc", padding: "10px 15px", background: "#f2f2f2" }}>
                                    Hours Worked
                                </th>
                                <td style={{ border: "1px solid #ccc", padding: "10px 15px" }}>
                                    {hoursWorked}
                                </td>
                            </tr>
                            <tr>
                                <th style={{ border: "1px solid #ccc", padding: "10px 15px", background: "#f2f2f2" }}>
                                    Gross Salary
                                </th>
                                <td
                                    style={{
                                        border: "1px solid #ccc",
                                        padding: "10px 15px",
                                        fontWeight: "bold",
                                        color: "#2a7",
                                    }}
                                >
                                    ₱{grossSalary.toFixed(2)}
                                </td>
                            </tr>
                            <tr>
                                <th style={{ border: "1px solid #ccc", padding: "10px 15px", background: "#f2f2f2" }}>
                                    Net Salary
                                </th>
                                <td
                                    style={{
                                        border: "1px solid #ccc",
                                        padding: "10px 15px",
                                        fontWeight: "bold",
                                        color: "#2a7",
                                    }}
                                >
                                    ₱{netSalary.toFixed(2)}
                                </td>
                            </tr>
                        </tbody>
                    </table>
                    <button
                        style={{
                            marginTop: "15px",
                            background: "#007BFF",
                            color: "white",
                            padding: "10px 15px",
                            border: "none",
                            borderRadius: "5px",
                            cursor: "pointer",
                        }}
                        onClick={() => alert("Payslip sent!")}
                    >
                        Send
                    </button>
                </div>
            )}
        </div>
    );
};

export default PayrollCalculator;
