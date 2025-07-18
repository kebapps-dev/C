document.addEventListener("DOMContentLoaded", function() {
  document.getElementById("application").value = "Genericrotary";
    // FAST MODE
    handleAppChange(); 
    setTimeout(() => {document.getElementById('loadGenericData').click();}, 100);
    setTimeout(() => {document.getElementById('findClosestGenericRotaryMotor').click();}, 300);
    showSizingSuggestions(document.getElementById("application").value);
  document.getElementById("application").addEventListener("change", handleAppChange);

  const toggle = document.getElementById("toggleRight");
  const rightPanel = document.querySelector(".right");
  toggle.addEventListener("change", function() {
    rightPanel.style.display = toggle.checked ? "block" : "none";
  });
});

function handleAppChange() {
  console.log("Application changed, updating input groups...");
  const app = document.getElementById("application").value;
  const pumpDiv = document.getElementById("pumpInputs");
  const liftDiv = document.getElementById("liftInputs");
  const rotaryTableDiv = document.getElementById("rotaryTableInputs");
  const conveyorDiv = document.getElementById("conveyorInputs");
  const genericRotaryDiv = document.getElementById("genericRotaryInputs");
  const blowerDiv = document.getElementById("blowerInputs");
  const spindleDiv = document.getElementById("spindleInputs");
  const resultsDiv = document.getElementById("results");
  const resultsDiv2 = document.getElementById("results2");
  const savedConfigBtn = document.getElementById("saveConfigBtn");
  const clearSavedConfigsBtn = document.getElementById("clearSavedConfigsBtn");
  resultsDiv.innerHTML = ""; // clear previous results
  resultsDiv2.innerHTML = ""; // clear previous results

  if (app === "Pump") {
    pumpDiv.style.display = "block";
    liftDiv.style.display = "none";
    rotaryTableDiv.style.display = "none";
    conveyorDiv.style.display = "none";
    genericRotaryDiv.style.display = "none";
    blowerDiv.style.display = "none";
    spindleDiv.style.display = "none";
    clearSavedConfigsBtn.style.display = "inline-block";
    savedConfigBtn.style.display = "inline-block";
  } else if (app === "Lift") {
    pumpDiv.style.display = "none";
    liftDiv.style.display = "block";
    rotaryTableDiv.style.display = "none";
    conveyorDiv.style.display = "none";
    genericRotaryDiv.style.display = "none";
    blowerDiv.style.display = "none";
    spindleDiv.style.display = "none";
    clearSavedConfigsBtn.style.display = "inline-block";
    savedConfigBtn.style.display = "inline-block";
  } else if (app === "Rotarytable") {
    pumpDiv.style.display = "none";
    liftDiv.style.display = "none";
    rotaryTableDiv.style.display = "block";
    conveyorDiv.style.display = "none";
    genericRotaryDiv.style.display = "none";
    blowerDiv.style.display = "none";
    spindleDiv.style.display = "none";
    clearSavedConfigsBtn.style.display = "inline-block";
    savedConfigBtn.style.display = "inline-block";
  } else if (app === "Conveyor") {
    pumpDiv.style.display = "none";
    liftDiv.style.display = "none";
    rotaryTableDiv.style.display = "none";
    conveyorDiv.style.display = "block";
    genericRotaryDiv.style.display = "none";
    blowerDiv.style.display = "none";
    spindleDiv.style.display = "none";
    clearSavedConfigsBtn.style.display = "inline-block";
    savedConfigBtn.style.display = "inline-block";
  }  else if (app === "Genericrotary") {
    pumpDiv.style.display = "none";
    liftDiv.style.display = "none";
    rotaryTableDiv.style.display = "none";
    conveyorDiv.style.display = "none";
    genericRotaryDiv.style.display = "block";
    blowerDiv.style.display = "none";
    spindleDiv.style.display = "none";
    clearSavedConfigsBtn.style.display = "inline-block";
    savedConfigBtn.style.display = "inline-block";
  } else if (app === "Blower") {
    pumpDiv.style.display = "none";
    liftDiv.style.display = "none";
    rotaryTableDiv.style.display = "none";
    conveyorDiv.style.display = "none";
    genericRotaryDiv.style.display = "none";
    blowerDiv.style.display = "block";
    spindleDiv.style.display = "none";
    clearSavedConfigsBtn.style.display = "inline-block";
    savedConfigBtn.style.display = "inline-block";
  } else if (app === "Spindle") {
    pumpDiv.style.display = "none";
    liftDiv.style.display = "none";
    rotaryTableDiv.style.display = "none";
    conveyorDiv.style.display = "none";
    genericRotaryDiv.style.display = "none";
    blowerDiv.style.display = "none";
    spindleDiv.style.display = "block";
    clearSavedConfigsBtn.style.display = "inline-block";
    savedConfigBtn.style.display = "inline-block";
  }else{
    pumpDiv.style.display = "none";
    liftDiv.style.display = "none";
    rotaryTableDiv.style.display = "none";
    conveyorDiv.style.display = "none";
    genericRotaryDiv.style.display = "none";
    blowerDiv.style.display = "none";
    spindleDiv.style.display = "none";
    savedConfigBtn.style.display = "none";
    clearSavedConfigsBtn.style.display = "none";
    savedConfigBtn.style.display = "none";
  }
    loadSelectedScript();
    
    // Show or hide the Save Configuration button
    document.getElementById("saveConfigBtn").style.display = app ? "block" : "none";
}

