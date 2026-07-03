document.addEventListener('DOMContentLoaded', () => {
  const token = localStorage.getItem('helicon_token');
  const dept = localStorage.getItem('helicon_dept');

  if (!token || !dept) {
    document.getElementById('secure-shield').style.display = 'block';
    document.getElementById('dashboard-content').style.display = 'none';
    return;
  }

  document.getElementById('secure-shield').style.display = 'none';
  document.getElementById('dashboard-content').style.display = 'block';
  document.getElementById('user-tag').textContent = `Terminal Room: [${dept.toUpperCase()}]`;

  // Main local database array cache container
  let cachedOrders = [];

  // Central rendering function responsible for writing table cells rows
  function renderTableRows(ordersArray) {
    const tbody = document.getElementById('grid-rows-target');
    if (ordersArray.length === 0) {
      tbody.innerHTML = `<tr><td colspan="55" style="text-align:center; padding:30px; color:#9ca3af;">No matching tracking entries discovered.</td></tr>`;
      return;
    }

    tbody.innerHTML = ordersArray.map(row => {
      const fmtDate = (dStr) => dStr ? dStr.split('T')[0] : '—';

      let badgeColor = '#6b7280';
      let badgeBg = 'rgba(107, 114, 128, 0.12)';
      const cleanStatus = (row.status || '').trim();

      if (cleanStatus.includes('Pending') || cleanStatus.includes('Shortage')) {
        badgeColor = '#ef4444'; badgeBg = 'rgba(239, 68, 68, 0.15)';
      } else if (cleanStatus.includes('Hand') || cleanStatus.includes('Programming')) {
        badgeColor = '#eab308'; badgeBg = 'rgba(234, 179, 8, 0.15)';
      } else if (cleanStatus.includes('Ready') || cleanStatus.includes('Live') || cleanStatus.includes('Running')) {
        badgeColor = '#10b981'; badgeBg = 'rgba(16, 185, 129, 0.15)';
      } else if (cleanStatus.includes('Complete')) {
        badgeColor = '#3b82f6'; badgeBg = 'rgba(59, 130, 246, 0.15)';
      }

      return `
        <tr>
          <td><strong>${row.slno}</strong></td>
          <td>${row.buyer}</td>
          <td style="color:#3b82f6; font-weight:600; font-family: monospace;">${row.style}</td>
          
          <!-- Merchant -->
          <td>${fmtDate(row.issued_log_date)}</td>
          <td>${fmtDate(row.required_date_agreed_by_sample_manager)}</td>
          <td><strong>${(row.pcs_required || 0).toLocaleString()}</strong> pcs</td>
          <td>${fmtDate(row.committed_date_for_yarn)}</td>
          
          <!-- Store -->
          <td>${row.yarn_name || '—'}</td>
          <td style="color: ${row.yarn_in_house_yes_no === 'Yes' ? '#10b981' : '#ef4444'}; font-weight:bold;">${row.yarn_in_house_yes_no || 'No'}</td>
          <td>${row.yarn_in_house_yes_no === 'No' ? fmtDate(row.yarn_approximate_date) : 'In-House'}</td>
          <td style="color: ${row.accessories_in_housed_yes_no === 'Yes' ? '#10b981' : '#ef4444'}; font-weight:bold;">${row.accessories_in_housed_yes_no || 'No'}</td>
          <td>${row.accessories_in_housed_yes_no === 'No' ? fmtDate(row.accessories_approximate_date) : 'In-House'}</td>
          
          <!-- Designer -->
          <td><small>${row.sample_type_stage || '—'}</small></td>
          <td>${row.yarn_composition || '—'}</td>
          <td>${row.yarn_count || '—'}</td>
          <td>${row.yarn_ply || '—'}</td>
          <td>${row.designer_needle_point || '—'}</td>
          <td>${row.designer_courses_point || '—'}</td>
          <td><small>${row.designer_tension_spec || '—'}</small></td>
          <td><strong>${row.designer_weight || '—'}</strong></td>
          <td><small>W: ${row.designer_weight_validated_by || '—'} <br/> T: ${row.designer_tension_validated_by || '—'}</small></td>
          
          <!-- Programmer -->
          <td>${row.machine_type || '—'}</td>
          <td>${row.gauge || '—'}</td>
          <td>System ${row.machine_system || '—'}</td>
          <td><small style="text-transform:uppercase;">${row.knitting_way || '—'}</small></td>
          <td>${row.machine_speed || '—'}</td>
          <td>${row.knitting_minutes || 0} mins</td>
          <td>${row.panels_qty || 0} pnl</td>
          <td><small>${row.structure_stitch_spec || '—'}</small></td>
          <td><small>Spd: ${row.programmer_speed_validated_by || '—'} <br/> Min: ${row.programmer_minutes_validated_by || '—'}</small></td>
          <td><small style="color:#10b981; font-weight:bold;">Validated</small></td>
          
          <!-- Knitting Floor Execution -->
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
          
          <!-- Makeup & Linking -->
          <td>${row.makeup_lines_planned || 0}</td>
          <td>${row.makeup_lines_running || 0}</td>
          <td><small>${row.makeup_line_wise_target_pcs || '—'}</small></td>
          <td><strong style="color: #10b981;">${row.makeup_line_wise_achieved_pcs || '—'}</strong></td>
          
          <!-- Finishing Process -->
          <td>${row.finishing_lines_planned || 0}</td>
          <td>${row.finishing_lines_running || 0}</td>
          <td><small>${row.finishing_line_wise_target_pcs || '—'}</small></td>
          <td><strong style="color: #10b981;">${row.finishing_line_wise_achieved_pcs || '—'}</strong></td>
          
          <!-- IE Costing -->
          <td style="color:#fb923c; font-weight:600;">${row.ie_knitting_process_wise_costed_smv || '0.00'}</td>
          <td style="color:#fb923c; font-weight:600;">${row.ie_makeup_process_wise_costed_smv || '0.00'}</td>
          <td style="color:#fb923c; font-weight:600;">${row.ie_finishing_process_wise_costed_smv || '0.00'}</td>
          
          <td>
            <span style="color: ${badgeColor}; background: ${badgeBg}; border: 1px solid ${badgeColor}40; padding: 4px 8px; border-radius: 4px; font-size: 11px; font-weight: bold; text-transform: uppercase; display: inline-block;">
              ${cleanStatus}
            </span>
          </td>
        </tr>
      `;
    }).join('');
  }

  // Fetch initial manufacturing array dataset
  async function loadMasterGridLogs() {
    try {
      const response = await fetch('/api/factory/orders');
      if (!response.ok) throw new Error('Data drop matrix sync error');
      cachedOrders = await response.json(); // Cache data globally
      renderTableRows(cachedOrders);
    } catch (err) {
      console.error(err);
      document.getElementById('grid-rows-target').innerHTML = `<tr><td colspan="55" style="text-align:center; padding:30px; color:#ef4444; font-weight:bold;">Failed to stream industrial parameters matrix from backend server.</td></tr>`;
    }
  }

  // INTERACTIVE REAL-TIME EVENT FILTER HOOK
  document.getElementById('dashboard-search').addEventListener('input', (e) => {
    const term = e.target.value.toLowerCase().trim();
    
    // Filters array data metrics instantly based on Buyer or Style
    const filtered = cachedOrders.filter(order => {
      const matchBuyer = (order.buyer || '').toLowerCase().includes(term);
      const matchStyle = (order.style || '').toLowerCase().includes(term);
      return matchBuyer || matchStyle;
    });

    renderTableRows(filtered); // Re-renders only matching cell objects
  });

  loadMasterGridLogs();
});

function logout() {
  localStorage.clear();
  window.location.href = '/index.html';
}
