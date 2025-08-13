const formulas = {
  areaOfCircle: radius => Math.PI * radius * radius, // radius: m

  flowRate: (volume, time) => volume / time, // volume: m³, time: s

  //pump calculations (updated to work with metric base units)
  clamparea: (boreDiameter, rodDiameter) => 
    (Math.PI*(boreDiameter/2)**2)-(Math.PI*(rodDiameter/2)**2), // boreDiameter: m, rodDiameter: m → m²
  clampvolume: (clamparea, strokeLength) => 
    clamparea * strokeLength, // clamparea: m², strokeLength: m → m³
  pumpflowrate: (timeOfStroke, clampvolume) => 
    timeOfStroke > 0 ? (clampvolume / timeOfStroke) * 60000 : 0, // timeOfStroke: s, clampvolume: m³ → L/min
  pumpdisplacement: (pumpflowrate, angularVelocity) => 
    angularVelocity > 0 ? (pumpflowrate * 1000) / ((angularVelocity * 60) / (2 * Math.PI)) : 0, // pumpflowrate: L/min, angularVelocity: rad/s → cc/rev
  pumpclampingforce: (clampPressure, clamparea) => 
    clampPressure * clamparea, // clampPressure: Pa, clamparea: m² → N
  motortorque: (selectedPumpDisplacement, clampPressure, volefficiency) => 
    (selectedPumpDisplacement * (clampPressure/100000) / (20 * Math.PI * volefficiency)), // selectedPumpDisplacement: cc/rev, clampPressure: Pa, volefficiency: decimal → Nm
  motorspeed: (clampingFlowRate, selectedPumpDisplacement, volefficiency) => 
    (clampingFlowRate * 1000 * volefficiency) / selectedPumpDisplacement, // clampingFlowRate: L/min, selectedPumpDisplacement: cc/rev, volefficiency: decimal → rpm

  //lift calculations
  angularspeed: (maxSpeed, drumDiameter) => 
    (maxSpeed * 60) / (Math.PI * (drumDiameter)), // maxSpeed: m/s, drumDiameter: m → rpm
  forcegravity: (mass, gravity = 9.81) => mass * gravity, // mass: kg, gravity: m/s² → N
  drumtorque: (forcegravity, drumDiameter) => 
    forcegravity * (drumDiameter/2), // forcegravity: N, drumDiameter: m → Nm
  peakacceleration: (maxSpeed, accelDecelTime) => 
    maxSpeed / accelDecelTime, // maxSpeed: m/s, accelDecelTime: s → m/s²
  peakdrumtorque: (forcegravity, drumDiameter, mass, peakacceleration) => 
    (drumDiameter/2)*(forcegravity + (mass*(peakacceleration))), // forcegravity: N, drumDiameter: m, mass: kg, peakacceleration: m/s² → Nm
  motorpowerkw: (torque, angularspeed) => 
    (torque * angularspeed) / 1000, // torque: Nm, angularspeed: rad/s → kW
  motorpowerhp: (torque, angularspeed) => 
    (torque * angularspeed) / 745.7, // torque: Nm, angularspeed: rad/s → hp
};

