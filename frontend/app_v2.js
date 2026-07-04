document.addEventListener('DOMContentLoaded', () => {
  const token = localStorage.getItem('helicon_token');
  const dept = localStorage.getItem('helicon_dept');

  // 1. Strict Security Barrier Gate Check
  if (!token || !dept) {
    document.getElementById('secure-shield').style.display = 'block';
    document.getElementById('dashboard-content').style.display = 'none';
    return;
  }

  document.getElementById('secure-shield').style.display = 'none';
  document.getElementById('dashboard-content').style.display = 'block';
  document.getElementById('user-tag').textContent = `Terminal Room: [${dept.toUpperCase()}]`;

  let cachedOrders = [];

  // 2. 100% PERFECTLY MATCHED 54-COLUMN RENDER ENGINE Matrix
  function renderTableRows(ordersArray) {
    const tbody = document.getElementById('grid-rows-target');
    if (!tbody) return;
    
    if (ordersArray.length === 0) {
      tbody.innerHTML = `<tr><td colspan="54" style="text-align:center; padding:30px; color:#9ca3af;">No matching manufacturing entries discovered.</td></tr>`;
      return;
    }

    tbody.innerHTML = ordersArray.map(row => {
      // Safe Date utility block mapping fallback text values
      const fmtDate = (dStr) => {
        if (!dStr) return '—';
        let str = String(dStr);
        return str.includes('T') ? str.split('T')[0] : str.slice(0, 10);
      };

      // Smart Visual Color Badge Logic Evaluator
      let badgeColor = '#6b7280'; 
      let badgeBg = 'rgba(107, 114, 128, 0.12)';
      const cleanStatus = (row.status || '').trim();

      if (cleanStatus.includes('Pending') || cleanStatus.includes('Shortage') || cleanStatus.includes('Hold')) {
        badgeColor = '#ef4444'; badgeBg = 'rgba(239, 68, 68, 0.15)';
      } else if (cleanStatus.includes('Hand') || cleanStatus.includes('Designer') || cleanStatus.includes('Programming')) {
        badgeColor = '#eab308'; badgeBg = 'rgba(234, 179, 8, 0.15)';
      } else if (cleanStatus.includes('Ready') || cleanStatus.includes('Live') || cleanStatus.includes('Running')) {
        badgeColor = '#10b981'; badgeBg = 'rgba(16, 185, 129, 0.15)';
      } else if (cleanStatus.includes('Complete')) {
        badgeColor = '#3b82f6'; badgeBg = 'rgba(59, 130, 246, 0.15)';
      }

      // Explicitly return exactly 54 matching cell tags to line up columns precisely
      return `
        <tr>
          <!-- 1-3. Core Identifiers -->
          <td><strong>${row.slno}</strong></td>
          <td>${row.buyer || '—'}</td>
          <td style="color:#3b82f6; font-weight:600; font-family: monospace;">${row.style || '—'}</td>
          
          <!-- 4-7. Merchandiser Specs -->
          <td>${fmtDate(row.issued_log_date)}</td>
          <td>${fmtDate(row.required_date_agreed_by_sample_manager)}</td>
          <td><strong>${(row.pcs_required || 0).toLocaleString()}</strong> pcs</td>
          <td>${fmtDate(row.committed_date_for_yarn)}</td>
          
          <!-- 8-12. Material Store Inventory -->
          <td>${row.yarn_name || '—'}</td>
          <td style="color: ${row.yarn_in_house_yes_no === 'Yes' ? '#10b981' : '#ef4444'}; font-weight:bold;">${row.yarn_in_house_yes_no || 'No'}</td>
          <td>${row.yarn_in_house_yes_no === 'No' ? fmtDate(row.yarn_approximate_date) : 'In-House'}</td>
          <td style="color: ${row.accessories_in_housed_yes_no === 'Yes' ? '#10b981' : '#ef4444'}; font-weight:bold;">${row.accessories_in_housed_yes_no || 'No'}</td>
          <td>${row.accessories_in_housed_yes_no === 'No' ? fmtDate(row.accessories_approximate_date) : 'In-House'}</td>
          
          <!-- 13-21. Technical Designer Specifications (FIXED COLUMN MAPPING POSITION) -->
          <td><small style="font-weight:bold; color:#eab308;">${row.sample_type_stage || '—'}</small></td>
          <td>${row.yarn_composition || '—'}</td>
          <td>${row.yarn_count || '—'}</td>
          <td>${row.yarn_ply || '—'}</td>
          <td>${row.designer_needle_point || '—'}</td>
          <td>${row.designer_courses_point || '—'}</td>
          <td><small>${row.designer_tension_spec || '—'}</small></td>
          <td><strong>${row.designer_weight || '—'}</strong></td>
          <td><small style="color:#9ca3af;">W: ${row.designer_weight_validated_by || '—'}<br>T: ${row.designer_tension_validated_by || '—'}</small></td>
          
          <!-- 22-31. M1 CAD Programmer Specifications -->
          <td>${row.machine_type || '—'}</td>
          <td>${row.gauge || '—'}</td>
          <td>System ${row.machine_system || '—'}</td>
          <td><small style="text-transform:uppercase; font-weight:600;">${row.knitting_way || '—'}</small></td>
          <td>${row.machine_speed || '—'}</td>
          <td>${row.knitting_minutes || 0} mins</td>
          <td>${row.panels_qty || 0} pnl</td>
          <td><small>${row.structure_stitch_spec || '—'}</small></td>
          <td><small style="color:#9ca3af;">Spd: ${row.programmer_speed_validated_by || '—'}<br>Min: ${row.programmer_minutes_validated_by || '—'}</small></td>
          <td><small style="color:#10b981; font-weight:bold;">Verified</small></td>
          
          <!-- 32-42. Knitting Floor Execution -->
          <td>${row.knit_mc_planned || 0} Mc</td>
          <td><strong style="color: #3b82f6;">${row.knit_mc_running || 0}</strong> Mc</td>
          <td>${(row.target_pcs || 0).toLocaleString()}</td>
          <td><strong style="color: #10b981;">${(row.achieved_pcs || 0).toLocaleString()}</strong></td>
          <td>${row.target_sah || '0.00'}</td>
          <td>${row.achieved_sah || '0.00'}</td>
          <td>${row.target_smv || '0.00'}</td>
          <td>${row.planned_smv || '0.00'}</td>
          <td style="background: rgba(59, 130, 246, 0.05); font-weight:bold;">${row.actual_smv || '0.00'}</td>
          <td><small>${row.floor_smv_validated_by_programmer_head || '—'}</small></td>
          <td><small>${row.floor_smv_validated_by_knitting_head || '—'}</small></td>
          
          <!-- 43-46. Makeup & Linking -->
          <td>${row.makeup_lines_planned || 0}</td>
          <td>${row.makeup_lines_running || 0}</td>
          <td><small>${row.makeup_line_wise_target_pcs || '—'}</small></td>
          <td><strong style="color: #10b981;">${row.makeup_line_wise_achieved_pcs || '—'}</strong></td>
          
          <!-- 47-50. Finishing Process -->
          <td>${row.finishing_lines_planned || 0}</td>
          <td>${row.finishing_lines_running || 0}</td>
          <td><small>${row.finishing_line_wise_target_pcs || '—'}</small></td>
          <td><strong style="color: #10b981;">${row.finishing_line_wise_achieved_pcs || '—'}</strong></td>
          
          <!-- 51-53. Industrial Engineering (IE) -->
          <td style="color:#fb923c; font-weight:600;">${row.ie_knitting_process_wise_costed_smv || '0.00'}</td>
          <td style="color:#fb923c; font-weight:600;">${row.ie_makeup_process_wise_costed_smv || '0.00'}</td>
          <td style="color:#fb923c; font-weight:600;">${row.ie_finishing_process_wise_costed_smv || '0.00'}</td>
          
          <!-- 54. Status Indicator Block -->
          <td>
            <span style="color: ${badgeColor}; background: ${badgeBg}; border: 1px solid ${badgeColor}40; padding: 4px 8px; border-radius: 4px; font-size: 11px; font-weight: bold; text-transform: uppercase; display: inline-block;">
              ${cleanStatus}
            </span>
          </td>
        </tr>
      `;
    }).join('');
  }

  // Fetch baseline parameters array on initial load
  async function loadMasterGridLogs() {
    try {
      const response = await fetch('/api/factory/orders');
      if (!response.ok) throw new Error('Network error');
      cachedOrders = await response.json();
      renderTableRows(cachedOrders);
    } catch (err) {
      console.error('Data sync failed:', err);
    }
  }

  // Interactive Live Dashboard Filter Hook
  const searchInput = document.getElementById('dashboard-search');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      const term = e.target.value.toLowerCase().trim();
      const filtered = cachedOrders.filter(o => 
        (o.buyer || '').toLowerCase().includes(term) || (o.style || '').toLowerCase().includes(term)
      );
      renderTableRows(filtered);
    });
  }

  // High-Fidelity CSV Excel Exporter Tool
  const exportBtn = document.getElementById('export-csv-btn');
  if (exportBtn) {
    exportBtn.addEventListener('click', () => {
      if (cachedOrders.length === 0) return alert("No active data to export.");
      const headers = ["SLNo", "Buyer Name", "Style Ref No", "Status"];
      const cleanCell = (v) => `"${String(v || '').replace(/"/g, '""')}"`;
      const csvRows = [headers.map(cleanCell).join(',')];
      cachedOrders.forEach(r => {
        csvRows.push([r.slno, r.buyer, r.style, r.status].map(cleanCell).join(','));
      });
      const blob = new Blob(["\uFEFF" + csvRows.join("\n")], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a"); link.href = url;
      link.download = `EMS_Report_${new Date().toISOString().slice(0,10)}.csv`;
      document.body.appendChild(link); link.click(); document.body.removeChild(link);
    });
  }

  loadMasterGridLogs();
});

function logout() {
  localStorage.clear();
  window.location.href = '/index.html';
}
