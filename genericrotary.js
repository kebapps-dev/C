const SEGMENT_WIDTH = 250; // Change this value to set the width of all line segments

let previousGenericRotaryOutputs = {};
let startingValues = [];
let showSegments = false;

function lockStartingValues() {
    const resultsDiv = document.getElementById("results");
    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = resultsDiv.innerHTML;
    // Select all table rows except the header
    const items = tempDiv.querySelectorAll("tbody tr");
    startingValues = [];
    let idx = 0;
    for (const key of Object.keys(previousGenericRotaryOutputs)) {
        const item = items[idx];
        if (item) {
            // Get the value cell (second td)
            const valueCell = item.querySelectorAll("td")[1];
            if (valueCell) {
                // Extract only the first numeric value from the text
                const match = valueCell.textContent.match(/-?\d+(\.\d+)?/);
                if (match) {
                    const num = parseFloat(match[0]);
                    if (!isNaN(num)) {
                        startingValues.push(num);
                    } else {
                        startingValues.push(previousGenericRotaryOutputs[key]);
                    }
                } else {
                    startingValues.push(previousGenericRotaryOutputs[key]);
                }
            } else {
                startingValues.push(previousGenericRotaryOutputs[key]);
            }
        } else {
            startingValues.push(previousGenericRotaryOutputs[key]);
        }
        idx++;
    }
    showSegments = true;
    // Re-render results to show segments
    displayGenericRotaryResults(previousGenericRotaryOutputs);
}

function displayGenericRotaryResults(currentOutputs) {
    const resultsDiv = document.getElementById("results");
    let html = `<table style='margin-top:10px; border-collapse:collapse;'>
        <thead>
            <tr>
                <th style='text-align:left;padding:4px;'>Result</th>
                <th style='text-align:left;padding:4px;'>Value</th>
                <th style='text-align:left;padding:4px;'>Adjustment from Starting Value</th>
                <th style='text-align:left;padding:4px;'>Status</th>
            </tr>
        </thead>
        <tbody>`;
    let idx = 0;
    let waitingForStartingValuePresent = false; // Track if any row is waiting

    // Helper for color gradient for segment circle: 
    // 1% to 100% positive = green gradient (dull to bold)
    // -1% to -100% negative = red gradient (dull to bold)
    // 0% = black
    function getSegmentColor(percentChange) {
        if (percentChange > 0) {
            // Orange (#ffa500) to Red (#c80000)
            const t = Math.min(percentChange, 1);
            const r = Math.round(255 * (1 - t) + 200 * t); // 255 -> 200
            const g = Math.round(165 * (1 - t)); // 165 -> 0
            const b = 0;
            return `rgb(${r},${g},${b})`;
        } else if (percentChange < 0) {
            // Yellow (#ffff00) to Green (#00c800)
            const t = Math.min(-percentChange, 1);
            const r = Math.round(255 * (1 - t)); // 255 -> 0
            const g = Math.round(255 * (1 - t) + 200 * t); // 255 -> 200
            const b = Math.round(0 * (1 - t)); // 0 -> 0
            return `rgb(${r},${g},${b})`;
        } else {
            // Black for starting value
            return "#222";
        }
    }

    for (const [key, value] of Object.entries(currentOutputs)) {
        const numericValue = parseFloat(String(value).replace(/[^0-9.\-]/g, ''));
        const prevRaw = previousGenericRotaryOutputs[key];
        const prev = prevRaw !== undefined ? parseFloat(String(prevRaw).replace(/[^0-9.\-]/g, '')) : undefined;

        // Draw line segment if startingValues are set
        let segmentHtml = "";
        let statusHtml = "None"; // Default value is "None"
        let adjustmentHtml = "";
        if (
            showSegments &&
            startingValues[idx] !== undefined &&
            !isNaN(startingValues[idx])
        ) {
            const startVal = startingValues[idx];
            const minVal = startVal - Math.abs(startVal);
            const maxVal = startVal + Math.abs(startVal);

            // Calculate percent change from starting value
            let percentChange = 0;
            if (!isNaN(numericValue) && startVal !== 0) {
                percentChange = (numericValue - startVal) / Math.abs(startVal);
            }

            // Position for circle
            let pos = SEGMENT_WIDTH / 2;
            if (!isNaN(numericValue)) {
                pos = 10 + (SEGMENT_WIDTH - 20) * ((numericValue - minVal) / (maxVal - minVal));
            }

            // Color for circle
            const circleColor = getSegmentColor(Math.max(-1, Math.min(1, percentChange)));

            segmentHtml = `
                <svg width="${SEGMENT_WIDTH}" height="32" style="vertical-align:middle;">
                  <line x1="10" y1="12" x2="${SEGMENT_WIDTH - 10}" y2="12" stroke="#555" stroke-width="2"/>
                  <rect x="10" y="7" width="4" height="10" fill="#555" />    <!-- min tick -->
                  <rect x="${(SEGMENT_WIDTH / 2) - 2}" y="7" width="4" height="10" fill="#222" />   <!-- start tick -->
                  <rect x="${SEGMENT_WIDTH - 14}" y="7" width="4" height="10" fill="#555" />  <!-- max tick -->
                  <circle cx="${pos}" cy="12" r="10" fill="${circleColor}" />
                  <text x="0" y="30" font-size="10" fill="#555">${minVal.toFixed(2)}</text>
                  <text x="${(SEGMENT_WIDTH / 2) - 10}" y="30" font-size="10" fill="#555">${startVal.toFixed(2)}</text>
                  <text x="${SEGMENT_WIDTH - 20}" y="30" font-size="10" fill="#555">${maxVal.toFixed(2)}</text>
                </svg>
            `;

            adjustmentHtml = segmentHtml;

            // Status column logic
            if (percentChange > 1 || percentChange < -1) {
                statusHtml = `<span style="color:#c80000;font-weight:bold;">Results out of scope. Change starting values.</span>`;
            }
        } else {
            adjustmentHtml = `<span style="color:#888;">Waiting for starting value</span>`;
            statusHtml = `<span style="color:#888;">None</span>`;
            waitingForStartingValuePresent = true;
        }

        html += `<tr>
            <td style="padding:4px;">${key}</td>
            <td style="padding:4px;">${value}</td>
            <td style="padding:4px;">${adjustmentHtml}</td>
            <td style="padding:4px;">${statusHtml}</td>
        </tr>`;
        idx++;
    }
    html += "</tbody></table>";
    resultsDiv.innerHTML = html;
    previousGenericRotaryOutputs = { ...currentOutputs };

    // Blink the lock starting values button if waiting for starting value is present
    const lockBtn = document.getElementById("genericLockStartingValues");
    if (lockBtn) {
        if (waitingForStartingValuePresent) {
            lockBtn.classList.add("blink-outline");
            lockBtn.classList.remove("blink");
        } else {
            lockBtn.classList.remove("blink-outline");
            lockBtn.classList.remove("blink");
        }
    }
}

