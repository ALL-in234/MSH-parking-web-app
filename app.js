// 停車場預約系統（滾輪式進入時段選擇，每時段限 20 輛）
const TOTAL_SPOTS = 50;
const SLOT_LIMIT = 20;

const TIME_SLOTS = [
    { label: "08:00-09:00", start: "08:00" },
    { label: "09:00-10:00", start: "09:00" },
    { label: "10:00-11:00", start: "10:00" },
    { label: "11:00-12:00", start: "11:00" },
    { label: "12:00-13:00", start: "12:00" },
    { label: "13:00-14:00", start: "13:00" },
    { label: "14:00-15:00", start: "14:00" },
    { label: "15:00-16:00", start: "15:00" },
    { label: "16:00-17:00", start: "16:00" },
    { label: "17:00-18:00", start: "17:00" },
    { label: "18:00-19:00", start: "18:00" },
    { label: "19:00-20:00", start: "19:00" },
    { label: "20:00-21:00", start: "20:00" },
    { label: "21:00-22:00", start: "21:00" }
];

let reservations = JSON.parse(localStorage.getItem('parkingReservations')) || [];
let selectedSlotIndex = null;

// DOM
const totalEl = document.getElementById('totalSpots');
const availableEl = document.getElementById('availableSpots');
const occupiedEl = document.getElementById('occupiedSpots');
const form = document.getElementById('reservationForm');
const messageEl = document.getElementById('message');
const tbody = document.getElementById('reservationsBody');
const noResEl = document.getElementById('noReservations');
const reserveDateInput = document.getElementById('reserveDate');
const slotAvailabilityDiv = document.getElementById('slotAvailability');
const slotPicker = document.getElementById('slotPicker');
const selectedSlotDisplay = document.getElementById('selectedSlotDisplay');
const selectedSlotInput = document.getElementById('selectedSlotIndex');

function getSlotCount(date, slotIndex) {
    return reservations.filter(r => r.date === date && r.slotIndex === slotIndex).length;
}

function renderSlotAvailability(date) {
    slotAvailabilityDiv.innerHTML = '';
    TIME_SLOTS.forEach((slot, index) => {
        const count = getSlotCount(date, index);
        const remaining = SLOT_LIMIT - count;
        const div = document.createElement('div');
        div.className = `p-3 rounded-lg text-center text-sm ${remaining > 5 ? 'bg-green-50 text-green-700' : remaining > 0 ? 'bg-yellow-50 text-yellow-700' : 'bg-red-50 text-red-700'}`;
        div.innerHTML = `
            <div class="font-medium">${slot.label}</div>
            <div class="text-lg font-bold">${remaining} / ${SLOT_LIMIT}</div>
        `;
        slotAvailabilityDiv.appendChild(div);
    });
}

function renderSlotPicker(date) {
    slotPicker.innerHTML = '';
    selectedSlotIndex = null;
    selectedSlotInput.value = '';
    selectedSlotDisplay.textContent = '請選擇一個時段';

    TIME_SLOTS.forEach((slot, index) => {
        const count = getSlotCount(date, index);
        const remaining = SLOT_LIMIT - count;
        const isFull = remaining <= 0;

        const item = document.createElement('div');
        item.className = `slot-item px-4 py-3 rounded-lg cursor-pointer transition-all duration-200 ${
            isFull 
                ? 'bg-gray-200 text-gray-400 cursor-not-allowed' 
                : 'bg-white hover:bg-blue-50 hover:shadow border border-gray-200'
        }`;
        item.dataset.index = index;
        item.innerHTML = `
            <div class="flex justify-between items-center">
                <span class="font-medium">${slot.label}</span>
                <span class="text-sm ${isFull ? 'text-red-500' : 'text-green-600'}">
                    剩餘 ${remaining}
                </span>
            </div>
        `;

        if (!isFull) {
            item.addEventListener('click', () => selectSlot(index, item));
        }

        slotPicker.appendChild(item);
    });
}

