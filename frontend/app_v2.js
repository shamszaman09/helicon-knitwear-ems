document.addEventListener('DOMContentLoaded', () => {
  const token = localStorage.getItem('helicon_token');
  const dept = localStorage.getItem('helicon_dept');

  // Verify that an authorized credentials profile exists before showing content
  if (!token || !dept) {
    document.getElementById('secure-shield').style.display = 'block';
    document.getElementById('dashboard-content').style.display = 'none';
    return;
  }

  // Content display configuration
  document.getElementById('secure-shield').style.display = 'none';
  document.getElementById('dashboard-content').style.display = 'block';
  document.getElementById('user-tag').textContent = `Terminal Room: [${dept.toUpperCase()}]`;

  // Fetch production metrics from backend
  async function loadMasterGridLogs() {
    try {
      const response = await fetch('/api/factory/orders');
      if (!response.ok) throw new Error('Data synchronization error');
      const data = await response.json();
      
      const tbody = document.getElementById('grid-rows-target');
      if (data.length === 0) {
        tbody.innerHTML = `<tr><td colspan="11" style="text-align:center; padding:30px; color:#9ca3af;">No active jobs in production logs.</td></tr>`;
        return;
      }

      tbody.innerHTML = data.map(row => {
        // Clean timestamp formatting profiles safely (extracts YYYY-MM-DD from ISO string)
        const recvDate = row.inquiry_recv_date ? row.inquiry_recv_date.split('T')[0] : '—';
        const deliveryDate = row.require_delivery_date ? row.require_delivery_date.split('T')[0] : '—';

        return `
          <tr>
            <td><strong>${row.slno}</strong></td>
            <td>${row.buyer}</td>
            <td style="color:#3b82f6; font-weight:600; font-family: monospace;">${row.style}</td>
            <td>${row.gauge || '—'}</td>
            <td>${row.yarn || '—'}</td>
            <!-- Real-time piece count tally synced from the knitting floor terminal -->
            <td><strong style="color: #10b981;">${row.total_knitted_pcs || 0}</strong> pcs</td>
            <td>${row.designer_name || '—'}</td>
            <td>${row.programmer_name || '—'}</td>
            <td><small>${recvDate}</small></td>
            <td><small style="font-weight:600;">${deliveryDate}</small></td>
            <td><span class="status-pill">${row.status}</span></td>
          </tr>
        `;
      }).join('');
    } catch (err) {
      console.error('Error rendering metrics UI grid:', err);
      const tbody = document.getElementById('grid-rows-target');
      if (tbody) {
        tbody.innerHTML = `<tr><td colspan="11" style="text-align:center; padding:30px; color:#ef4444;">Failed to sync with industrial network pipeline stream.</td></tr>`;
      }
    }
  }

  loadMasterGridLogs();
});

function logout() {
  localStorage.clear();
  window.location.href = '/index.html';
}
