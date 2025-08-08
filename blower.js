function findClosestBlowerMotor() {
  const resultsDiv = document.getElementById("results");
  
  // Get values with unit conversion
  const airflowCFM = getValueWithUnit ? (getValueWithUnit("blowerAirflow") || parseFloat(document.getElementById("blowerAirflow").value)) : parseFloat(document.getElementById("blowerAirflow").value);
  const staticPressureInH2O = getValueWithUnit ? (getValueWithUnit("blowerPressure") || parseFloat(document.getElementById("blowerPressure").value)) : parseFloat(document.getElementById("blowerPressure").value);
  const fanEfficiencyPercent = parseFloat(document.getElementById("blowerFanEff").value);
  const motorEfficiencyPercent = parseFloat(document.getElementById("blowerMotorEff").value);
  const rpm = parseFloat(document.getElementById("blowerRequiredSpeed").value);
  
  const blowerResults = sizeBlowerMotor({
    airflowCFM,
    staticPressureInH2O,
    fanEfficiencyPercent,
    motorEfficiencyPercent,
    rpm
  });

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
 
  // Convert inputs to SI units using formulas
  const airflow = blowerformulas.airflowCFMToM3S(airflowCFM);     // m³/s
  const pressure = blowerformulas.pressureInH2OToPa(staticPressureInH2O); // Pa

  // Calculate fan power using formulas
  const fanPower = blowerformulas.fanPower(airflow, pressure, fanEfficiencyPercent); // W

  // Calculate motor power using formulas
  const motorPower = blowerformulas.motorPower(fanPower, motorEfficiencyPercent); // W

  // Convert to horsepower using formulas
  const motorPowerHP = blowerformulas.motorPowerHP(motorPower);

  // Calculate torque using formulas
  const torqueNm = blowerformulas.blowerTorque(motorPower, rpm);

  // Return results
  return {
    fanPowerWatts: (fanPower/1000).toFixed(2) + ' kW',
    motorPowerWatts: (motorPower/1000).toFixed(2) + ' kW',
    motorPowerHP: motorPowerHP.toFixed(2) + '  HP',
    torqueNm: torqueNm ? torqueNm.toFixed(2) + ' Nm': null
  };
}