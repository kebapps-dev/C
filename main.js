document.addEventListener("DOMContentLoaded", function() {
    // FAST MODE, KEEP!
    //   document.getElementById("application").value = "Pump";
    //   handleAppChange(); 
    //   //setTimeout(() => {document.getElementById('loadGenericData').click();}, 100);
    //   setTimeout(() => {document.getElementById('findClosestGenericRotaryMotor').click();}, 300);
    //   showSizingSuggestions(document.getElementById("application").value);
});

// Example usage: call this when application changes
document.getElementById("application").addEventListener("change", function(e) {
    showSizingSuggestions(e.target.value);
    showFormulasForApplication(e.target.value);
    handleAppChange();
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

    // Always show dynamicInputs
    const dynamicDiv = document.getElementById("dynamicInputs");
    dynamicDiv.style.display = "block";

    // Show/hide Save and Clear buttons based on app selection
    const savedConfigBtn = document.getElementById("saveConfigBtn");
    const clearSavedConfigsBtn = document.getElementById("clearSavedConfigsBtn");
    const showButtons = !!app && app !== "ChooseApplication";
    savedConfigBtn.style.display = showButtons ? "inline-block" : "none";
    clearSavedConfigsBtn.style.display = showButtons ? "inline-block" : "none";

    // Show/hide Load Generic Data button and Calculate button - hide if ChooseApplication is selected
    const loadGenericDataBtn = document.querySelector('button[onclick*="loadGenericData"]');
    const calculateBtn = document.getElementById("calculateButton");
    const lockStartingValuesBtn = document.getElementById("genericLockStartingValues");
    
    if (loadGenericDataBtn) {
        loadGenericDataBtn.style.display = (app && app !== "ChooseApplication") ? "inline-block" : "none";
    }
    
    if (calculateBtn) {
        if (app && app !== "ChooseApplication") {
            calculateBtn.style.display = "inline-block";
            // Update button text based on application
            const buttonTexts = {
                "Pump": "Calculate Pump Motor",
                "Lift": "Calculate Lift Motor", 
                "Rotarytable": "Calculate Rotary Table Motor",
                "Conveyor": "Calculate Conveyor Motor",
                "Genericrotary": "Calculate Generic Rotary Motor",
                "Blower": "Calculate Blower Motor",
                "Spindle": "Calculate Spindle Motor"
            };
            calculateBtn.textContent = buttonTexts[app] || "Calculate";
        } else {
            calculateBtn.style.display = "none";
        }
    }
    
    if (lockStartingValuesBtn) {
        // Only show for Generic Rotary
        lockStartingValuesBtn.style.display = (app === "Genericrotary") ? "inline-block" : "none";
    }

    // Clear results
    document.getElementById("results").innerHTML = "";
    document.getElementById("results2").innerHTML = "";

    renderInputsForApp(app);
    attachDynamicInputListeners(app);
    loadSelectedScript();
    showFormulasForApplication(app);
    //if (app === "Genericrotary") findClosestGenericRotaryMotor();
}

// Universal function to call the appropriate calculation function based on selected application
function calculateForApplication() {
    const app = document.getElementById("application").value;
    
    if (!app || app === "ChooseApplication") {
        alert("Please select an application first.");
        return;
    }
    
    console.log("Calculating for application:", app);
    
    // Map of applications to their calculation functions
    const calculationFunctions = {
        "Pump": "findClosestPumpMotor",
        "Lift": "findClosestLiftMotor",
        "Rotarytable": "findClosestRotaryTableMotor", 
        "Conveyor": "findClosestConveyorMotor",
        "Genericrotary": "findClosestGenericRotaryMotor",
        "Blower": "findClosestBlowerMotor",
        "Spindle": "findClosestSpindleMotor"
    };
    
    const functionName = calculationFunctions[app];
    
    if (functionName && typeof window[functionName] === 'function') {
        try {
            window[functionName]();
            showDoneMessage();
        } catch (error) {
            console.error(`Error calling ${functionName}:`, error);
            alert(`Error calculating for ${app}. Check console for details.`);
        }
    } else {
        console.error(`Function ${functionName} not found for application ${app}`);
        alert(`Calculation function not available for ${app}. Make sure the ${app.toLowerCase()}.js file is loaded.`);
    }
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
    'kg·cm²': 0.0001       // 1 kg·cm² = 0.0001 kg·m²
  },
  speed: {
    'RPM': 1,              // Keep as RPM for now, convert to rad/s in the calculation
    'rad/s': (value) => value * 60 / (2 * Math.PI), // Convert rad/s to RPM
    'deg/s': (value) => value * 60 / 6,              // Convert deg/s to RPM  
    'Hz': (value) => value * 60                      // Convert Hz to RPM
  },
  velocity: {
    'm/s': 1,
    'mm/s': 0.001,         // 1 mm/s = 0.001 m/s
    'in/s': 0.0254,        // 1 in/s = 0.0254 m/s
    'ft/s': 0.3048         // 1 ft/s = 0.3048 m/s
  },
  torque: {
    'Nm': 1,
    'lb·ft': 1.35582,       // 1 lb-ft = 1.35582 Nm
    'lb·in': 0.113,         // 1 lb-in = 0.113 Nm
    'oz·in': 0.00706155,    // 1 oz-in = 0.00706155 Nm
    'kg·cm': 0.0980665      // 1 kg-cm = 0.0980665 Nm
  },
  length: {
    'm': 1,
    'mm': 0.001,           // 1 mm = 0.001 m
    'cm': 0.01,            // 1 cm = 0.01 m
    'in': 0.0254,          // 1 in = 0.0254 m
    'ft': 0.3048           // 1 ft = 0.3048 m
  },
  mass: {
    'kg': 1,
    'g': 0.001,            // 1 g = 0.001 kg
    'lb': 0.453592,        // 1 lb = 0.453592 kg
    'oz': 0.0283495        // 1 oz = 0.0283495 kg
  },
  pressure: {
    'psi': 1,
    'Pa': 0.000145038,     // 1 Pa = 0.000145038 psi
    'kPa': 0.145038,       // 1 kPa = 0.145038 psi
    'bar': 14.5038,        // 1 bar = 14.5038 psi
    'inH2O': 0.0361273     // 1 inH2O = 0.0361273 psi
  },
  flow: {
    'GPM': 1,
    'L/min': 0.264172,     // 1 L/min = 0.264172 GPM
    'L/s': 15.8503,        // 1 L/s = 15.8503 GPM
    'CFM': 7.48052         // 1 CFM = 7.48052 GPM
  },
  airflow: {
    'CFM': 1,              // Base unit for airflow
    'm³/s': 2118.88,       // 1 m³/s = 2118.88 CFM
    'L/s': 2.11888,        // 1 L/s = 2.11888 CFM
    'm³/h': 0.588578       // 1 m³/h = 0.588578 CFM
  },
  blowerpressure: {
    'inH2O': 1,            // Base unit for blower pressure
    'Pa': 0.00401463,      // 1 Pa = 0.00401463 inH2O
    'kPa': 4.01463,        // 1 kPa = 4.01463 inH2O
    'bar': 401.463,        // 1 bar = 401.463 inH2O
    'psi': 27.6799         // 1 psi = 27.6799 inH2O
  }
};

