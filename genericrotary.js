// Generic Rotary Motor Sizing Application
// Now uses standardized results display from main.js

function findClosestGenericRotaryMotor() {
    // Check for empty input boxes and reset state if needed
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
        if (!el || el.value === "" || el.value === null) {
            hasEmpty = true;
            break;
        }
    }
    if (hasEmpty) {
        // Reset standardized display state
        startingValues = [];
        showSegments = false;
    }

    const resultsDiv = document.getElementById("results");
    
    // Check if all required elements exist before proceeding
    const requiredElements = [
        "genericMomentOfInertia", 
        "genericRequiredSpeed", 
        "genericAccelTime", "genericRunTime", "genericDecelTime", "genericRestTime",
        "genericFrictionTorque", 
        "genericThermalMarginPercent"
    ];
    
    for (const id of requiredElements) {
        const el = document.getElementById(id);
        if (!el) {
            console.warn(`Required element ${id} not found in DOM`);
            return;
        }
    }
    
    const rmsresults = sizeGenericRotaryMotor(
        {
            inertia : getValueWithUnit("genericMomentOfInertia"), // kg·m²
            targetSpeed : getValueWithUnit("genericRequiredSpeed"), // rad/s
            accelTime : parseFloat(document.getElementById("genericAccelTime").value), // s
            runTime : parseFloat(document.getElementById("genericRunTime").value), // s
            decelTime : parseFloat(document.getElementById("genericDecelTime").value), // s
            restTime : parseFloat(document.getElementById("genericRestTime").value), // s
            frictionTorque : getValueWithUnit("genericFrictionTorque"), // Nm
            thermalMarginPercent : parseFloat(document.getElementById("genericThermalMarginPercent").value) // e.g., 20 = 20%
        }
    );

    const outputs = {
        "(1) Required Motor Power kW": rmsresults.contPowerWithMargin,
        "    Required Motor Power HP": rmsresults.contPowerHPWithMargin,
        "(2) Accel Torque": rmsresults.accelTorque,
        "(3) RMS Torque": rmsresults.rmsTorque,
    };
    displayStandardResults(outputs);
}

function sizeGenericRotaryMotor(params) {
    const {
      inertia,              // kg·m²
      targetSpeed,          // rad/s
      accelTime,            // s
      runTime,              // s
      decelTime,            // s
      restTime,             // s
      frictionTorque,       // Nm
      thermalMarginPercent  // e.g., 20 = 20%
    } = params;

    const totalCycleTime = accelTime + runTime + decelTime + restTime;
    const g = 9.81;

    // Acceleration torque = J * α = J * ω / t
    const accelTorque = inertia * (targetSpeed / accelTime);
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
    const contPower = rmsTorque * targetSpeed;
    // <span class="math-tooltip">ⓘ<span class="math-tooltiptext">\( P = T_{rms} \cdot \omega \)<br>Where:<br>P = power (W)<br>\(T_{rms}\) = RMS torque (Nm)<br>\(\omega\) = angular velocity (rad/s)</span></span>

    // Add thermal margin
    const contPowerWithMargin = contPower * (1 + thermalMarginPercent / 100);
    // <span class="math-tooltip">ⓘ<span class="math-tooltiptext">\( P_{margin} = P \cdot (1 + \frac{\text{margin}}{100}) \)<br>Where:<br>\(P_{margin}\) = power with margin<br>P = calculated power<br>margin = thermal margin (%)</span></span>

    return {
      targetSpeed: targetSpeed.toFixed(2) + ' rad/s',
      accelTorque: accelTorque.toFixed(2) + ' Nm',
      rmsTorque: rmsTorque.toFixed(2) + ' Nm',
      contPower: (contPower / 1000).toFixed(2) + ' kW',
      contPowerWithMargin: (contPowerWithMargin / 1000).toFixed(2) + ' kW',
      contPowerHP: (contPower / 745.7).toFixed(2) + ' HP',
      contPowerHPWithMargin: (contPowerWithMargin / 745.7).toFixed(2) + ' HP'
    };
}

