function findClosestBlowerMotor() {
  const resultsDiv = document.getElementById("results");
  
  // Get values with unit conversion
  const airflow = getValueWithUnit ? (getValueWithUnit("blowerAirflow") || parseFloat(document.getElementById("blowerAirflow").value)) : parseFloat(document.getElementById("blowerAirflow").value);
  const staticPressure = getValueWithUnit ? (getValueWithUnit("blowerPressure") || parseFloat(document.getElementById("blowerPressure").value)) : parseFloat(document.getElementById("blowerPressure").value);
  const fanEfficiencyPercent = parseFloat(document.getElementById("blowerFanEff").value);
  const motorEfficiencyPercent = parseFloat(document.getElementById("blowerMotorEff").value);
  const rpm = parseFloat(document.getElementById("blowerRequiredSpeed").value);
  
  const blowerResults = sizeBlowerMotor({
    airflow,
    staticPressure,
    fanEfficiencyPercent,
    motorEfficiencyPercent,
    rpm
  });

  // Get selected result units (check stored preferences first, then fallback to controls, then defaults)
  let powerUnit = "W";
  let torqueUnit = "Nm";
  
  if (window.selectedResultUnits?.power) {
    powerUnit = window.selectedResultUnits.power;
  } else if (document.getElementById("blowerPowerUnit")) {
    powerUnit = document.getElementById("blowerPowerUnit").value;
  }
  
  if (window.selectedResultUnits?.torque) {
    torqueUnit = window.selectedResultUnits.torque;
  } else if (document.getElementById("blowerTorqueUnit")) {
    torqueUnit = document.getElementById("blowerTorqueUnit").value;
  }

  // Convert results to selected units
  const fanPowerDisplay = convertResultValue(blowerResults.fanPowerWatts, 'power', powerUnit);
  const motorPowerDisplay = convertResultValue(blowerResults.motorPowerWatts, 'power', powerUnit);
  const torqueDisplay = blowerResults.torqueNm ? convertResultValue(blowerResults.torqueNm, 'torque', torqueUnit) : null;

  // Use standardized results display with converted values and units
  const outputs = {
    [`Fan Power (${powerUnit})`]: parseFloat(fanPowerDisplay.toFixed(3)),
    [`Motor Power (${powerUnit})`]: parseFloat(motorPowerDisplay.toFixed(3)),
    [`Torque Required (${torqueUnit})`]: torqueDisplay ? parseFloat(torqueDisplay.toFixed(3)) : "N/A (Speed required)"
  };
  displayStandardResults(outputs);
}

function sizeBlowerMotor(params) {
  const {
    airflow,                        // m³/s
    staticPressure,                 // Pa
    fanEfficiencyPercent,           // %
    motorEfficiencyPercent,         // %
    rpm = null,                     // RPM (optional, for torque calculation)
  } = params;

  // Calculate fan power using formulas
  const fanPower = blowerformulas.fanPower(airflow, staticPressure, fanEfficiencyPercent); // W

  // Calculate motor power using formulas
  const motorPower = blowerformulas.motorPower(fanPower, motorEfficiencyPercent); // W

  // Convert to horsepower using formulas
  const motorPowerHP = blowerformulas.motorPowerHP(motorPower);

  // Calculate torque using formulas
  const torqueNm = blowerformulas.blowerTorque(motorPower, rpm);

  // Return results as raw numbers (without units or formatting)
  return {
    fanPowerWatts: fanPower,        // W (raw number)
    motorPowerWatts: motorPower,    // W (raw number)
    motorPowerHP: motorPowerHP,     // HP (raw number, but not used in unit conversion)
    torqueNm: torqueNm              // Nm (raw number or null)
  };
}