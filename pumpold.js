// Pump calculation engine - follows Generic Rotary standard pattern
// No CSV loading, pure calculations using formulas.js

function findClosestPumpMotor() {
  const resultsDiv = document.getElementById("results");
  
  console.log("findClosestPumpMotor called");
  
  // Check if all required input elements exist
  const requiredInputs = ["boreDiameter", "rodDiameter", "strokeLength", "clampPressure", "timeOfStroke", "rpm", "safetyFactor"];
  for (const inputId of requiredInputs) {
    const element = document.getElementById(inputId);
    if (!element) {
      console.error(`Missing input element: ${inputId}`);
      resultsDiv.innerHTML = `<p>Error: Missing input field ${inputId}. Please check the application setup.</p>`;
      return;
    }
  }
  
  // Get values with unit conversion where applicable
  const boreDiameter = getValueWithUnit ? (getValueWithUnit("boreDiameter") || parseFloat(document.getElementById("boreDiameter").value)) : parseFloat(document.getElementById("boreDiameter").value);
  const rodDiameter = getValueWithUnit ? (getValueWithUnit("rodDiameter") || parseFloat(document.getElementById("rodDiameter").value)) : parseFloat(document.getElementById("rodDiameter").value);
  const strokeLength = getValueWithUnit ? (getValueWithUnit("strokeLength") || parseFloat(document.getElementById("strokeLength").value)) : parseFloat(document.getElementById("strokeLength").value);
  const clampPressure = getValueWithUnit ? (getValueWithUnit("clampPressure") || parseFloat(document.getElementById("clampPressure").value)) : parseFloat(document.getElementById("clampPressure").value);
  const rpm = getValueWithUnit ? (getValueWithUnit("rpm") || parseFloat(document.getElementById("rpm").value)) : parseFloat(document.getElementById("rpm").value);
  const timeOfStroke = parseFloat(document.getElementById("timeOfStroke").value);
  const safetyFactor = parseFloat(document.getElementById("safetyFactor").value);
  
  console.log("Input values:", { boreDiameter, rodDiameter, strokeLength, clampPressure, rpm, timeOfStroke, safetyFactor });
  
  // Check if formulas object exists
  if (typeof formulas === 'undefined') {
    console.error("Formulas object not found");
    resultsDiv.innerHTML = "<p>Error: Formulas not loaded. Please check if formulas.js is loaded.</p>";
    return;
  }
  
  const pumpResults = sizePumpMotor({
    boreDiameter,
    rodDiameter,
    strokeLength,
    clampPressure,
    timeOfStroke,
    rpm,
    safetyFactor
  });

  // Validate results
  if (isNaN(parseFloat(pumpResults.pumpDisplacement))) {
    resultsDiv.innerHTML = "<p>Please enter valid numbers for all pump inputs.</p>";
    return;
  }

  // Display results like Generic Rotary
  resultsDiv.innerHTML = `
    <p><strong>Pump System Calculations:</strong></p>
    <ul>
      <li><strong>Clamp Area:</strong> ${pumpResults.clampArea}</li>
      <li><strong>Clamp Volume:</strong> ${pumpResults.clampVolume}</li>
      <li><strong>Flow Rate Required:</strong> ${pumpResults.flowRate}</li>
      <li><strong>Pump Displacement Required:</strong> ${pumpResults.pumpDisplacement}</li>
      <li><strong>Clamping Force:</strong> ${pumpResults.clampingForce}</li>
      <li><strong>Motor Torque Required:</strong> ${pumpResults.motorTorque}</li>
      <li><strong>Motor Speed Required:</strong> ${pumpResults.motorSpeed}</li>
    </ul>
  `;

  // Display motor sizing in results2 div  
  const results2Div = document.getElementById("results2");
  if (results2Div) {
    results2Div.innerHTML = `
      <p><strong>Motor Requirements (with ${(safetyFactor * 100 - 100).toFixed(0)}% safety factor):</strong></p>
      <ul>
        <li><strong>Required Torque:</strong> ${pumpResults.motorTorqueWithSafety}</li>
        <li><strong>Required Speed:</strong> ${pumpResults.motorSpeedWithSafety}</li>
        <li><strong>Required Power:</strong> ${pumpResults.motorPower}</li>
      </ul>
    `;
  }
}

function sizePumpMotor(params) {
  const {
    boreDiameter,        // converted to base units
    rodDiameter,         // converted to base units  
    strokeLength,        // converted to base units
    clampPressure,       // converted to base units
    timeOfStroke,        // seconds
    rpm,                 // RPM
    safetyFactor         // multiplier (e.g., 1.5 for 50% margin)
  } = params;

  // Calculate using formulas from formulas.js
  const clampArea = formulas.clamparea(boreDiameter, rodDiameter);
  const clampVolume = formulas.clampvolume(strokeLength, clampArea);
  const flowRate = formulas.pumpflowrate(timeOfStroke, clampVolume);
  const pumpDisplacement = formulas.pumpdisplacement(flowRate, rpm);
  const clampingForce = formulas.pumpclampingforce(clampPressure, clampArea);
  
  // Motor calculations - using standard efficiency of 0.85 for calculations
  const pumpEfficiency = 0.85;
  const motorTorque = formulas.motortorque(pumpDisplacement, clampPressure, pumpEfficiency);
  const motorSpeed = formulas.motorspeed(flowRate, pumpDisplacement, pumpEfficiency);
  
  // Apply safety factor
  const motorTorqueWithSafety = motorTorque * safetyFactor;
  const motorSpeedWithSafety = motorSpeed * safetyFactor;
  
  // Calculate motor power
  const motorPowerWatts = motorTorqueWithSafety * (motorSpeedWithSafety * 2 * Math.PI / 60); // Convert RPM to rad/s
  const motorPowerKW = motorPowerWatts / 1000;
  const motorPowerHP = motorPowerWatts / 745.7;

  return {
    clampArea: clampArea.toFixed(2) + ' in²',
    clampVolume: clampVolume.toFixed(2) + ' in³', 
    flowRate: flowRate.toFixed(2) + ' L/min',
    pumpDisplacement: pumpDisplacement.toFixed(2) + ' cc/rev',
    clampingForce: clampingForce.toFixed(0) + ' N',
    motorTorque: motorTorque.toFixed(2) + ' Nm',
    motorSpeed: motorSpeed.toFixed(0) + ' RPM',
    motorTorqueWithSafety: motorTorqueWithSafety.toFixed(2) + ' Nm',
    motorSpeedWithSafety: motorSpeedWithSafety.toFixed(0) + ' RPM',
    motorPower: `${motorPowerKW.toFixed(2)} kW (${motorPowerHP.toFixed(2)} HP)`
  };
}
