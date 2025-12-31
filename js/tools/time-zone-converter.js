document.addEventListener('DOMContentLoaded', () => {
    const dtInput = document.getElementById('datetime-input');
    const fromZone = document.getElementById('from-zone');
    const toZone = document.getElementById('to-zone');
    const convertBtn = document.getElementById('convert-btn');
    const resultCard = document.getElementById('result-card');
    const fromDisplay = document.getElementById('from-display');
    const toDisplay = document.getElementById('to-display');

    const fallbackZones = [
        'UTC', 'Etc/GMT',
        'America/Los_Angeles', 'America/Denver', 'America/Chicago', 'America/New_York',
        'Europe/London', 'Europe/Berlin', 'Europe/Paris',
        'Africa/Cairo', 'Africa/Johannesburg',
        'Asia/Dubai', 'Asia/Kolkata', 'Asia/Bangkok', 'Asia/Hong_Kong', 'Asia/Tokyo', 'Asia/Seoul',
        'Australia/Sydney', 'Pacific/Auckland'
    ];

    init();

    async function init() {
        setDefaultDateTime();
        await populateZones();
        fromZone.value = getLocalTimeZone();
        if (!fromZone.value) fromZone.value = 'UTC';
        toZone.value = 'UTC';
        convert();
    }

    function setDefaultDateTime() {
        const now = new Date();
        // Format for input[type="datetime-local"] => YYYY-MM-DDTHH:MM
        const pad = (n) => String(n).padStart(2, '0');
        const value = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}T${pad(now.getHours())}:${pad(now.getMinutes())}`;
        dtInput.value = value;
    }

    async function populateZones() {
        try {
            const res = await fetch('https://worldtimeapi.org/api/timezone');
            if (!res.ok) throw new Error('Failed to fetch time zones');
            const zones = await res.json();
            fillSelect(fromZone, zones);
            fillSelect(toZone, zones);
        } catch (e) {
            console.warn('Using fallback time zones', e);
            fillSelect(fromZone, fallbackZones);
            fillSelect(toZone, fallbackZones);
        }
    }

    function fillSelect(select, zones) {
        select.innerHTML = '';
        zones.forEach(z => {
            const opt = document.createElement('option');
            opt.value = z;
            opt.textContent = z;
            select.appendChild(opt);
        });
    }

    function getLocalTimeZone() {
        try { return Intl.DateTimeFormat().resolvedOptions().timeZone; }
        catch { return 'UTC'; }
    }

    function parseInputDate() {
        const v = dtInput.value;
        // v like "2026-01-01T12:34"
        const [datePart, timePart] = v.split('T');
        const [y, m, d] = datePart.split('-').map(n => parseInt(n, 10));
        const [hh, mm] = timePart.split(':').map(n => parseInt(n, 10));
        return { y, m, d, hh, mm };
    }

    // Convert a wall-clock time in a specific IANA zone to a UTC Date
    function zonedTimeToUtc({ y, m, d, hh, mm }, zone) {
        // Start with the naive date as if it were UTC
        const utcGuess = new Date(Date.UTC(y, m - 1, d, hh, mm, 0, 0));
        // Convert that guess to the given zone, then measure the difference
        const asLocalInZone = new Date(utcGuess.toLocaleString('en-US', { timeZone: zone }));
        const diffMs = utcGuess.getTime() - asLocalInZone.getTime();
        return new Date(utcGuess.getTime() + diffMs);
    }

    function fmt(date, zone) {
        const dtf = new Intl.DateTimeFormat('en-GB', {
            timeZone: zone,
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            weekday: 'short',
            hour12: false
        });
        return dtf.format(date);
    }

    function convert() {
        try {
            const parts = parseInputDate();
            const from = fromZone.value || 'UTC';
            const to = toZone.value || 'UTC';

            // Compute the UTC instant for the "from" wall-clock time
            const instantUtc = zonedTimeToUtc(parts, from);

            // Format displays
            const fromText = `${fmt(instantUtc, from)} (${from})`;
            const toText = `${fmt(instantUtc, to)} (${to})`;

            fromDisplay.textContent = fromText;
            toDisplay.textContent = toText;
            resultCard.style.display = 'block';
        } catch (e) {
            console.error(e);
            showToast('Conversion failed', 'error');
        }
    }

    convertBtn.addEventListener('click', convert);
    dtInput.addEventListener('change', convert);
    fromZone.addEventListener('change', convert);
    toZone.addEventListener('change', convert);
});

