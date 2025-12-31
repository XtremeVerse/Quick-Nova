document.addEventListener('DOMContentLoaded', () => {
    const categoryTabs = document.getElementById('category-tabs');
    const fromValue = document.getElementById('from-value');
    const fromUnit = document.getElementById('from-unit');
    const toValue = document.getElementById('to-value');
    const toUnit = document.getElementById('to-unit');
    const formulaDisplay = document.getElementById('formula-display');

    const UNITS = {
        length: {
            base: 'm',
            units: {
                nm: { name: 'Nanometer', factor: 1e-9 },
                microm: { name: 'Micrometer', factor: 1e-6 },
                mm: { name: 'Millimeter', factor: 0.001 },
                cm: { name: 'Centimeter', factor: 0.01 },
                m: { name: 'Meter', factor: 1 },
                km: { name: 'Kilometer', factor: 1000 },
                inch: { name: 'Inch', factor: 0.0254 },
                ft: { name: 'Foot', factor: 0.3048 },
                yd: { name: 'Yard', factor: 0.9144 },
                mi: { name: 'Mile', factor: 1609.344 },
                nmi: { name: 'Nautical Mile', factor: 1852 }
            }
        },
        weight: {
            base: 'kg',
            units: {
                mg: { name: 'Milligram', factor: 1e-6 },
                g: { name: 'Gram', factor: 0.001 },
                kg: { name: 'Kilogram', factor: 1 },
                t: { name: 'Metric Ton', factor: 1000 },
                oz: { name: 'Ounce', factor: 0.0283495 },
                lb: { name: 'Pound', factor: 0.453592 },
                st: { name: 'Stone', factor: 6.35029 }
            }
        },
        temperature: {
            units: {
                c: { name: 'Celsius' },
                f: { name: 'Fahrenheit' },
                k: { name: 'Kelvin' }
            }
        },
        data: {
            base: 'b',
            units: {
                b: { name: 'Bit', factor: 1 },
                B: { name: 'Byte', factor: 8 },
                KB: { name: 'Kilobyte', factor: 8 * 1024 },
                MB: { name: 'Megabyte', factor: 8 * 1024 * 1024 },
                GB: { name: 'Gigabyte', factor: 8 * 1024 * 1024 * 1024 },
                TB: { name: 'Terabyte', factor: 8 * 1024 * 1024 * 1024 * 1024 }
            }
        },
        time: {
            base: 's',
            units: {
                ns: { name: 'Nanosecond', factor: 1e-9 },
                ms: { name: 'Millisecond', factor: 0.001 },
                s: { name: 'Second', factor: 1 },
                min: { name: 'Minute', factor: 60 },
                h: { name: 'Hour', factor: 3600 },
                d: { name: 'Day', factor: 86400 },
                w: { name: 'Week', factor: 604800 },
                mo: { name: 'Month (Avg)', factor: 2.628e+6 },
                y: { name: 'Year', factor: 3.154e+7 }
            }
        }
    };

    let currentCategory = 'length';

    function populateUnits(category) {
        const units = UNITS[category].units;
        const options = Object.keys(units).map(key => `<option value="${key}">${units[key].name}</option>`).join('');
        
        fromUnit.innerHTML = options;
        toUnit.innerHTML = options;

        // Set defaults
        if (category === 'length') {
            fromUnit.value = 'm';
            toUnit.value = 'cm';
        } else if (category === 'weight') {
            fromUnit.value = 'kg';
            toUnit.value = 'lb';
        } else if (category === 'temperature') {
            fromUnit.value = 'c';
            toUnit.value = 'f';
        }
    }

    function convert() {
        const val = parseFloat(fromValue.value);
        if (isNaN(val)) {
            toValue.value = '';
            return;
        }

        const from = fromUnit.value;
        const to = toUnit.value;

        let result;

        if (currentCategory === 'temperature') {
            result = convertTemp(val, from, to);
        } else {
            const fromFactor = UNITS[currentCategory].units[from].factor;
            const toFactor = UNITS[currentCategory].units[to].factor;
            result = val * fromFactor / toFactor;
        }

        // Format result (avoid floating point errors)
        toValue.value = parseFloat(result.toPrecision(12)); // Clean up tiny errors
    }

    function convertTemp(val, from, to) {
        if (from === to) return val;

        let c;
        // Convert to Celsius first
        if (from === 'c') c = val;
        else if (from === 'f') c = (val - 32) * 5/9;
        else if (from === 'k') c = val - 273.15;

        // Convert from Celsius to target
        if (to === 'c') return c;
        else if (to === 'f') return c * 9/5 + 32;
        else if (to === 'k') return c + 273.15;
    }

    categoryTabs.addEventListener('click', (e) => {
        if (e.target.tagName === 'BUTTON') {
            // Update UI
            categoryTabs.querySelectorAll('button').forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');

            // Update State
            currentCategory = e.target.dataset.category;
            populateUnits(currentCategory);
            convert();
        }
    });

    fromValue.addEventListener('input', convert);
    fromUnit.addEventListener('change', convert);
    toUnit.addEventListener('change', convert);

    // Initial load
    populateUnits(currentCategory);
    convert();
});
