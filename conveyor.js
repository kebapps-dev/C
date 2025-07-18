function findClosestConveyorMotor() {
  const resultsDiv = document.getElementById("results");
  const frictionalForce = conveyorformulas.frictionalForce(
    parseFloat(document.getElementById("loadMass").value),
    parseFloat(document.getElementById("frictionCoefficient").value));
  const inclineForce = conveyorformulas.inclineForce(
    parseFloat(document.getElementById("loadMass").value),
    parseFloat(document.getElementById("conveyorInclineAngle").value));
  const totalForce = conveyorformulas.totalForce(frictionalForce, inclineForce);
const rotationalSpeed = conveyorformulas.linearToRotationalSpeed(
    parseFloat(document.getElementById("beltSpeed").value),
    parseFloat(document.getElementById("rollerDiameter").value));

  const requiredMotorPowerKw = conveyorformulas.requiredMotorPowerKw(
    totalForce,
    parseFloat(document.getElementById("beltSpeed").value));
  const requiredMotorPowerHp = conveyorformulas.requiredMotorPowerHp(
    totalForce,
    parseFloat(document.getElementById("beltSpeed").value));
  const requiredTorque = conveyorformulas.requiredTorque(
    totalForce,
    parseFloat(document.getElementById("rollerDiameter").value)); 

  if ((isNaN(requiredMotorPowerKw)) || isNaN(requiredTorque)) {
    resultsDiv.innerHTML = "<p>Please enter valid input numbers.</p>";
    return;
  }
    resultsDiv.innerHTML = `
      <p><strong>
        Required Motor Power: ${requiredMotorPowerKw.toFixed(2)} kW (${requiredMotorPowerHp.toFixed(2)} HP) <br>
        Operating Speed: ${rotationalSpeed.toFixed(2)} RPM <br>
        Required Torque: ${requiredTorque.toFixed(2)} Nm <br>
      </strong></p>`;
}