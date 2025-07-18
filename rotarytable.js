function findClosestRotaryTableMotor() {
  const resultsDiv = document.getElementById("results");
  const maxAngularSpeed = rotarytableformulas.maxangularspeed(
    parseFloat(document.getElementById("rotationalMoveDistance").value),
    parseFloat(document.getElementById("totalMoveTime").value),
    parseFloat(document.getElementById("accelTime").value),
    parseFloat(document.getElementById("decelTime").value),
    parseFloat(document.getElementById("gearboxRatioRotary").value));
  const maxRotationalSpeed = rotarytableformulas.maxrotationalspeed(
    maxAngularSpeed,
    parseFloat(document.getElementById("gearboxRatioRotary").value));
  const motorAcceleration = rotarytableformulas.motoracceleration(
    maxAngularSpeed,
    parseFloat(document.getElementById("accelTime").value));
  const motorDeceleration = rotarytableformulas.motordeceleration(
    maxAngularSpeed,
    parseFloat(document.getElementById("decelTime").value));

  const rotaryTableInertia = rotarytableformulas.rotaryTableInertia(
    parseFloat(document.getElementById("massIndexTable").value),
    parseFloat(document.getElementById("radiusIndexTable").value));
  const totalSystemInertia = rotarytableformulas.totalSystemInertia(
    rotaryTableInertia,
    parseFloat(document.getElementById("loadInertia").value),
    parseFloat(document.getElementById("gearboxRatioRotary").value));

  const torqueConstantFriction = rotarytableformulas.torqueConstantFriction(
    parseFloat(document.getElementById("frictionTorque").value),
    parseFloat(document.getElementById("gearboxRatioRotary").value));
  const torqueRequiredAcceleration = rotarytableformulas.torqueRequiredAcceleration(
    totalSystemInertia,
    motorAcceleration,
    torqueConstantFriction);
  const torqueRequiredDeceleration = rotarytableformulas.torqueRequiredDeceleration(
    totalSystemInertia,
    motorDeceleration, 
    torqueConstantFriction);
  const torqueRequiredConstantSpeed = rotarytableformulas.torqueRequiredConstantSpeed(
    torqueConstantFriction);
  const constantRunTime = rotarytableformulas.constantRunTime(
    parseFloat(document.getElementById("totalMoveTime").value),
    parseFloat(document.getElementById("accelTime").value),
    parseFloat(document.getElementById("decelTime").value));
  const torqueRmsMotor = rotarytableformulas.torqueRmsMotor(
    torqueRequiredAcceleration,
    torqueRequiredDeceleration,
    torqueRequiredConstantSpeed,
    parseFloat(document.getElementById("accelTime").value),
    parseFloat(document.getElementById("decelTime").value),
    constantRunTime,
    parseFloat(document.getElementById("totalMoveTime").value),
    parseFloat(document.getElementById("dwellTime").value));

  if ((isNaN(torqueRmsMotor)) || isNaN(constantRunTime)) {
    resultsDiv.innerHTML = "<p>Please enter valid input numbers.</p>";
    return;
  }

    resultsDiv.innerHTML = `
      <p><strong>
        Calculated Maximum Angular Speed: ${maxAngularSpeed.toFixed(2)} Rad/Sec <br>
        Maximum Motor Rotational Speed: ${maxRotationalSpeed.toFixed(2)} RPM <br>
        Total System Inertia: ${totalSystemInertia.toFixed(2)} kg*m² <br><br>

        Calculated RMS Torque: ${torqueRmsMotor.toFixed(2)} Nm <br>
        Acceleration Torque: ${torqueRequiredAcceleration.toFixed(2)} Nm <br>
        Deceleration Torque: ${torqueRequiredDeceleration.toFixed(2)} Nm <br>
        Constant Speed Torque: ${torqueRequiredConstantSpeed.toFixed(2)} Nm <br><br>

        Verify motor rated torque is above the calculated RMS torque and rated peak torque is above the calculated acceleration and deceleration torques.
      </strong></p>`;
}