function loadSelectedScript() {
      const select = document.getElementById("application");
      const selectedFile = select.value.toLowerCase() + ".js"; // Assuming the script files are named like "fan.js", "pump.js", etc.

      if (!selectedFile) return;

      const existingScript = document.querySelector(`script[src="${selectedFile}"]`);
      if (existingScript) {
        console.log("Script already loaded:", selectedFile);
        return;
      }

      const script = document.createElement("script");
      script.src = selectedFile;
      script.type = "text/javascript";
      script.onload = () => console.log(`Loaded: ${selectedFile}`);
      script.onerror = () => console.error(`Failed to load: ${selectedFile}`);

      document.body.appendChild(script);
    }

function loadGenericData(Application) {
    if (Application === "Pump") {
      document.getElementById("boreDiameter").value = "3.25";  
      document.getElementById("rodDiameter").value = "2";   
      document.getElementById("strokeLength").value = "8"; 
      document.getElementById("clampPressure").value = "181.1";  
      document.getElementById("timeOfStroke").value = "1.8";    
      document.getElementById("clampFlowRate").value = "25.7";           
      document.getElementById("rpm").value = "2300";  
      document.getElementById("motorEfficiency").value = "90";  
      document.getElementById("safetyFactor").value = "1.1";
    }
    if (Application === "Lift") {
      document.getElementById("loadWeight").value = "1000";  
      document.getElementById("liftHeight").value = "150";  
      document.getElementById("maxSpeed").value = "1";  
      document.getElementById("gearboxRatioLift").value = "50";
      document.getElementById("accelDecelTime").value = "2";  
      document.getElementById("drumDiameter").value = "110";  
    }
    if (Application === "Rotarytable") {
      document.getElementById("rotationalMoveDistance").value = "3.14"; 
      document.getElementById("totalMoveTime").value = "10";  
      document.getElementById("dwellTime").value = "2";  
      document.getElementById("accelTime").value = "2";  
      document.getElementById("decelTime").value = "2";  
      document.getElementById("massIndexTable").value = "50";  
      document.getElementById("radiusIndexTable").value = "0.5";  
      document.getElementById("gearboxRatioRotary").value = "10";
      document.getElementById("loadInertia").value = "0.1";  
      document.getElementById("frictionTorque").value = "0.5";
    }
    if (Application === "Conveyor") {
      document.getElementById("conveyorLength").value = "10";
      document.getElementById("conveyorInclineAngle").value = "30";
      document.getElementById("beltSpeed").value = "0.5";
      document.getElementById("loadMass").value = "200";
      document.getElementById("rollerDiameter").value = ".2";
      document.getElementById("frictionCoefficient").value = ".03";
    }
    if (Application === "Genericrotary") {
      document.getElementById("genericRequiredSpeed").value = "1000";  
      document.getElementById("genericAccelTime").value = "2";
      document.getElementById("genericRunTime").value = "4";
      document.getElementById("genericDecelTime").value = "2";
      document.getElementById("genericRestTime").value = "2";
      document.getElementById("genericMomentOfInertia").value = "25";
      document.getElementById("genericFrictionTorque").value = "25";
      document.getElementById("genericThermalMarginPercent").value = "20"; // 20% thermal margin
    }
    if (Application === "Blower") {
      document.getElementById("blowerAirflow").value = "3000";
      document.getElementById("blowerPressure").value = "4";
      document.getElementById("blowerFanEff").value = "65";
      document.getElementById("blowerMotorEff").value = "90";
      document.getElementById("blowerRequiredSpeed").value = "1800";
    }
      console.log("Generic data loaded for:", Application);
}

