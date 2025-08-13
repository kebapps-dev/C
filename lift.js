function findClosestLiftMotor() {
  const resultsDiv = document.getElementById("results");
  
  // Get values with proper unit conversion
  const loadWeight = getValueWithUnit ? (getValueWithUnit("loadWeight") || parseFloat(document.getElementById("loadWeight").value)) : parseFloat(document.getElementById("loadWeight").value);
  const maxSpeed = getValueWithUnit ? (getValueWithUnit("maxSpeed") || parseFloat(document.getElementById("maxSpeed").value)) : parseFloat(document.getElementById("maxSpeed").value);
  const drumDiameter = getValueWithUnit ? (getValueWithUnit("drumDiameter") || parseFloat(document.getElementById("drumDiameter").value)) : parseFloat(document.getElementById("drumDiameter").value);
  const gearboxRatioLift = parseFloat(document.getElementById("gearboxRatioLift").value);
  const accelDecelTime = parseFloat(document.getElementById("accelDecelTime").value);
  
  console.log("Lift inputs (converted):", { loadWeight, maxSpeed, drumDiameter, gearboxRatioLift, accelDecelTime });
  
  const forceGravity = formulas.forcegravity(loadWeight);
  const gearboxOutputSpeed = formulas.angularspeed(maxSpeed, drumDiameter);
  const motorSpeed = gearboxOutputSpeed * gearboxRatioLift;
  const loadRequiredTorque = formulas.drumtorque(forceGravity, drumDiameter);
  const loadRequiredPeakTorque = formulas.peakdrumtorque(
    forceGravity,
    drumDiameter,
    loadWeight,
    formulas.peakacceleration(maxSpeed, accelDecelTime)
  );
  const motorRequiredTorque = loadRequiredTorque / gearboxRatioLift;
  const motorRequiredPeakTorque = loadRequiredPeakTorque / gearboxRatioLift;
  const requiredMotorPowerKw = formulas.motorpowerkw(loadRequiredTorque,gearboxOutputSpeed)
  const requiredMotorPowerHp = formulas.motorpowerhp(loadRequiredTorque,gearboxOutputSpeed)

  // Get selected result units from stored preferences
  const powerUnit = window.selectedResultUnits?.power || "kW";
  const torqueUnit = window.selectedResultUnits?.torque || "Nm";


  
  // Create outputs with unit-convertible results
  const outputs = {
    "Motor Speed": `${motorSpeed.toFixed(2)} RPM`,
    "Motor Required Torque": parseFloat(convertResultValue(motorRequiredTorque, 'torque', torqueUnit).toFixed(2)),
    "Motor Required Peak Torque": parseFloat(convertResultValue(motorRequiredPeakTorque, 'torque', torqueUnit).toFixed(2)),
    "Motor Required Power": parseFloat(convertResultValue(requiredMotorPowerKw, 'power', powerUnit).toFixed(2)),
    "Gearbox Output Speed": `${gearboxOutputSpeed.toFixed(2)} RPM`,
    "Gearbox Required Torque": parseFloat(convertResultValue(loadRequiredTorque, 'torque', torqueUnit).toFixed(2)),
    "Gearbox Required Peak Torque": parseFloat(convertResultValue(loadRequiredPeakTorque, 'torque', torqueUnit).toFixed(2)),
  };
  
  displayStandardResults(outputs);
  
  if (window.MathJax) MathJax.typeset();
}

  