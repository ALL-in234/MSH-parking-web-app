// 停車場預約系統邏輯
const TOTAL_SPOTS = 50;
let reservations = JSON.parse(localStorage.getItem('parkingReservations')) || [];

// DOM 元素
const totalEl = document.getElementById('totalSpots');
const availableEl = document.getElementById('availableSpots');
const occupiedEl = document.getElementById('occupiedSpots');
const form = document.getElementById('reservationForm');
const messageEl = document.getElementById('message');
const tbody = document.getElementById('reservationsBody');
const noResEl = document.getElementById('noReservations');

// 初始化
function init() {
    totalEl.textContent = TOTAL_SPOTS;
    updateStats();
    renderReservations();
    setInterval(updateStats, 5000); // 每 5 秒更新一次實時狀態
}

// 計算當前佔用車位
function getOccupiedCount(now = Date.now()) {
    return reservations.filter(r => {
        const entry = new Date(r.entry).getTime();
        const exit = new Date(r.exit).getTime();
        return entry <= now && now <= exit;
    }).length;
}

// 檢查新預約是否會導致超額（簡單檢查：該時段內的重疊預約數）
function wouldExceedCapacity(entryTime, exitTime) {
    const entry = new Date(entryTime).getTime();
    const exit = new Date(exitTime).getTime();
    
    // 簡單策略：檢查是否有任何時間點重疊超過總車位
    let maxOverlap = 0;
    for (let t = entry; t <= exit; t += 60 * 60 * 1000) { // 每小時檢查一次（近似）
        const overlap = reservations.filter(r => {
            const rEntry = new Date(r.entry).getTime();
            const rExit = new Date(r.exit).getTime();
            return rEntry < t && t < rExit;
        }).length;
        if (overlap >= TOTAL_SPOTS) return true;
        maxOverlap = Math.max(maxOverlap, overlap);
    }
    // 再加上新預約本身
    return maxOverlap + 1 > TOTAL_SPOTS;
}

// 更新統計數據
function updateStats() {
    const occupied = getOccupiedCount();
    const available = Math.max(0, TOTAL_SPOTS - occupied);
    
    availableEl.textContent = available;
    occupiedEl.textContent = occupied;
    
    // 顏色提示
    if (available <= 5) {
        availableEl.classList.add('text-orange-500');
        availableEl.classList.remove('text-green-600');
    } else {
        availableEl.classList.remove('text-orange-500');
        availableEl.classList.add('text-green-600');
    }
}

// 渲染預約列表
function renderReservations() {
    tbody.innerHTML = '';
    const now = Date.now();
    
    if (reservations.length === 0) {
        noResEl.classList.remove('hidden');
        return;
    }
    noResEl.classList.add('hidden');
    
    // 按進入時間排序
    const sorted = [...reservations].sort((a, b) => new Date(a.entry) - new Date(b.entry));
    
    sorted.forEach(res => {
        const entry = new Date(res.entry);
        const exit = new Date(res.exit);
        const entryMs = entry.getTime();
        const exitMs = exit.getTime();
        
        let status = '即將到來';
        let statusClass = 'bg-yellow-100 text-yellow-800';
        if (entryMs <= now && now <= exitMs) {
            status = '進行中';
            statusClass = 'bg-green-100 text-green-800';
        } else if (now > exitMs) {
            status = '已結束';
            statusClass = 'bg-gray-100 text-gray-600';
        }
        
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td class="px-4 py-3 font-medium">${res.plate}</td>
            <td class="px-4 py-3">${formatDateTime(entry)}</td>
            <td class="px-4 py-3">${formatDateTime(exit)}</td>
            <td class="px-4 py-3">
                <span class="px-2 py-1 text-xs font-semibold rounded-full ${statusClass}">${status}</span>
            </td>
            <td class="px-4 py-3">
                <button onclick="cancelReservation('${res.id}')" 
                        class="text-red-600 hover:text-red-800 text-sm font-medium">取消</button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

// 格式化日期時間
function formatDateTime(date) {
    return date.toLocaleString('zh-HK', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
    });
}

// 生成唯一 ID
function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
}

// 表單提交
form.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const plate = document.getElementById('plate').value.trim().toUpperCase();
    const entryTime = document.getElementById('entryTime').value;
    const exitTime = document.getElementById('exitTime').value;
    
    if (!plate || !entryTime || !exitTime) {
        showMessage('請填寫所有欄位', 'error');
        return;
    }
    
    const entry = new Date(entryTime);
    const exit = new Date(exitTime);
    
    if (exit <= entry) {
        showMessage('離開時間必須晚於進入時間', 'error');
        return;
    }
    
    // 檢查是否會超額（簡化檢查）
    if (wouldExceedCapacity(entryTime, exitTime)) {
        showMessage('該時段車位可能已滿，無法預約', 'error');
        return;
    }
    
    const newRes = {
        id: generateId(),
        plate,
        entry: entryTime,
        exit: exitTime
    };
    
    reservations.push(newRes);
    saveReservations();
    form.reset();
    showMessage('預約成功！', 'success');
    updateStats();
    renderReservations();
});

// 取消預約
function cancelReservation(id) {
    if (confirm('確定要取消此預約嗎？')) {
        reservations = reservations.filter(r => r.id !== id);
        saveReservations();
        updateStats();
        renderReservations();
        showMessage('預約已取消', 'success');
    }
}

// 儲存到 localStorage
function saveReservations() {
    localStorage.setItem('parkingReservations', JSON.stringify(reservations));
}

// 顯示訊息
function showMessage(text, type) {
    messageEl.textContent = text;
    messageEl.className = `mt-3 text-sm font-medium ${type === 'success' ? 'text-green-600' : 'text-red-600'}`;
    setTimeout(() => {
        messageEl.textContent = '';
    }, 4000);
}

// 暴露給全局以便按鈕使用
window.cancelReservation = cancelReservation;

// 啟動
init();
