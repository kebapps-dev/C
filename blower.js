function findClosestBlowerMotor() {
  const resultsDiv = document.getElementById("results");
  const blowerResults = sizeBlowerMotor(
    {
        airflowCFM : parseFloat(document.getElementById("blowerAirflow").value), // m³/h
        staticPressureInH2O : parseFloat(document.getElementById("blowerPressure").value), // bar
        fanEfficiencyPercent : parseFloat(document.getElementById("blowerFanEff").value), // %
        motorEfficiencyPercent : parseFloat(document.getElementById("blowerMotorEff").value), // %
        rpm : parseFloat(document.getElementById("blowerRequiredSpeed").value) // RPM},
      }

  );
    resultsDiv.innerHTML = `
      <p><strong>
        Fan Power: ${blowerResults.fanPowerWatts} <br>
        Motor Power: ${blowerResults.motorPowerWatts}, ${blowerResults.motorPowerHP} <br>
        Torque Required: ${blowerResults.torqueNm} <br>
      </strong></p>`;
}

function sizeBlowerMotor(params) {
  const {
    airflowCFM,                     // CFM
    staticPressureInH2O,            // inH2O
    fanEfficiencyPercent,           // %
    motorEfficiencyPercent,         // %
    rpm = null,                     // RPM (optional, for torque calculation)
  } = params;
 
  // Convert inputs to SI units
  const airflow = airflowCFM * 0.0004719;           // m³/s
  const pressure = staticPressureInH2O * 249.1;     // Pa
  const fanEff = fanEfficiencyPercent / 100;        // decimal
  const motorEff = motorEfficiencyPercent / 100;    // decimal

  // Calculate fan power (W)
  const fanPower = (airflow * pressure) / fanEff;

  // Motor shaft power adjusted for efficiency
  const motorPower = fanPower / motorEff;

  // Convert to horsepower
  const motorPowerHP = motorPower / 745.7;

  // Suggest next standard motor size (rounded up)
  const suggestedHP = Math.ceil(motorPowerHP);

  // Optional torque calculation (only if RPM is provided)
  let torqueNm = null;
  if (rpm && rpm > 0) {
    const omega = (2 * Math.PI * rpm) / 60;  // rad/s
    torqueNm = motorPower / omega;
  }

  // Return results
  return {
    fanPowerWatts: (fanPower/1000).toFixed(2) + ' kW',
    motorPowerWatts: (motorPower/1000).toFixed(2) + ' kW',
    motorPowerHP: motorPowerHP.toFixed(2) + '  HP',
    torqueNm: torqueNm ? torqueNm.toFixed(2) + ' Nm': null
  };
}