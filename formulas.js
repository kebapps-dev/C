const formulas = {
  areaOfCircle: radius => Math.PI * radius * radius,
  flowRate: (volume, time) => volume / time,

  //pump calculations
  clamparea: (boreDiameter,rodDiameter) => (Math.PI*(boreDiameter/2)**2)-(Math.PI*(rodDiameter/2)**2), //in2
  clampvolume: (clamparea, strokeLength) => clamparea * strokeLength, //in3
  pumpflowrate: (timeOfStroke, clampvolume) => timeOfStroke > 0 ? (clampvolume / timeOfStroke)*0.9832 : 0, //convert in3/s to l/min
  pumpdisplacement: (pumpflowrate, rpm) => rpm > 0 ? (pumpflowrate * 1000) / rpm : 0, //cc/rev
  pumpclampingforce: (clampPressure, clamparea) => clampPressure * clamparea,
  motortorque: (selectedPumpDisplacement,clampPressure, volefficiency) => (selectedPumpDisplacement * clampPressure ) / (20 * Math.PI * volefficiency), //Nm
  motorspeed: (clampingFlowRate, selectedPumpDisplacement,volefficiency) => (clampingFlowRate * 1000 * volefficiency) / selectedPumpDisplacement, //rpm

  //lift calculations
  angularspeed: (maxSpeed, drumDiameter) => (maxSpeed * 60) / (Math.PI * (drumDiameter/1000)), // rp
  forcegravity: (mass, gravity = 9.81) => mass * gravity, // N
  drumtorque: (forcegravity, drumDiameter) => forcegravity * (drumDiameter/2000), // Nm

  peakacceleration: (maxSpeed, accelDecelTime) => maxSpeed / accelDecelTime, // m/s^2
  peakdrumtorque: (forcegravity, drumDiameter, mass, peakacceleration) => (drumDiameter/2000)*(forcegravity + (mass*(peakacceleration))), // Nm

  motorpowerkw: (torque, angularspeed) => (torque * angularspeed) /1000, // kW
  motorpowerhp: (torque, angularspeed) => (torque * angularspeed) / 745.7, // hp
};

const rotarytableformulas = {
  //https://www.kebamerica.com/blog/how-do-i-size-a-motor-for-my-application-rotary-index-table/
  maxangularspeed: (rotationalMoveDistance, totalMoveTime, accelTime, decelTime, gearboxRatio) => 
    gearboxRatio * (rotationalMoveDistance / (totalMoveTime - 0.5*accelTime - 0.5*decelTime)), // RPM
  maxrotationalspeed: (maxAngularSpeed, gearboxRatio) =>
    maxAngularSpeed * 60 * gearboxRatio / (2 * Math.PI), // RPM
  
  motoracceleration: (maxRotationalspeed, accelTime, gearboxRatio) => 
    maxRotationalspeed / accelTime, // RPM/s
  
  motordeceleration: (maxRotationalspeed, decelTime) => 
    maxRotationalspeed / decelTime, // RPM/s
  
  rotaryTableInertia: (massIndexTable, radiusIndexTable) => 
    0.5 * massIndexTable * (radiusIndexTable ** 2), 
  totalSystemInertia: (rotaryTableInertia, loadInertia, gearboxRatio) =>
    (rotaryTableInertia + loadInertia) / (gearboxRatio ** 2), 

  torqueConstantFriction: (frictionTorque, gearboxRatio) => frictionTorque / gearboxRatio, // Nm
  torqueRequiredAcceleration: (totalSystemInertia, motorAcceleration, torqueConstantFriction) =>
    (totalSystemInertia * motorAcceleration) + torqueConstantFriction, // Nm
  torqueRequiredDeceleration: (totalSystemInertia, motorDeceleration, torqueConstantFriction) =>
    (totalSystemInertia * motorDeceleration) + torqueConstantFriction, // Nm
  torqueRequiredConstantSpeed: (torqueConstantFriction) => 
    torqueConstantFriction, // Nm
  
  constantRunTime: (moveTime, accelTime, decelTime) =>
    moveTime - accelTime - decelTime, // s
  torqueRmsMotor: (torqueRequiredAcceleration, torqueRequiredDeceleration, torqueRequiredConstantSpeed, accelTime, decelTime, constantRunTime, moveTime, dwellTime) =>
    Math.sqrt((((torqueRequiredAcceleration ** 2) * accelTime) + ((torqueRequiredDeceleration ** 2) * decelTime) + ((torqueRequiredConstantSpeed ** 2) * constantRunTime)) / (dwellTime + moveTime)), // Nm^2
  };


  const conveyorformulas = {
    frictionalForce: (loadMass, frictionCoefficient) => loadMass * frictionCoefficient * 9.81, // N
    inclineForce: (loadMass, inclineAngle) => loadMass * 9.81 * Math.abs(Math.sin(inclineAngle)), // N
    totalForce: (frictionalForce, inclineForce) => frictionalForce + inclineForce, // N
    linearToRotationalSpeed: (beltSpeed, rollerDiameter) => (beltSpeed * 1000) / (Math.PI * rollerDiameter), // RPM
  
    requiredMotorPowerKw: (totalForce, beltSpeed) => (totalForce * beltSpeed) / 1000, // kW
    requiredMotorPowerHp: (totalForce, beltSpeed) => (totalForce * beltSpeed) / 745.7, // hp
    requiredTorque: (totalForce, rollerDiameter) => (totalForce * rollerDiameter) / 2, // Nm
  };

  const genericrotaryformulas = {
    angularSpeed: (requiredSpeedRPM) => (2 * Math.PI * requiredSpeedRPM) / 60, // rad/s
    torqueRequiredAcceleration: (momentOfInertia, angularSpeed, accelTime) => angularSpeed * momentOfInertia / accelTime, // Nm
    torqueRequiredDeceleration: (momentOfInertia, angularSpeed, decelTime) => angularSpeed * momentOfInertia / decelTime, // Nm
    requiredMotorPowerKw : (torque, angularSpeed) => (torque * angularSpeed) / 1000, // kW
    requiredMotorPowerHp : (torque, angularSpeed) => (torque * angularSpeed) / 745.7, // hp
  };

  