function getConvertedValue(value, type, unit) {
  if (!unitConversions[type] || !unitConversions[type][unit]) {
    console.warn(`Unknown unit conversion: ${type} - ${unit}`);
    return value; // Return original value if no conversion found
  }
  
  if (type === 'speed') {
    // Convert to RPM first, then to rad/s
    const conv = unitConversions[type][unit];
    const rpmValue = typeof conv === 'function' ? conv(value) : value * conv;
    return (2 * Math.PI * rpmValue) / 60; // Convert RPM to rad/s
  } else {
    const conv = unitConversions[type][unit];
    return typeof conv === 'function' ? conv(value) : value * conv;
  }
}

// Helper function to determine unit type based on input ID
function getUnitType(inputId) {
  const idLower = inputId.toLowerCase();
  if (idLower.includes('rpm') || (idLower.includes('speed') && !idLower.includes('belt'))) {
    return 'speed';
  }
  if (idLower.includes('velocity') || idLower.includes('beltspeed') || idLower.includes('maxspeed')) {
    return 'velocity';
  }
  if (idLower.includes('inertia')) {
    return 'inertia';
  }
  if (idLower.includes('torque')) {
    return 'torque';
  }
  if (idLower.includes('length') || idLower.includes('height') || idLower.includes('diameter') || idLower.includes('radius') || idLower.includes('stroke') || idLower.includes('bore') || idLower.includes('rod')) {
    return 'length';
  }
  if (idLower.includes('mass') || idLower.includes('weight')) {
    return 'mass';
  }
  if (idLower.includes('blowerairflow') || idLower === 'blowerairflow') {
    return 'airflow';
  }
  if (idLower.includes('blowerpressure') || idLower === 'blowerpressure') {
    return 'blowerpressure';
  }
  if (idLower.includes('pressure')) {
    return 'pressure';
  }
  if (idLower.includes('flow')) {
    return 'flow';
  }
  return null; // No conversion needed
}