// Add this CSS to your stylesheet or <style> block:
/* Add to your CSS file or <style> block */


function findClosestGenericRotaryMotor() {
    // Check for empty input boxes
    const inputIds = [
        "genericMomentOfInertia",
        "genericRequiredSpeed",
        "genericAccelTime",
        "genericRunTime",
        "genericDecelTime",
        "genericRestTime",
        "genericFrictionTorque",
        "genericThermalMarginPercent"
    ];
    let hasEmpty = false;
    for (const id of inputIds) {
        const el = document.getElementById(id);
        if (el && (el.value === "" || el.value === null)) {
            hasEmpty = true;
            break;
        }
    }
    if (hasEmpty) {
        startingValues = [];
        showSegments = false;
    }

    const resultsDiv = document.getElementById("results");
    const rmsresults = sizeGenericRotaryMotor(
        {
            inertia : getConvertedValue(parseFloat(document.getElementById("genericMomentOfInertia").value),"inertia",document.getElementById("genericInertiaUnit").value), // kg·m²
            targetRPM : getConvertedValue(parseFloat(document.getElementById("genericRequiredSpeed").value),"speed",document.getElementById("genericSpeedUnit").value), // RPM
            accelTime : parseFloat(document.getElementById("genericAccelTime").value), // s
            runTime : parseFloat(document.getElementById("genericRunTime").value), // s
            decelTime : parseFloat(document.getElementById("genericDecelTime").value), // s
            restTime : parseFloat(document.getElementById("genericRestTime").value), // s
            frictionTorque : getConvertedValue(parseFloat(document.getElementById("genericFrictionTorque").value),"torque",document.getElementById("genericTorqueUnit").value), // Nm
            thermalMarginPercent : parseFloat(document.getElementById("genericThermalMarginPercent").value) // e.g., 20 = 20%
        }
    );

    const outputs = {
        "(1) Required Motor Power kW": rmsresults.contPowerWithMargin,
        "    Required Motor Power HP": rmsresults.contPowerHPWithMargin,
        "(2) Accel Torque": rmsresults.accelTorque,
        "(3) RMS Torque": rmsresults.rmsTorque,
    };
    displayGenericRotaryResults(outputs);
}