function selectSlot(index, element) {
    // 移除其他選中狀態
    document.querySelectorAll('.slot-item').forEach(el => {
        el.classList.remove('bg-blue-600', 'text-white', 'border-blue-600');
        if (!el.classList.contains('bg-gray-200')) {
            el.classList.add('bg-white', 'border-gray-200');
        }
    });

    // 選中當前
    element.classList.remove('bg-white', 'border-gray-200', 'hover:bg-blue-50');
    element.classList.add('bg-blue-600', 'text-white', 'border-blue-600');

    selectedSlotIndex = index;
    selectedSlotInput.value = index;
    selectedSlotDisplay.textContent = `已選擇：${TIME_SLOTS[index].label}`;
}

function initSlots() {
    const date = reserveDateInput.value || new Date().toISOString().split('T')[0];
    renderSlotAvailability(date);
    renderSlotPicker(date);
}

function init() {
    totalEl.textContent = TOTAL_SPOTS;
    const today = new Date().toISOString().split('T')[0];
    reserveDateInput.value = today;
    reserveDateInput.min = today;
    initSlots();
    updateStats();
    renderReservations();
    setInterval(updateStats, 5000);

    reserveDateInput.addEventListener('change', initSlots);
}

// 假設每筆預約佔用至當日 22:30
function getOccupiedCount(now = Date.now()) {
    return reservations.filter(r => {
        const entry = new Date(r.entry).getTime();
        const exit = new Date(r.exit).getTime();
        return entry <= now && now <= exit;
    }).length;
}

function updateStats() {
    const occupied = getOccupiedCount();
    const available = Math.max(0, TOTAL_SPOTS - occupied);
    availableEl.textContent = available;
    occupiedEl.textContent = occupied;

    if (available <= 5) {
        availableEl.classList.add('text-orange-500');
        availableEl.classList.remove('text-green-600');
    } else {
        availableEl.classList.remove('text-orange-500');
        availableEl.classList.add('text-green-600');
    }
}

function renderReservations() {
    tbody.innerHTML = '';
    const now = Date.now();

    if (reservations.length === 0) {
        noResEl.classList.remove('hidden');
        return;
    }
    noResEl.classList.add('hidden');

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
            <td class="px-4 py-3">${res.date}</td>
            <td class="px-4 py-3">${res.slotLabel}</td>
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

function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
}

form.addEventListener('submit', (e) => {
    e.preventDefault();

    const plate = document.getElementById('plate').value.trim().toUpperCase();
    const date = reserveDateInput.value;

    if (!plate || !date) {
        showMessage('請填寫車牌與日期', 'error');
        return;
    }

    if (selectedSlotIndex === null) {
        showMessage('請選擇進入時段', 'error');
        return;
    }

    const count = getSlotCount(date, selectedSlotIndex);
    if (count >= SLOT_LIMIT) {
        showMessage('該時段已額滿（20 輛）', 'error');
        return;
    }

    const slot = TIME_SLOTS[selectedSlotIndex];
    const entryDate = new Date(`${date}T${slot.start}:00`);
    const exitDate = new Date(`${date}T22:30:00`);

    const newRes = {
        id: generateId(),
        plate,
        date,
        slotIndex: selectedSlotIndex,
        slotLabel: slot.label,
        entry: entryDate.toISOString(),
        exit: exitDate.toISOString()
    };

    reservations.push(newRes);
    saveReservations();
    form.reset();
    initSlots();
    showMessage('預約成功！', 'success');
    updateStats();
    renderReservations();
});

function cancelReservation(id) {
    if (confirm('確定要取消此預約嗎？')) {
        reservations = reservations.filter(r => r.id !== id);
        saveReservations();
        initSlots();
        updateStats();
        renderReservations();
        showMessage('預約已取消', 'success');
    }
}

function saveReservations() {
    localStorage.setItem('parkingReservations', JSON.stringify(reservations));
}

function showMessage(text, type) {
    messageEl.textContent = text;
    messageEl.className = `mt-3 text-sm font-medium ${type === 'success' ? 'text-green-600' : 'text-red-600'}`;
    setTimeout(() => { messageEl.textContent = ''; }, 4000);
}

window.cancelReservation = cancelReservation;
init();