function saveCurrentConfiguration() {
    // Get selected application
    const applicationSelect = document.getElementById("application");
    const selectedAppText = applicationSelect.options[applicationSelect.selectedIndex].text;

    // Get current date and time
    const now = new Date();
    const dateTimeString = now.toLocaleString();

    // Find the visible input-group div (excluding the application select group)
    const inputGroups = document.querySelectorAll('.input-group');
    let activeGroup = null;
    inputGroups.forEach(group => {
        // Skip the first input-group (application select)
        if (group.style.display !== "none" && group.querySelector('input')) {
            activeGroup = group;
        }
    });
    if (!activeGroup) {
        alert("No active configuration to save.");
        return;
    }

    // Get all input values in the active group
    const inputs = activeGroup.querySelectorAll('input, select');
    let configText = `Saved: ${dateTimeString}\nApplication: ${selectedAppText}\nConfiguration:\n`;
    inputs.forEach(input => {
        const label = activeGroup.querySelector(`label[for="${input.id}"]`);
        const labelText = label ? label.textContent : input.id;
        configText += `${labelText} ${input.value}\n`;
    });

    // Get the results text
    const resultsDiv = document.getElementById("results");
    const results2Div = document.getElementById("results2");
    let resultsText = "";
    if (resultsDiv && resultsDiv.innerText.trim()) {
        resultsText += "\nResults:\n" + resultsDiv.innerText.trim() + "\n";
    }
    if (results2Div && results2Div.innerText.trim()) {
        resultsText += "\nResults 2:\n" + results2Div.innerText.trim() + "\n";
    }

    // Combine and display in savedConfigs
    const savedConfigsDiv = document.getElementById("savedConfigs");
    const configBlock = document.createElement("pre");
    configBlock.textContent = configText + resultsText + "\n----------\n";
    savedConfigsDiv.appendChild(configBlock);
}

clearSavedConfigurations = () => {
  const savedConfigsDiv = document.getElementById("savedConfigs");
  savedConfigsDiv.innerHTML = "";
}

function addMathTooltip(equationLatex) {
  return `
    <span class="math-tooltip">
      &#9432;
      <span class="math-tooltiptext">\\(${equationLatex}\\)</span>
    </span>
  `;
}

const unitConversions = {
  inertia: {
    'kg·m²': 1,
    'lb·ft²': 0.0421401,   // 1 lb·ft² = 0.0421401 kg·m²
    'g·cm²': 1e-7,         // 1 g·cm² = 1e-7 kg·m²
    'kg·cm²': 0.0001     // 1 kg·cm² = 0.0001 kg·m²
  },
  speed: {
    'RPM': (value) => (2 * Math.PI * value) / 60, // rad/s
    'rad/s': (value) => value,
    'deg/s': (value) => (value * Math.PI) / 180, // rad/s
    'Hz': (value) => (2 * Math.PI * value)       // rad/s
  },
  torque: {
    'Nm': 1,
    'lb·ft': 1.35582,       // 1 lb-ft = 1.35582 Nm
    'lb·in': 0.113,         // 1 lb-in = 0.113 Nm
    'oz·in': 0.00706155,    // 1 oz-in = 0.00706155 Nm
    'kg·cm': 0.0980665      // 1 kg-cm = 0.0980665 Nm
  }
};

