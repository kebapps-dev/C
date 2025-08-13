function findClosestConveyorMotor() {
  const resultsDiv = document.getElementById("results");
  
  // Get values with proper unit conversion
  const loadMass = getValueWithUnit ? (getValueWithUnit("loadMass") || parseFloat(document.getElementById("loadMass").value)) : parseFloat(document.getElementById("loadMass").value);
  const frictionCoefficient = parseFloat(document.getElementById("frictionCoefficient").value);
  const conveyorInclineAngle = getValueWithUnit ? (getValueWithUnit("conveyorInclineAngle") || parseFloat(document.getElementById("conveyorInclineAngle").value)) : parseFloat(document.getElementById("conveyorInclineAngle").value);
  const beltSpeed = getValueWithUnit ? (getValueWithUnit("beltSpeed") || parseFloat(document.getElementById("beltSpeed").value)) : parseFloat(document.getElementById("beltSpeed").value);
  const rollerDiameter = getValueWithUnit ? (getValueWithUnit("rollerDiameter") || parseFloat(document.getElementById("rollerDiameter").value)) : parseFloat(document.getElementById("rollerDiameter").value);
  
  console.log("Conveyor inputs (converted):", { loadMass, frictionCoefficient, conveyorInclineAngle, beltSpeed, rollerDiameter });
  
  const frictionalForce = conveyorformulas.frictionalForce(loadMass, frictionCoefficient);
  const inclineForce = conveyorformulas.inclineForce(loadMass, conveyorInclineAngle);
  const totalForce = conveyorformulas.totalForce(frictionalForce, inclineForce);
  const rotationalSpeed = conveyorformulas.linearToRotationalSpeed(beltSpeed, rollerDiameter);

  const requiredMotorPowerKw = conveyorformulas.requiredMotorPowerKw(totalForce, beltSpeed);
  const requiredMotorPowerHp = conveyorformulas.requiredMotorPowerHp(totalForce, beltSpeed);
  const requiredTorque = conveyorformulas.requiredTorque(totalForce, rollerDiameter); 

  if ((isNaN(requiredMotorPowerKw)) || isNaN(requiredTorque)) {
    resultsDiv.innerHTML = "<p>Please enter valid input numbers.</p>";
    return;
  }

  // Get selected result units from stored preferences (with fallbacks)
  const powerUnit = window.selectedResultUnits?.power || "kW";
  const torqueUnit = window.selectedResultUnits?.torque || "Nm";

  // Convert power results to selected units
  const motorPowerKwDisplay = convertResultValue(requiredMotorPowerKw, 'power', powerUnit);
  const torqueDisplay = convertResultValue(requiredTorque, 'torque', torqueUnit);

  // Use standardized results display with converted values and units
  const outputs = {
    [`Required Motor Power kW (${powerUnit})`]: parseFloat(motorPowerKwDisplay.toFixed(3)),
    "Required Motor Power HP": `${requiredMotorPowerHp.toFixed(2)} HP`,
    "Operating Speed": `${rotationalSpeed.toFixed(2)} RPM`,
    [`Required Torque (${torqueUnit})`]: parseFloat(torqueDisplay.toFixed(3)),
    "Total Force": `${totalForce.toFixed(2)} N`,
    "Frictional Force": `${frictionalForce.toFixed(2)} N`,
    "Incline Force": `${inclineForce.toFixed(2)} N`
  };
  displayStandardResults(outputs);
}