document.addEventListener("DOMContentLoaded", function() {
    // FAST MODE
      document.getElementById("application").value = "Genericrotary";
      handleAppChange(); 
      setTimeout(() => {document.getElementById('loadGenericData').click();}, 100);
      setTimeout(() => {document.getElementById('findClosestGenericRotaryMotor').click();}, 300);
      showSizingSuggestions(document.getElementById("application").value);
});

// Example usage: call this when application changes
document.getElementById("application").addEventListener("change", function(e) {
    showSizingSuggestions(e.target.value);
});

//---Handle Application Defaults
  let appDefaults = {};

  function parseDefaultsCSV(text) {
      const lines = text.trim().split('\n');
      const result = {};
      for (let i = 1; i < lines.length; i++) { // skip header
          // Split and trim each value to remove \r and spaces
          const [app, id, value] = lines[i].split(',').map(s => s.trim());
          if (!result[app]) result[app] = {};
          result[app][id] = value;
      }
      return result;
  }

  // Fetch and parse the CSV on page load
  fetch('csv/defaults.csv')
      .then(res => res.text())
      .then(text => {
          appDefaults = parseDefaultsCSV(text);
      })
      .catch(err => {
          console.error("Could not load defaults.csv:", err);
      });

  function loadGenericData(Application) {
    if (!appDefaults[Application]) {
        console.warn("No defaults found for application:", Application);
        return;
    }
    Object.entries(appDefaults[Application]).forEach(([id, value]) => {
        const el = document.getElementById(id);
        if (el) el.value = value;
    });
    console.log("Generic data loaded for:", Application);
}
//---End Application Defaults


function handleAppChange() {
    console.log("Application changed, updating input groups...");
    const app = document.getElementById("application").value;

    // Map application names to their input div IDs
    const appDivMap = {
        Pump: "pumpInputs",
        Lift: "liftInputs",
        Rotarytable: "rotaryTableInputs",
        Conveyor: "conveyorInputs",
        Genericrotary: "genericRotaryInputs",
        Blower: "blowerInputs",
        Spindle: "spindleInputs"
    };

    // Hide all input groups first
    Object.values(appDivMap).forEach(id => {
        const div = document.getElementById(id);
        if (div) div.style.display = "none";
    });

    // Show the selected application's input group if it exists
    if (appDivMap[app]) {
        const div = document.getElementById(appDivMap[app]);
        if (div) div.style.display = "block";
    }

    // Show/hide Save and Clear buttons based on app selection
    const savedConfigBtn = document.getElementById("saveConfigBtn");
    const clearSavedConfigsBtn = document.getElementById("clearSavedConfigsBtn");
    const showButtons = !!appDivMap[app];
    savedConfigBtn.style.display = showButtons ? "inline-block" : "none";
    clearSavedConfigsBtn.style.display = showButtons ? "inline-block" : "none";

    // Clear results
    document.getElementById("results").innerHTML = "";
    document.getElementById("results2").innerHTML = "";

    loadSelectedScript();
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





//needs to be scalable to other applications
document.addEventListener('DOMContentLoaded', () => {
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