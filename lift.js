function findClosestLiftMotor() {
  const resultsDiv = document.getElementById("results");
  const forceGravity = formulas.forcegravity(
    parseFloat(document.getElementById("loadWeight").value));
  const gearboxOutputSpeed = formulas.angularspeed(
    parseFloat(document.getElementById("maxSpeed").value),
    parseFloat(document.getElementById("drumDiameter").value));
  const motorSpeed = gearboxOutputSpeed * parseFloat(document.getElementById("gearboxRatioLift").value);
  const loadRequiredTorque = formulas.drumtorque(forceGravity,
    parseFloat(document.getElementById("drumDiameter").value)) // Convert diameter to radius
  const loadRequiredPeakTorque = formulas.peakdrumtorque(
    forceGravity,
    parseFloat(document.getElementById("drumDiameter").value),
    parseFloat(document.getElementById("loadWeight").value),
    formulas.peakacceleration(
      parseFloat(document.getElementById("maxSpeed").value),
      parseFloat(document.getElementById("accelDecelTime").value)
    )
  );
  const motorRequiredTorque = loadRequiredTorque / parseFloat(document.getElementById("gearboxRatioLift").value);
  const motorRequiredPeakTorque = loadRequiredPeakTorque / parseFloat(document.getElementById("gearboxRatioLift").value);
  const requiredMotorPowerKw = formulas.motorpowerkw(loadRequiredTorque,gearboxOutputSpeed)
  const requiredMotorPowerHp = formulas.motorpowerhp(loadRequiredTorque,gearboxOutputSpeed)

  if ((isNaN(loadRequiredTorque)) || isNaN(gearboxOutputSpeed)) {
    resultsDiv.innerHTML = "<p>Please enter valid input numbers.</p>";
    return;
  }
  resultsDiv.innerHTML = `
    <p><strong>
      Motor Speed: ${motorSpeed.toFixed(2)} RPM <br>
      Motor Required Torque: ${motorRequiredTorque.toFixed(2)} Nm <br>
      Motor Required Peak Torque: ${motorRequiredPeakTorque.toFixed(2)} Nm
        ${addMathTooltip("T_{motor} = \\frac{T_{load}}{i_{gearbox}}")}
      <br><br>
      Gearbox Output Speed: ${gearboxOutputSpeed.toFixed(2)} RPM <br>
      Gearbox Required Torque: ${loadRequiredTorque.toFixed(2)} Nm <br>
      Gearbox Peak Torque: ${loadRequiredPeakTorque.toFixed(2)} Nm <br><br>

      Required Motor Power: ${requiredMotorPowerKw.toFixed(2)} kW (${requiredMotorPowerHp.toFixed(2)} HP) <br>
    </strong></p>`;
  if (window.MathJax) MathJax.typeset();
}