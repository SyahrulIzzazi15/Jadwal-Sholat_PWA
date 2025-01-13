// Mendaftarkan service worker untuk mendukung PWA dan caching
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/service-worker.js')
        .then(registration => {
            console.log('Service Worker registered with scope:', registration.scope);
        })
        .catch(error => {
            console.log('Service Worker registration failed:', error);
        });
}

let deferredPrompt;

window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    const installButton = document.createElement('button');
    installButton.innerText = 'Install App';
    installButton.style.position = 'fixed';
    installButton.style.bottom = '10px';
    installButton.style.right = '10px';
    document.body.appendChild(installButton);

    installButton.addEventListener('click', () => {
        deferredPrompt.prompt();
        deferredPrompt.userChoice.then((choiceResult) => {
            if (choiceResult.outcome === 'accepted') {
                console.log('User accepted the install prompt');
            } else {
                console.log('User dismissed the install prompt');
            }
            deferredPrompt = null;
            document.body.removeChild(installButton);
        });
    });
});

document.addEventListener('DOMContentLoaded', () => {
    const citySelect = document.getElementById('city-select');

    // Event listener untuk menangani perubahan kota yang dipilih oleh pengguna
    citySelect.addEventListener('change', () => {
        const city = citySelect.value;
        localStorage.setItem('selectedCity', city);
        fetchJadwalSholat(city);
    });

    const savedCity = localStorage.getItem('selectedCity');
    if (savedCity) {
        citySelect.value = savedCity;
        fetchJadwalSholat(savedCity);
    } else {
        fetchJadwalSholat(citySelect.value);
    }

    updateTime();
    setInterval(updateTime, 1000);

    setTimeout(() => {
        document.getElementById('splash-screen').style.display = 'none';
    }, 1000);
});

function fetchJadwalSholat(city) {
    // Data jadwal sholat lokal
    const jadwalSholat = {
        Tegal: { Fajr: "04:09", Dhuhr: "11:49", Asr: "15:15", Maghrib: "18:04", Isha: "19:20" },
        Semarang: { Fajr: "04:03", Dhuhr: "11:43", Asr: "15:10", Maghrib: "17:59", Isha: "19:15" },
        Yogyakarta: { Fajr: "04:02", Dhuhr: "11:44", Asr: "15:10", Maghrib: "18:01", Isha: "19:17" },
        Jakarta: { Fajr: "04:19", Dhuhr: "11:58", Asr: "15:25", Maghrib: "18:12", Isha: "19:28" },
        Bandung: { Fajr: "04:14", Dhuhr: "11:55", Asr: "15:21", Maghrib: "18:10", Isha: "19:26" },
        Surabaya: { Fajr: "03:53", Dhuhr: "11:34", Asr: "15:01", Maghrib: "17:50", Isha: "19:06" },
        Palembang: { Fajr: "04:34", Dhuhr: "12:06", Asr: "15:32", Maghrib: "18:15", Isha: "19:30" },
        Bogor: { Fajr: "04:18", Dhuhr: "11:58", Asr: "15:25", Maghrib: "18:13", Isha: "19:29" },
        Malang: { Fajr: "03:52", Dhuhr: "11:35", Asr: "15:01", Maghrib: "17:52", Isha: "19:08" }
    };

    const jadwal = jadwalSholat[city];

    if (jadwal) {
        const jadwalContainer = document.getElementById('jadwal-sholat');
        jadwalContainer.innerHTML = `
            <div class="jadwal-item">
                <p>Subuh</p>
                <p>${jadwal.Fajr}</p>
            </div>
            <div class="jadwal-item">
                <p>Dzuhur</p>
                <p>${jadwal.Dhuhr}</p>
            </div>
            <div class="jadwal-item">
                <p>Ashar</p>
                <p>${jadwal.Asr}</p>
            </div>
            <div class="jadwal-item">
                <p>Maghrib</p>
                <p>${jadwal.Maghrib}</p>
            </div>
            <div class="jadwal-item">
                <p>Isya</p>
                <p>${jadwal.Isha}</p>
            </div>
        `;
    } else {
        console.log(`Jadwal sholat untuk kota ${city} tidak ditemukan.`);
    }
}

function updateTime() {
    const now = new Date();
    const timeString = now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    document.getElementById('current-time').textContent = `Sekarang: ${timeString}`;
}

// Event listener untuk tombol "Aktifkan Notifikasi"
document.getElementById('enable-notifications').addEventListener('click', () => {
    if ('Notification' in window && 'serviceWorker' in navigator) {
        Notification.requestPermission().then(permission => {
            if (permission === 'granted') {
                navigator.serviceWorker.ready.then(registration => {
                    registration.showNotification('Notifikasi Aktif!', {
                        body: 'Anda akan menerima notifikasi jadwal sholat.',
                        icon: '/icon-192x192.png',
                    });
                });
                console.log('Notifikasi diaktifkan.');
            } else {
                console.log('Notifikasi ditolak oleh pengguna.');
            }
        });
    } else {
        alert('Browser Anda tidak mendukung notifikasi.');
    }
});

// Fungsi untuk mengirim notifikasi
function sendNotification(title, options) {
    if (Notification.permission === 'granted') {
        navigator.serviceWorker.ready.then(registration => {
            registration.showNotification(title, options);
        });
    }
}

// Fungsi untuk menjadwalkan notifikasi berdasarkan jadwal sholat
function schedulePrayerNotifications(city) {
    const jadwalSholat = {
        Tegal: { Fajr: "04:09", Dhuhr: "11:49", Asr: "15:15", Maghrib: "18:04", Isha: "19:20" },
        Semarang: { Fajr: "04:03", Dhuhr: "11:43", Asr: "15:10", Maghrib: "17:59", Isha: "19:15" },
        Yogyakarta: { Fajr: "04:02", Dhuhr: "11:44", Asr: "15:10", Maghrib: "18:01", Isha: "19:17" },
        Jakarta: { Fajr: "04:19", Dhuhr: "11:58", Asr: "15:25", Maghrib: "18:12", Isha: "19:28" },
        Bandung: { Fajr: "04:14", Dhuhr: "11:55", Asr: "15:21", Maghrib: "18:10", Isha: "19:26" },
        Surabaya: { Fajr: "03:53", Dhuhr: "11:34", Asr: "15:01", Maghrib: "17:50", Isha: "19:06" },
        Palembang: { Fajr: "04:34", Dhuhr: "12:06", Asr: "15:32", Maghrib: "18:15", Isha: "19:30" },
        Bogor: { Fajr: "04:18", Dhuhr: "11:58", Asr: "15:25", Maghrib: "18:13", Isha: "19:29" },
        Malang: { Fajr: "03:52", Dhuhr: "11:35", Asr: "15:01", Maghrib: "17:52", Isha: "19:08" }
    };

    const jadwal = jadwalSholat[city];
    if (jadwal) {
        Object.entries(jadwal).forEach(([prayer, time]) => {
            const [hour, minute] = time.split(':').map(Number);
            const now = new Date();
            const notificationTime = new Date();
            notificationTime.setHours(hour, minute, 0, 0);

            if (notificationTime > now) {
                const delay = notificationTime - now;
                setTimeout(() => {
                    sendNotification(`Waktu ${prayer}`, {
                        body: `Sudah masuk waktu ${prayer} di kota ${city}.`,
                        icon: '/icon-192x192.png',
                    });
                }, delay);
            }
        });
    }
}

// Panggil fungsi setelah memilih kota
const citySelect = document.getElementById('city-select');
citySelect.addEventListener('change', () => {
    const city = citySelect.value;
    schedulePrayerNotifications(city);
});