function getConvertedValue(value, type, unit) {
  const conv = unitConversions[type][unit];
  return typeof conv === 'function' ? conv(value) : value * conv;
}

function showDoneMessage() {
    const msg = document.getElementById("doneMessage");
    msg.style.display = "inline";
    setTimeout(() => {
        msg.style.display = "none";
    }, 1000); // Message disappears after 1 second
}

window.addEventListener('DOMContentLoaded', () => {
    // List all relevant input IDs for Generic Rotary
    const rotaryInputs = [
        "genericRequiredSpeed",
        "genericSpeedUnit",
        "genericAccelTime",
        "genericRunTime",
        "genericDecelTime",
        "genericRestTime",
        "genericMomentOfInertia",
        "genericInertiaUnit",
        "genericFrictionTorque",
        "genericTorqueUnit",
        "genericThermalMarginPercent"
    ];

    rotaryInputs.forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            // Only update on 'change' (for selects) or 'blur' (for inputs), or Enter key
            if (el.tagName === "SELECT") {
                el.addEventListener('change', () => {
                    const app = document.getElementById("application");
                    if (app && app.value === "Genericrotary") {
                        findClosestGenericRotaryMotor();
                    }
                });
            } else {
                el.addEventListener('blur', () => {
                    const app = document.getElementById("application");
                    if (app && app.value === "Genericrotary") {
                        findClosestGenericRotaryMotor();
                    }
                });
                el.addEventListener('keydown', (e) => {
                    if (e.key === "Enter") {
                        const app = document.getElementById("application");
                        if (app && app.value === "Genericrotary") {
                            findClosestGenericRotaryMotor();
                        }
                    }
                });
            }
        }
    });
});

function showSizingSuggestions(application) {
    const howToSizeDiv = document.getElementById("howToSize");
    let html = "";
    switch (application) {
        case "Pump":
            html = `<b>Pump Sizing Tips:</b><ul>
                <li>Ensure the pump speed (RPM) matches the required flow and pressure.</li>
                <li>Check motor efficiency and safety factor for margin.</li>
                <li>Verify bore, rod, and stroke dimensions for hydraulic sizing.</li>
            </ul>`;
            break;
        case "Lift":
            html = `<b>Lift Sizing Tips:</b><ul>
                <li>Calculate load weight and lift height for required torque.</li>
                <li>Include gearbox ratio and drum diameter for mechanical advantage.</li>
                <li>Consider acceleration/deceleration time for motor selection.</li>
            </ul>`;
            break;
        case "Rotarytable":
            html = `<b>Rotary Table Sizing Tips:</b><ul>
                <li>Determine move distance and time for speed and acceleration.</li>
                <li>Include mass and radius for inertia calculations.</li>
                <li>Account for friction torque and dwell time in duty cycle.</li>
            </ul>`;
            break;
        case "Conveyor":
            html = `<b>Conveyor Sizing Tips:</b><ul>
                <li>Calculate belt speed and load mass for power requirements.</li>
                <li>Consider incline angle and friction coefficient.</li>
                <li>Check roller diameter for correct speed conversion.</li>
            </ul>`;
            break;
        case "Genericrotary":
            html = `<b>Generic Rotary Sizing Tips:</b><ul>
                <li>Ensure the rated motor torque is less than the RMS torque.</li>
                <li>Ensure the rated motor max torque less than accel torque.</li>
                <li>Ensure the rated motor speed meets the required speed</li>
                <li>Use thermal margin for continuous operation safety.</li>
            </ul>`;
            break;
        case "Blower":
            html = `<b>Blower Sizing Tips:</b><ul>
                <li>Set airflow and pressure for required blower performance.</li>
                <li>Include fan and motor efficiency for accurate power sizing.</li>
                <li>Check required speed for compatibility with selected motor.</li>
            </ul>`;
            break;
        default:
            html = "";
    }
    howToSizeDiv.innerHTML = html;
}

// Example usage: call this when application changes
document.getElementById("application").addEventListener("change", function(e) {
    showSizingSuggestions(e.target.value);
});