function sizeGenericRotaryMotor(params) {
    const {
      inertia,              // kg·m²
      targetRPM,            // RPM
      accelTime,            // s
      runTime,              // s
      decelTime,            // s
      restTime,             // s
      frictionTorque,       // Nm
      thermalMarginPercent  // e.g., 20 = 20%
    } = params;

    const totalCycleTime = accelTime + runTime + decelTime + restTime;
    const g = 9.81;

    // Convert target RPM to rad/s
    const omega = (2 * Math.PI * targetRPM) / 60;
    // <span class="math-tooltip">ⓘ<span class="math-tooltiptext">\( \omega = 2\pi \cdot \frac{\text{RPM}}{60} \)<br>Where:<br>\(\omega\) = angular velocity (rad/s)<br>RPM = revolutions per minute</span></span>

    // Acceleration torque = J * α = J * ω / t
    const accelTorque = inertia * (omega / accelTime);
    // <span class="math-tooltip">ⓘ<span class="math-tooltiptext">\( T_{accel} = J \cdot \alpha = J \cdot \frac{\omega}{t_{accel}} \)<br>Where:<br>J = moment of inertia<br>\(\omega\) = angular velocity (rad/s)<br>\(t_{accel}\) = acceleration time (s)</span></span>

    // RMS Torque Calculation
    const rmsTorque = Math.sqrt(
      (
        (accelTorque ** 2 * accelTime) +
        (frictionTorque ** 2 * runTime) +
        (frictionTorque ** 2 * decelTime) +
        (0 ** 2 * restTime)
      ) / totalCycleTime
    );
    // <span class="math-tooltip">ⓘ<span class="math-tooltiptext">\( T_{rms} = \sqrt{\frac{T_{accel}^2 t_{accel} + T_{run}^2 t_{run} + T_{decel}^2 t_{decel} + T_{rest}^2 t_{rest}}{t_{cycle}}} \)<br>Where:<br>\(T_{rms}\) = RMS torque<br>\(T_{accel}\), \(T_{run}\), \(T_{decel}\), \(T_{rest}\) = torque during each phase<br>\(t_{accel}\), \(t_{run}\), \(t_{decel}\), \(t_{rest}\) = time for each phase<br>\(t_{cycle}\) = total cycle time</span></span>

    // Continuous power (W)
    const contPower = rmsTorque * omega;
    // <span class="math-tooltip">ⓘ<span class="math-tooltiptext">\( P = T_{rms} \cdot \omega \)<br>Where:<br>P = power (W)<br>\(T_{rms}\) = RMS torque (Nm)<br>\(\omega\) = angular velocity (rad/s)</span></span>

    // Add thermal margin
    const contPowerWithMargin = contPower * (1 + thermalMarginPercent / 100);
    // <span class="math-tooltip">ⓘ<span class="math-tooltiptext">\( P_{margin} = P \cdot (1 + \frac{\text{margin}}{100}) \)<br>Where:<br>\(P_{margin}\) = power with margin<br>P = calculated power<br>margin = thermal margin (%)</span></span>

    return {
      omega: omega.toFixed(2) + ' rad/s',
      accelTorque: accelTorque.toFixed(2) + ' Nm',
      rmsTorque: rmsTorque.toFixed(2) + ' Nm',
      contPower: (contPower / 1000).toFixed(2) + ' kW',
      contPowerWithMargin: (contPowerWithMargin / 1000).toFixed(2) + ' kW',
      contPowerHP: (contPower / 745.7).toFixed(2) + ' HP',
      contPowerHPWithMargin: (contPowerWithMargin / 745.7).toFixed(2) + ' HP'
    };
}

//needs to be scalable to other applications
window.addEventListener('DOMContentLoaded', () => {
    // List all relevant input IDs for Generic Rotary
    const rotaryInputs = [
        "genericRequiredSpeed",
        "genericSpeedUnit",
        "genericAccelTime",
        "genericRunTime",
        "genericDecelTime",
        "genericRestTime",
        "genericMomentOfInertia",
        "genericInertiaUnit",
        "genericFrictionTorque",
        "genericTorqueUnit",
        "genericThermalMarginPercent"
    ];

    rotaryInputs.forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            // Only update on 'change' (for selects) or 'blur' (for inputs), or Enter key
            if (el.tagName === "SELECT") {
                el.addEventListener('change', () => {
                    const app = document.getElementById("application");
                    if (app && app.value === "Genericrotary") {
                        findClosestGenericRotaryMotor();
                    }
                });
            } else {
                el.addEventListener('blur', () => {
                    const app = document.getElementById("application");
                    if (app && app.value === "Genericrotary") {
                        findClosestGenericRotaryMotor();
                    }
                });
                el.addEventListener('keydown', (e) => {
                    if (e.key === "Enter") {
                        const app = document.getElementById("application");
                        if (app && app.value === "Genericrotary") {
                            findClosestGenericRotaryMotor();
                        }
                    }
                });
            }
        }
    });
});