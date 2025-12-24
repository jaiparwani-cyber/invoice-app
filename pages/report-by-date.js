import { useState } from 'react';

export default function ReportByDate() {
  const [date, setDate] = useState('');
  const [report, setReport] = useState(null);

  const generateReport = async () => {
    const res = await fetch('/api/report-by-date', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ date })
    });

    const data = await res.json();
    setReport(data);
  };

  const downloadPdf = async () => {
    const res = await fetch('/api/report-by-date-pdf', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ date })
    });

    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = `report-${date}.pdf`;
    a.click();
  };

  return (
    <div>
      <h1>Report by Date</h1>

      <input
        type="date"
        value={date}
        onChange={e => setDate(e.target.value)}
      />

      <button onClick={generateReport}>Generate</button>

      {report && (
        <>
          <table border="1">
            <thead>
              <tr>
                <th>Customer</th>
                {report.items.map(item => (
                  <th key={item}>{item}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {report.rows.map(row => (
                <tr key={row.customer}>
                  <td>{row.customer}</td>
                  {report.items.map(item => (
                    <td key={item}>{row[item] || 0}</td>
                  ))}
                </tr>
              ))}
              <tr>
                <td><strong>Total</strong></td>
                {report.items.map(item => (
                  <td key={item}><strong>{report.totals[item]}</strong></td>
                ))}
              </tr>
            </tbody>
          </table>

          <button onClick={downloadPdf}>Download PDF</button>
        </>
      )}
    </div>
  );
}
