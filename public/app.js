const API = '/api/devices';

let devices = [];
let currentTab = 'all';

const table = document.getElementById('deviceTable');
const modal = document.getElementById('deviceModal');
const form = document.getElementById('deviceForm');
const searchInput = document.getElementById('searchInput');

// ---------- UTIL ----------
function humanizeDuration(dateStr) {
  if (!dateStr) return '-';
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins} min`;
  const hrs = Math.floor(mins / 60);
  return `${hrs} hr ${mins % 60} min`;
}

// ---------- FETCH ----------
async function fetchDevices() {
  try {
    const res = await fetch(API);
    if (!res.ok) throw new Error('API error');
    devices = await res.json();
    render();
  } catch (err) {
    console.error('Fetch error:', err);
  }
}

// ---------- RENDER ----------
function render() {
  const filter = searchInput.value.toLowerCase();

  const filtered = devices.filter(d => {
    if (currentTab === 'online' && d.status !== 'ONLINE') return false;
    if (currentTab === 'offline' && d.status !== 'OFFLINE') return false;

    return (
      (d.device_id || '').toLowerCase().includes(filter) ||
      (d.location || '').toLowerCase().includes(filter) ||
      (d.ip_address || '').toLowerCase().includes(filter)
    );
  });

  table.innerHTML = '';

  filtered.forEach(d => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${d.device_id}</td>
      <td>${d.location}</td>
      <td>${d.ip_address}</td>
      <td class="${d.status === 'ONLINE' ? 'status-online' : 'status-offline'}">${d.status}</td>
      <td>${d.status === 'OFFLINE' ? humanizeDuration(d.offline_since) : '-'}</td>
      <td>${d.is_active ? 'Yes' : 'No'}</td>
      <td>
        <button class="small" onclick="editDevice('${d.device_id}')">Edit</button>
      </td>
    `;
    table.appendChild(tr);
  });
}

// ---------- ADD / EDIT ----------
document.getElementById('openModalBtn').onclick = () => {
  form.reset();
  document.getElementById('editId').value = '';
  modal.style.display = 'flex';
};

document.getElementById('closeModalBtn').onclick = () => {
  modal.style.display = 'none';
}

form.onsubmit = async (e) => {
  e.preventDefault();

  const payload = {
    device_id: device_id.value,
    device_name: device_name.value,
    location: document.getElementById('location').value,
    ip_address: ip_address.value,
    is_active: document.querySelector('input[name="is_active"]:checked').value === 'true'
  };

  const id = document.getElementById('editId').value;

  await fetch(`${API}${id ? '/' + id : ''}`, {
    method: id ? 'PUT' : 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  modal.style.display = 'none';
  fetchDevices();
};

function editDevice(id) {
  const d = devices.find(x => x.device_id === id);
  document.getElementById('editId').value = d.device_id;
  device_id.value = d.device_id;
  device_name.value = d.device_name;
  document.getElementById('location').value = d.location;
  ip_address.value = d.ip_address;
    document.querySelector(`input[name="is_active"][value="${d.is_active}"]`).checked = true;
  modal.style.display = 'flex';
}

async function deleteDevice(id) {
  if (!confirm('Delete this device?')) return;
  await fetch(`${API}/${id}`, { method: 'DELETE' });
  fetchDevices();
}

// ---------- TABS ----------
document.querySelectorAll('.tab').forEach(tab => {
  tab.onclick = () => {
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    tab.classList.add('active');
    currentTab = tab.dataset.tab;
    const deviceSection = document.getElementById('deviceSection');
    document.getElementById('logsSection').style.display =
      currentTab === 'logs' ? 'block' : 'none';

    if (currentTab === 'logs') {
      deviceSection.style.display = 'none';
      loadLogs();
      loadArchives();
    } else {
      deviceSection.style.display = 'block';
      render();
    }
  };
});

// ---------- LOGS ----------
async function loadLogs() {
  const device = document.getElementById('logDeviceFilter').value;
  const status = document.getElementById('logStatusFilter').value;

  let url = `/api/devices/logs/recent?`;
  if (device) url += `deviceId=${device}&`;
  if (status) url += `status=${status}`;

  const res = await fetch(url);
  const logs = await res.json();

  const tbody = document.getElementById('logsTable');
  tbody.innerHTML = '';

  logs.forEach(l => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${l.device_id}</td>
      <td>${l.status}</td>
      <td>${l.response_time_ms ?? '-'}</td>
      <td>${new Date(l.ping_time).toLocaleString()}</td>
    `;
    tbody.appendChild(tr);
  });
}

async function loadArchives() {
  const res = await fetch('/api/devices/logs/archive');
  const files = await res.json();

  const ul = document.getElementById('archiveList');
  ul.innerHTML = '';

  files.forEach(f => {
    const li = document.createElement('li');
    li.innerHTML = `<a href="/api/devices/logs/archive/${f}" target="_blank">${f}</a>`;
    ul.appendChild(li);
  });
}

// ---------- INIT ----------
fetchDevices();
setInterval(fetchDevices, 10000);
