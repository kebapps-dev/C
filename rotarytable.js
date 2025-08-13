function findClosestRotaryTableMotor() {
  const resultsDiv = document.getElementById("results");
  
  // Get values with proper unit conversion where applicable
  const rotationalMoveDistance = parseFloat(document.getElementById("rotationalMoveDistance").value);
  const totalMoveTime = parseFloat(document.getElementById("totalMoveTime").value);
  const accelTime = parseFloat(document.getElementById("accelTime").value);
  const decelTime = parseFloat(document.getElementById("decelTime").value);
  const gearboxRatioRotary = parseFloat(document.getElementById("gearboxRatioRotary").value);
  const massIndexTable = getValueWithUnit ? (getValueWithUnit("massIndexTable") || parseFloat(document.getElementById("massIndexTable").value)) : parseFloat(document.getElementById("massIndexTable").value);
  const radiusIndexTable = getValueWithUnit ? (getValueWithUnit("radiusIndexTable") || parseFloat(document.getElementById("radiusIndexTable").value)) : parseFloat(document.getElementById("radiusIndexTable").value);
  const loadInertia = getValueWithUnit ? (getValueWithUnit("loadInertia") || parseFloat(document.getElementById("loadInertia").value)) : parseFloat(document.getElementById("loadInertia").value);
  const frictionTorque = getValueWithUnit ? (getValueWithUnit("frictionTorque") || parseFloat(document.getElementById("frictionTorque").value)) : parseFloat(document.getElementById("frictionTorque").value);
  const dwellTime = parseFloat(document.getElementById("dwellTime").value);
  const motorInertia = getValueWithUnit ? (getValueWithUnit("motorInertia") || parseFloat(document.getElementById("motorInertia").value)) : parseFloat(document.getElementById("motorInertia").value);
  const gearboxInertia = getValueWithUnit ? (getValueWithUnit("gearboxInertia") || parseFloat(document.getElementById("gearboxInertia").value)) : parseFloat(document.getElementById("gearboxInertia").value);
  const brakeInertia = getValueWithUnit ? (getValueWithUnit("brakeInertia") || parseFloat(document.getElementById("brakeInertia").value)) : parseFloat(document.getElementById("brakeInertia").value);
  console.log("Rotary Table inputs (converted):", { 
    rotationalMoveDistance, totalMoveTime, accelTime, decelTime, gearboxRatioRotary,
    massIndexTable, radiusIndexTable, loadInertia, frictionTorque, dwellTime,
    motorInertia, gearboxInertia, brakeInertia
  });
  
  const maxAngularSpeed = rotarytableformulas.maxangularspeed(
    rotationalMoveDistance, totalMoveTime, accelTime, decelTime, gearboxRatioRotary);
  const maxRotationalSpeed = rotarytableformulas.maxrotationalspeed(
    maxAngularSpeed, gearboxRatioRotary);
  const motorAcceleration = rotarytableformulas.motoracceleration(
    maxAngularSpeed, accelTime, gearboxRatioRotary);
  const motorDeceleration = rotarytableformulas.motordeceleration(
    maxAngularSpeed, decelTime, gearboxRatioRotary);

  const rotaryTableInertia = rotarytableformulas.rotaryTableInertia(
    massIndexTable, radiusIndexTable);
  const totalSystemInertia = rotarytableformulas.totalSystemInertia(
    rotaryTableInertia, loadInertia, gearboxRatioRotary, motorInertia, gearboxInertia, brakeInertia);

  const torqueConstantFriction = rotarytableformulas.torqueConstantFriction(
    frictionTorque, gearboxRatioRotary);
  const torqueRequiredAcceleration = rotarytableformulas.torqueRequiredAcceleration(
    totalSystemInertia, motorAcceleration, torqueConstantFriction);
  const torqueRequiredDeceleration = rotarytableformulas.torqueRequiredDeceleration(
    totalSystemInertia, motorDeceleration, torqueConstantFriction);
  const torqueRequiredConstantSpeed = rotarytableformulas.torqueRequiredConstantSpeed(
    torqueConstantFriction);
  const constantRunTime = rotarytableformulas.constantRunTime(
    totalMoveTime, accelTime, decelTime);
  const torqueRmsMotor = rotarytableformulas.torqueRmsMotor(
    torqueRequiredAcceleration, torqueRequiredDeceleration, torqueRequiredConstantSpeed,
    accelTime, decelTime, constantRunTime, totalMoveTime, dwellTime);

  // Use standardized results display
  const outputs = {
    "Maximum Angular Speed": `${maxAngularSpeed.toFixed(2)} rad/s`,
    "Maximum Motor Rotational Speed": `${maxRotationalSpeed.toFixed(2)} RPM`,
    "Total System Inertia": `${totalSystemInertia.toFixed(2)} kg·m²`,
    "Calculated RMS Torque": `${torqueRmsMotor.toFixed(2)} Nm`,
    "Acceleration Torque": `${torqueRequiredAcceleration.toFixed(2)} Nm`,
    "Deceleration Torque": `${torqueRequiredDeceleration.toFixed(2)} Nm`,
    "Constant Speed Torque": `${torqueRequiredConstantSpeed.toFixed(2)} Nm`,
    "Rotary Table Inertia": `${rotaryTableInertia.toFixed(4)} kg·m²`,
    "Constant Run Time": `${constantRunTime.toFixed(2)} s`
  };
  displayStandardResults(outputs);
}