const rotarytableformulas = {
  //https://www.kebamerica.com/blog/how-do-i-size-a-motor-for-my-application-rotary-index-table/
  maxangularspeed: (rotationalMoveDistance, totalMoveTime, accelTime, decelTime, gearboxRatio) => 
    gearboxRatio * (rotationalMoveDistance / (totalMoveTime - 0.5*accelTime - 0.5*decelTime)), // rotationalMoveDistance: rad, totalMoveTime: s, accelTime: s, decelTime: s, gearboxRatio: dimensionless → rad/s
  maxrotationalspeed: (maxAngularSpeed, gearboxRatio) =>
    maxAngularSpeed * 60 * gearboxRatio / (2 * Math.PI), // maxAngularSpeed: rad/s, gearboxRatio: dimensionless → RPM
  
  motoracceleration: (maxAngularSpeed, accelTime, gearboxRatio) => 
    gearboxRatio * maxAngularSpeed / accelTime, // maxAngularSpeed: rad/s, accelTime: s, gearboxRatio: dimensionless → rad/s²

  motordeceleration: (maxAngularSpeed, decelTime, gearboxRatio) => 
    gearboxRatio * maxAngularSpeed / decelTime, // maxAngularSpeed: rad/s, decelTime: s, gearboxRatio: dimensionless → rad/s²

  rotaryTableInertia: (massIndexTable, radiusIndexTable) => 
    0.5 * massIndexTable * (radiusIndexTable ** 2), // massIndexTable: kg, radiusIndexTable: m → kg·m²
  totalSystemInertia: (rotaryTableInertia, loadInertia, gearboxRatio, motorInertia, gearboxInertia, brakeInertia) =>
    ((rotaryTableInertia + loadInertia) / (gearboxRatio ** 2)) + motorInertia + gearboxInertia + brakeInertia, // rotaryTableInertia: kg·m², loadInertia: kg·m², gearboxRatio: dimensionless → kg·m²

  torqueConstantFriction: (frictionTorque, gearboxRatio) => frictionTorque / gearboxRatio, // frictionTorque: Nm, gearboxRatio: dimensionless → Nm
  torqueRequiredAcceleration: (totalSystemInertia, motorAcceleration, torqueConstantFriction) =>
    (totalSystemInertia * motorAcceleration) + torqueConstantFriction, // totalSystemInertia: kg·m², motorAcceleration: rad/s², torqueConstantFriction: Nm → Nm
  torqueRequiredDeceleration: (totalSystemInertia, motorDeceleration, torqueConstantFriction) =>
    (totalSystemInertia * motorDeceleration) + torqueConstantFriction, // totalSystemInertia: kg·m², motorDeceleration: rad/s², torqueConstantFriction: Nm → Nm
  torqueRequiredConstantSpeed: (torqueConstantFriction) => 
    torqueConstantFriction, // torqueConstantFriction: Nm → Nm
  
  constantRunTime: (moveTime, accelTime, decelTime) =>
    moveTime - accelTime - decelTime, // moveTime: s, accelTime: s, decelTime: s → s
  torqueRmsMotor: (torqueRequiredAcceleration, torqueRequiredDeceleration, torqueRequiredConstantSpeed, accelTime, decelTime, constantRunTime, moveTime, dwellTime) =>
    Math.sqrt((((torqueRequiredAcceleration ** 2) * accelTime) + ((torqueRequiredDeceleration ** 2) * decelTime) + ((torqueRequiredConstantSpeed ** 2) * constantRunTime)) / (dwellTime + moveTime)), // all torques: Nm, all times: s → Nm
  };


  const conveyorformulas = {
    frictionalForce: (loadMass, frictionCoefficient) => loadMass * frictionCoefficient * 9.81, // loadMass: kg, frictionCoefficient: dimensionless → N
    inclineForce: (loadMass, inclineAngle) => loadMass * 9.81 * Math.abs(Math.sin(inclineAngle)), // loadMass: kg, inclineAngle: rad → N
    totalForce: (frictionalForce, inclineForce) => frictionalForce + inclineForce, // frictionalForce: N, inclineForce: N → N
    linearToRotationalSpeed: (beltSpeed, rollerDiameter) => (beltSpeed * 60) / (Math.PI * rollerDiameter), // beltSpeed: m/s, rollerDiameter: m → RPM
  
    requiredMotorPowerKw: (totalForce, beltSpeed) => (totalForce * beltSpeed) / 1000, // totalForce: N, beltSpeed: m/s → kW
    requiredMotorPowerHp: (totalForce, beltSpeed) => (totalForce * beltSpeed) / 745.7, // totalForce: N, beltSpeed: m/s → hp
    requiredTorque: (totalForce, rollerDiameter) => (totalForce * rollerDiameter) / 2, // totalForce: N, rollerDiameter: m → Nm
  };

  const genericrotaryformulas = {
    torqueRequiredAcceleration: (momentOfInertia, angularSpeed, accelTime) => 
      angularSpeed * momentOfInertia / accelTime, // momentOfInertia: kg·m², angularSpeed: rad/s, accelTime: s → Nm
    torqueRequiredDeceleration: (momentOfInertia, angularSpeed, decelTime) => 
      angularSpeed * momentOfInertia / decelTime, // momentOfInertia: kg·m², angularSpeed: rad/s, decelTime: s → Nm
    requiredMotorPowerKw : (torque, angularSpeed) => 
      (torque * angularSpeed) / 1000, // torque: Nm, angularSpeed: rad/s → kW
    requiredMotorPowerHp : (torque, angularSpeed) => 
      (torque * angularSpeed) / 745.7, // torque: Nm, angularSpeed: rad/s → hp
  };

  const blowerformulas = {
    // Calculate fan power
    fanPower: (airflow, pressure, fanEfficiency) => (airflow * pressure) / (fanEfficiency / 100), // airflow: m³/s, pressure: Pa, fanEfficiency: % → W
    // Calculate motor power
    motorPower: (fanPower, motorEfficiency) => fanPower / (motorEfficiency / 100), // fanPower: W, motorEfficiency: % → W
    // Convert motor power to HP
    motorPowerHP: (motorPowerWatts) => motorPowerWatts / 745.7, // motorPowerWatts: W → HP
    // Calculate torque from motor power and speed
    blowerTorque: (motorPowerWatts, rpmRads) => { // motorPowerWatts: W, rpmRads: rad/s → Nm
      if (rpmRads && rpmRads > 0) {
        return motorPowerWatts / rpmRads; // Nm
      }
      return 0;
    }
  };

  