// Helper function to get converted value from input with automatic unit detection
function getValueWithUnit(inputId) {
  const inputEl = document.getElementById(inputId);
  const unitEl = document.getElementById(inputId + "Unit");
  
  if (!inputEl) {
    console.warn(`Input element ${inputId} not found`);
    return NaN;
  }
  
  const value = parseFloat(inputEl.value);
  if (isNaN(value)) return NaN;
  
  // If no unit selector, return the raw value
  if (!unitEl) return value;
  
  // Get unit type and convert
  const unitType = getUnitType(inputId);
  if (unitType) {
    return getConvertedValue(value, unitType, unitEl.value);
  }
  
  return value;
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

function showFormulasForApplication(application) {
    const formulasContainer = document.getElementById("formulasContainer");
    let html = "";
    
    // Clear formulas if no application or "Choose Application" is selected
    if (!application || application === "ChooseApplication") {
        formulasContainer.innerHTML = "";
        return;
    }
    
    switch (application) {
        case "Pump":
            html = `
                <span class="formula"><b>Clamp Area:</b> \\( A_{clamp} = \\frac{\\pi}{4} \\cdot (D_{bore}^2 - D_{rod}^2) \\)</span>
                <span class="formula"><b>Clamp Volume:</b> \\( V_{clamp} = A_{clamp} \\cdot L_{stroke} \\)</span>
                <span class="formula"><b>Flow Rate:</b> \\( Q = \\frac{V_{clamp}}{t_{stroke}} \\)</span>
                <span class="formula"><b>Pump Displacement:</b> \\( D_{pump} = \\frac{Q}{RPM} \\)</span>
                <span class="formula"><b>Clamping Force:</b> \\( F_{clamp} = P_{clamp} \\cdot A_{clamp} \\)</span>
            `;
            break;
        case "Lift":
            html = `
                <span class="formula"><b>Torque Required:</b> \\( T = \\frac{F \\cdot D_{drum}}{2 \\cdot GR \\cdot \\eta} \\)</span>
                <span class="formula"><b>Force:</b> \\( F = m \\cdot g \\)</span>
                <span class="formula"><b>Speed:</b> \\( \\omega = \\frac{v \\cdot 2}{D_{drum}} \\cdot GR \\)</span>
                <span class="formula"><b>Power:</b> \\( P = T \\cdot \\omega \\)</span>
                <span class="formula"><b>Acceleration Torque:</b> \\( T_{accel} = J \\cdot \\alpha \\)</span>
            `;
            break;
        case "Rotarytable":
            html = `
                <span class="formula"><b>Inertia:</b> \\( J = \\frac{1}{2} \\cdot m \\cdot r^2 + J_{load} \\)</span>
                <span class="formula"><b>Angular Velocity:</b> \\( \\omega = \\frac{\\theta}{t_{move}} \\)</span>
                <span class="formula"><b>Angular Acceleration:</b> \\( \\alpha = \\frac{\\omega}{t_{accel}} \\)</span>
                <span class="formula"><b>Acceleration Torque:</b> \\( T_{accel} = J \\cdot \\alpha + T_{friction} \\)</span>
                <span class="formula"><b>Required Motor Torque:</b> \\( T_{motor} = \\frac{T_{accel}}{GR} \\)</span>
            `;
            break;
        case "Conveyor":
            html = `
                <span class="formula"><b>Belt Force:</b> \\( F_{belt} = m \\cdot g \\cdot (\\sin(\\theta) + \\mu \\cdot \\cos(\\theta)) \\)</span>
                <span class="formula"><b>Motor Torque:</b> \\( T_{motor} = \\frac{F_{belt} \\cdot D_{roller}}{2} \\)</span>
                <span class="formula"><b>Motor Speed:</b> \\( RPM = \\frac{v_{belt} \\cdot 60}{\\pi \\cdot D_{roller}} \\)</span>
                <span class="formula"><b>Power Required:</b> \\( P = F_{belt} \\cdot v_{belt} \\)</span>
            `;
            break;
        case "Genericrotary":
            html = `
                <span class="formula">\\( \\omega = 2\\pi \\cdot \\frac{\\text{RPM}}{60} \\)</span>
                <span class="formula"><b>(2)</b> \\( T_{accel} = J \\cdot \\alpha = J \\cdot \\frac{\\omega}{t_{accel}} \\)</span>
                <span class="formula"><b>(3)</b> \\( T_{rms} = \\sqrt{\\frac{T_{accel}^2 t_{accel} + T_{run}^2 t_{run} + T_{decel}^2 t_{decel} + T_{rest}^2 t_{rest}}{t_{cycle}}} \\)</span>
                <span class="formula">\\( P = T_{rms} \\cdot \\omega \\)</span>
                <span class="formula"><b>(1)</b> \\( P_{margin} = P \\cdot (1 + \\frac{\\text{margin}}{100}) \\)</span>
            `;
            break;
        case "Blower":
            html = `
                <span class="formula"><b>Fan Power:</b> \\( P_{fan} = \\frac{Q \\times \\Delta P}{\\eta_{fan}/100} \\)</span>
                <span class="formula"><b>Motor Power:</b> \\( P_{motor} = \\frac{P_{fan}}{\\eta_{motor}/100} \\)</span>
                <span class="formula"><b>Motor Torque:</b> \\( T = \\frac{P_{motor}}{\\omega} = \\frac{P_{motor}}{\\frac{2\\pi \\times RPM}{60}} \\)</span>
                <span class="formula"><b>Where:</b> Q = Flow Rate (CFM), ΔP = Pressure (inH₂O), ω = Angular velocity (rad/s)</span>
            `;
            break;
        default:
            html = "";
    }
    
    formulasContainer.innerHTML = html;
    
    // Re-render MathJax if it's loaded
    if (window.MathJax && window.MathJax.typesetPromise) {
        window.MathJax.typesetPromise([formulasContainer]).catch((err) => {
            console.log('MathJax typeset failed: ' + err.message);
        });
    }
}

// Parse inputs.csv and store definitions
Papa.parse('csv/inputs.csv', {
    download: true,
    header: true,
    complete: function(results) {
        console.log("Papa.parse complete, results:", results);
        if (results.errors && results.errors.length > 0) {
            console.error("CSV parsing errors:", results.errors);
        }
        
        // Group by application
        inputDefinitions = results.data.reduce((acc, row) => {
            if (row.Application) { // Make sure Application is not empty
                if (!acc[row.Application]) acc[row.Application] = [];
                acc[row.Application].push(row);
            }
            return acc;
        }, {});
        
        console.log("inputDefinitions after Papa.parse:", inputDefinitions);
        
        // Render initial inputs if app is already selected
        const app = document.getElementById("application").value;
        if (app) renderInputsForApp(app);
    },
    error: function(error) {
        console.error("Error loading inputs.csv with Papa.parse:", error);
    }
});

// Render dynamic inputs for selected application
function renderInputsForApp(appName) {
    const container = document.getElementById("dynamicInputs");
    container.innerHTML = ""; // Clear previous

    if (!inputDefinitions[appName]) {
        console.warn("No input definitions found for", appName);
        return;
    }

    inputDefinitions[appName].forEach(def => {
        const wrapper = document.createElement("div");
        wrapper.style.marginBottom = "8px";

        // Label
        const label = document.createElement("label");
        label.htmlFor = def.InputID;
        label.textContent = def.Label || def.InputID;
        if (def.Title) label.title = def.Title;
        label.style.display = "inline-block";
        label.style.width = "250px";
        wrapper.appendChild(label);

        // Input
        const input = document.createElement("input");
        input.type = def.Type || "text";
        input.id = def.InputID;
        input.name = def.InputID;
        if (def.Step) input.step = def.Step;
        if (def.Title) input.title = def.Title;
        input.style.width = "100px";
        wrapper.appendChild(input);

        // Unit(s)
        if (def.Unit) {
            const units = def.Unit.replace(/"/g, "").split(',').map(u => u.trim());
            
            if (units.length > 1) {
                const select = document.createElement("select");
                select.id = def.InputID + "Unit";
                select.title = "Select the unit for " + (def.Label || def.InputID);
                units.forEach(unit => {
                    const opt = document.createElement("option");
                    opt.value = unit;
                    opt.textContent = unit;
                    select.appendChild(opt);
                });
                select.style.marginLeft = "4px";
                wrapper.appendChild(select);
            } else if (units[0]) {
                const unitSpan = document.createElement("span");
                unitSpan.textContent = " " + units[0];
                unitSpan.style.marginLeft = "4px";
                wrapper.appendChild(unitSpan);
            }
        }

        container.appendChild(wrapper);
    });
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

let inputDefinitions = {};

function attachDynamicInputListeners(app) {
    const container = document.getElementById("dynamicInputs");
    const inputs = container.querySelectorAll('input, select');
    inputs.forEach(el => {
        if (el.tagName === "SELECT") {
            el.addEventListener('change', () => {
                // Use universal calculation function for all applications
                calculateForApplication();
            });
        } else {
            el.addEventListener('blur', () => {
                // Use universal calculation function for all applications  
                calculateForApplication();
            });
            el.addEventListener('keydown', (e) => {
                if (e.key === "Enter") {
                    // Use universal calculation function for all applications
                    calculateForApplication();
                }
            });
        }
    });
}