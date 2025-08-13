// Centralized Data Manager for all CSV loading
class DataManager {
    static data = {};
    static loadingPromises = {};
    static isInitialized = false;

    static async initialize() {
        if (this.isInitialized) return;
        
        console.log("DataManager: Starting initialization...");
        
        try {
            // Load only the essential CSV files for dynamic inputs and defaults
            await Promise.all([
                this.loadCSV('defaults', 'csv/defaults.csv', 'text'),
                this.loadCSV('inputs', 'csv/inputs.csv', 'papa')
            ]);
            
            this.isInitialized = true;
            console.log("DataManager: All CSV data loaded successfully");
            
            // Trigger any dependent initializations
            this.onDataReady();
        } catch (error) {
            console.error("DataManager: Failed to load CSV data:", error);
        }
    }

    static async loadCSV(key, filepath, type = 'papa') {
        if (this.loadingPromises[key]) {
            return this.loadingPromises[key];
        }

        this.loadingPromises[key] = new Promise((resolve, reject) => {
            if (type === 'text') {
                // For defaults.csv which uses fetch
                fetch(filepath)
                    .then(res => res.text())
                    .then(text => {
                        this.data[key] = this.parseDefaultsCSV(text);
                        console.log(`DataManager: Loaded ${key} (${Object.keys(this.data[key]).length} applications)`);
                        resolve(this.data[key]);
                    })
                    .catch(error => {
                        console.error(`DataManager: Error loading ${key}:`, error);
                        reject(error);
                    });
            } else {
                // For other CSVs which use Papa.parse
                Papa.parse(filepath, {
                    download: true,
                    header: true,
                    complete: (results) => {
                        if (results.errors && results.errors.length > 0) {
                            console.warn(`DataManager: CSV parsing warnings for ${key}:`, results.errors);
                        }
                        
                        if (key === 'inputs') {
                            // Special processing for inputs.csv
                            this.data[key] = results.data.reduce((acc, row) => {
                                if (row.Application) {
                                    if (!acc[row.Application]) acc[row.Application] = [];
                                    acc[row.Application].push(row);
                                }
                                return acc;
                            }, {});
                        } else {
                            this.data[key] = results.data;
                        }
                        
                        console.log(`DataManager: Loaded ${key} (${Array.isArray(this.data[key]) ? this.data[key].length : Object.keys(this.data[key]).length} items)`);
                        resolve(this.data[key]);
                    },
                    error: (error) => {
                        console.error(`DataManager: Error loading ${key}:`, error);
                        reject(error);
                    }
                });
            }
        });

        return this.loadingPromises[key];
    }

    static parseDefaultsCSV(text) {
        const lines = text.trim().split('\n');
        const result = {};
        for (let i = 1; i < lines.length; i++) {
            const [app, id, value] = lines[i].split(',').map(s => s.trim());
            if (!result[app]) result[app] = {};
            result[app][id] = value;
        }
        return result;
    }

    static onDataReady() {
        // Update global variables for backward compatibility
        if (this.data.defaults) {
            window.appDefaults = this.data.defaults;
        }
        if (this.data.inputs) {
            window.inputDefinitions = this.data.inputs;
        }
        
        // Render initial inputs if app is already selected
        const app = document.getElementById("application").value;
        if (app) {
            renderInputsForApp(app);
        }
    }

    static getData(key) {
        return this.data[key] || null;
    }

    static async waitForData(key) {
        if (this.data[key]) return this.data[key];
        if (this.loadingPromises[key]) return this.loadingPromises[key];
        
        console.warn(`DataManager: Data for ${key} not found and not being loaded`);
        return null;
    }
}

document.addEventListener("DOMContentLoaded", function() {
    // Initialize data loading first
    DataManager.initialize();
    
    // FAST MODE, KEEP!
    //   document.getElementById("application").value = "Pump";
    //   handleAppChange(); 
    //   //setTimeout(() => {document.getElementById('loadGenericData').click();}, 100);
    //   setTimeout(() => {document.getElementById('findClosestGenericRotaryMotor').click();}, 300);
    //   showSizingSuggestions(document.getElementById("application").value);
});

// Example usage: call this when application changes
document.getElementById("application").addEventListener("change", function(e) {
    // Clear sizing suggestions when application changes
    document.getElementById("howToSize").innerHTML = "";
    // Clear lock starting values button when application changes
    const lockButton = document.getElementById("lockStartingValuesBtn");
    if (lockButton) {
        lockButton.remove();
    }
    // Clear results and reset state
    document.getElementById("results").innerHTML = "";
    startingValues = [];
    showSegments = false;
    previousOutputs = {};
    // Sizing suggestions will now be shown after calculations are completed
    showFormulasForApplication(e.target.value);
    handleAppChange();
});

//---Handle Application Defaults
let appDefaults = {};

function loadGenericData(Application) {
    const defaults = DataManager.getData('defaults');
    if (!defaults || !defaults[Application]) {
        console.warn("No defaults found for application:", Application);
        return;
    }
    Object.entries(defaults[Application]).forEach(([id, value]) => {
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
                "Pump": "Calculate Pump System",
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


function addMathTooltip(equationLatex) {
  return `
    <span class="math-tooltip">
      &#9432;
      <span class="math-tooltiptext">\\(${equationLatex}\\)</span>
    </span>
  `;
}

const unitConversions = {
  angle: {
    'rad': 1,
    'deg': Math.PI / 180   // 1 degree = π/180 radians
  },
  inertia: {
    'kg·m²': 1,
    'lb·ft²': 0.0421401,   // 1 lb·ft² = 0.0421401 kg·m²
    'g·cm²': 1e-7,         // 1 g·cm² = 1e-7 kg·m²
    'kg·cm²': 0.0001       // 1 kg·cm² = 0.0001 kg·m²
  },
  speed: {
    'RPM': (2 * Math.PI) / 60,        // Convert RPM to rad/s
    'rad/s': 1,                       // Base unit: rad/s
    'deg/s': Math.PI / 180,           // Convert deg/s to rad/s
    'Hz': 2 * Math.PI                 // Convert Hz to rad/s
  },
  velocity: {
    'm/s': 1,
    'mm/s': 0.001,         // 1 mm/s = 0.001 m/s
    'in/s': 0.0254,        // 1 in/s = 0.0254 m/s
    'ft/s': 0.3048         // 1 ft/s = 0.3048 m/s
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
    'Pa': 1,               // Base unit: Pascals (metric)
    'kPa': 1000,           // 1 kPa = 1000 Pa
    'bar': 100000,         // 1 bar = 100000 Pa
    'psi': 6894.76,        // 1 psi = 6894.76 Pa
    'inH2O': 249.089       // 1 inH2O = 249.089 Pa
  },
  flow: {
    'L/min': 1,            // Base unit: Liters per minute (metric)
    'GPM': 3.78541,        // 1 GPM = 3.78541 L/min
    'L/s': 60,             // 1 L/s = 60 L/min
    'CFM': 28.3168         // 1 CFM = 28.3168 L/min
  },
  airflow: {
    'm³/s': 1,             // Base unit: cubic meters per second (metric)
    'CFM': 0.000471947,    // 1 CFM = 0.000471947 m³/s
    'L/s': 0.001,          // 1 L/s = 0.001 m³/s
    'm³/h': (1/3600)       // 1 m³/h = 1/3600 m³/s
  },
  blowerpressure: {
    'Pa': 1,               // Base unit: Pascals (metric)
    'kPa': 1000,           // 1 kPa = 1000 Pa
    'bar': 100000,         // 1 bar = 100000 Pa
    'psi': 6894.76,        // 1 psi = 6894.76 Pa
    'inH2O': 249.089       // 1 inH2O = 249.089 Pa
  },
  power: {
    'W': 1,                // Base unit: Watts
    'kW': 1000,            // 1 kW = 1000 W (input conversion)
    'HP': 745.7,           // 1 HP = 745.7 W (input conversion)
    'mW': 0.001            // 1 mW = 0.001 W (input conversion)
  },
  torque: {
    'Nm': 1,               // Base unit: Newton-meters
    'lb·ft': 1.35582,      // 1 lb·ft = 1.35582 Nm (input conversion)
    'lb·in': 0.112985,     // 1 lb·in = 0.112985 Nm (input conversion)
    'oz·in': 0.00706155,   // 1 oz·in = 0.00706155 Nm (input conversion)
    'kg·cm': 0.0980665     // 1 kg·cm = 0.0980665 Nm (input conversion)
  }
};

// Function to convert result values from base units to selected display units
function convertResultValue(value, unitType, targetUnit) {
  if (!unitConversions[unitType] || !unitConversions[unitType][targetUnit]) {
    console.warn(`Unknown result unit conversion: ${unitType} - ${targetUnit}`);
    return value; // Return original value if no conversion found
  }
  
  const conversionFactor = unitConversions[unitType][targetUnit];
  if (typeof conversionFactor === 'function') {
    // This shouldn't happen for result conversions, but handle it just in case
    return value;
  } else {
    // For result display: divide by conversion factor to get inverse
    // (since unitConversions is set up for input: display units → base units)
    // We need the inverse for results: base units → display units
    return value / conversionFactor;
  }
}

// Function to get available units for a unit type
function getAvailableUnits(unitType) {
  return unitConversions[unitType] ? Object.keys(unitConversions[unitType]) : [];
}

// Function to update result display when unit dropdown changes
function updateResultUnit(selectElement) {
  const newUnit = selectElement.value;
  const resultSpan = selectElement.previousElementSibling;
  
  if (resultSpan && resultSpan.classList.contains('result-value')) {
    const baseValue = parseFloat(resultSpan.getAttribute('data-base-value'));
    const unitType = resultSpan.getAttribute('data-unit-type');
    
    const convertedValue = convertResultValue(baseValue, unitType, newUnit);
    resultSpan.textContent = parseFloat(convertedValue.toFixed(3));
  }
}

function getConvertedValue(value, type, unit) {
  if (!unitConversions[type] || !unitConversions[type][unit]) {
    console.warn(`Unknown unit conversion: ${type} - ${unit}`);
    return value; // Return original value if no conversion found
  }
  
  const conv = unitConversions[type][unit];
  return typeof conv === 'function' ? conv(value) : value * conv;
}

// Legacy unit type detection - DEPRECATED (replaced by CSV UnitType column)
// Helper function to determine unit type based on input ID
/*
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
  if (idLower.includes('angle') || idLower.includes('distance') && idLower.includes('rotation') || idLower.includes('incline')) {
    return 'angle';
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
*/

// Helper function to get converted value from input with unit type from CSV
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
  
  // Get unit type from input definitions instead of pattern matching
  const unitType = getUnitTypeFromCSV(inputId);
  if (unitType) {
    return getConvertedValue(value, unitType, unitEl.value);
  }
  
  return value;
}

// Helper function to get unit type from CSV data
function getUnitTypeFromCSV(inputId) {
  // Search through all applications for this input ID
  for (const app in inputDefinitions) {
    const inputDef = inputDefinitions[app].find(def => def.InputID === inputId);
    if (inputDef && inputDef.UnitType) {
      return inputDef.UnitType;
    }
  }
  return null; // No unit type found
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
                <li>Enter accurate bore, rod, and stroke dimensions for hydraulic calculations.</li>
                <li>Verify clamp pressure and time requirements for proper flow calculations.</li>
                <li>Set appropriate safety factor for motor sizing margin.</li>
                <li>Check that calculated displacement and torque meet your application needs.</li>
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
            * add option for clamp cylinder dimensions vs flow rate input
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

    // Add result unit selection for Blower application
    // Note: Now using inline unit dropdowns in result table instead
    // if (appName.toLowerCase() === 'blower') {
    //     addResultUnitControls(container);
    // }
}

//needs to be scalable to other applications

// Function to add result unit selection controls that behave like input controls
function addResultUnitControls(container) {
    // Create a separator
    const separator = document.createElement("hr");
    separator.style.margin = "15px 0 10px 0";
    container.appendChild(separator);

    // Add title for result units
    const title = document.createElement("h4");
    title.textContent = "Result Units";
    title.style.margin = "0 0 10px 0";
    title.style.color = "#333";
    container.appendChild(title);

    // Power unit selection
    const powerWrapper = document.createElement("div");
    powerWrapper.style.marginBottom = "8px";

    const powerLabel = document.createElement("label");
    powerLabel.textContent = "Power Unit:";
    powerLabel.style.display = "inline-block";
    powerLabel.style.width = "250px";
    powerWrapper.appendChild(powerLabel);

    const powerSelect = document.createElement("select");
    powerSelect.id = "blowerPowerUnit";
    powerSelect.title = "Select unit for power results";
    powerSelect.style.width = "80px";
    powerSelect.style.marginLeft = "4px";
    
    const powerUnits = getAvailableUnits('power');
    powerUnits.forEach(unit => {
        const opt = document.createElement("option");
        opt.value = unit;
        opt.textContent = unit;
        if (unit === 'W') opt.selected = true; // Default to Watts
        powerSelect.appendChild(opt);
    });
    powerWrapper.appendChild(powerSelect);
    container.appendChild(powerWrapper);

    // Torque unit selection
    const torqueWrapper = document.createElement("div");
    torqueWrapper.style.marginBottom = "8px";

    const torqueLabel = document.createElement("label");
    torqueLabel.textContent = "Torque Unit:";
    torqueLabel.style.display = "inline-block";
    torqueLabel.style.width = "250px";
    torqueWrapper.appendChild(torqueLabel);

    const torqueSelect = document.createElement("select");
    torqueSelect.id = "blowerTorqueUnit";
    torqueSelect.title = "Select unit for torque results";
    torqueSelect.style.width = "80px";
    torqueSelect.style.marginLeft = "4px";
    
    const torqueUnits = getAvailableUnits('torque');
    torqueUnits.forEach(unit => {
        const opt = document.createElement("option");
        opt.value = unit;
        opt.textContent = unit;
        if (unit === 'Nm') opt.selected = true; // Default to Newton-meters
        torqueSelect.appendChild(opt);
    });
    torqueWrapper.appendChild(torqueSelect);
    container.appendChild(torqueWrapper);
}

// Function to add result unit selection controls
function addResultUnitControls(container) {
    // Create a separator
    const separator = document.createElement("hr");
    separator.style.margin = "15px 0 10px 0";
    container.appendChild(separator);

    // Add title for result units
    const title = document.createElement("h4");
    title.textContent = "Result Units";
    title.style.margin = "0 0 10px 0";
    title.style.color = "#333";
    container.appendChild(title);

    // Power unit selection
    const powerWrapper = document.createElement("div");
    powerWrapper.style.marginBottom = "8px";

    const powerLabel = document.createElement("label");
    powerLabel.textContent = "Power Unit:";
    powerLabel.style.display = "inline-block";
    powerLabel.style.width = "250px";
    powerWrapper.appendChild(powerLabel);

    const powerSelect = document.createElement("select");
    powerSelect.id = "blowerPowerUnit";
    powerSelect.title = "Select unit for power results";
    powerSelect.style.width = "80px";
    powerSelect.style.marginLeft = "4px";
    
    const powerUnits = getAvailableUnits('power');
    powerUnits.forEach(unit => {
        const opt = document.createElement("option");
        opt.value = unit;
        opt.textContent = unit;
        if (unit === 'W') opt.selected = true; // Default to Watts
        powerSelect.appendChild(opt);
    });
    powerWrapper.appendChild(powerSelect);
    container.appendChild(powerWrapper);

    // Torque unit selection
    const torqueWrapper = document.createElement("div");
    torqueWrapper.style.marginBottom = "8px";

    const torqueLabel = document.createElement("label");
    torqueLabel.textContent = "Torque Unit:";
    torqueLabel.style.display = "inline-block";
    torqueLabel.style.width = "250px";
    torqueWrapper.appendChild(torqueLabel);

    const torqueSelect = document.createElement("select");
    torqueSelect.id = "blowerTorqueUnit";
    torqueSelect.title = "Select unit for torque results";
    torqueSelect.style.width = "80px";
    torqueSelect.style.marginLeft = "4px";
    
    const torqueUnits = getAvailableUnits('torque');
    torqueUnits.forEach(unit => {
        const opt = document.createElement("option");
        opt.value = unit;
        opt.textContent = unit;
        if (unit === 'Nm') opt.selected = true; // Default to Newton-meters
        torqueSelect.appendChild(opt);
    });
    torqueWrapper.appendChild(torqueSelect);
    container.appendChild(torqueWrapper);
}
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

    // Note: Result unit controls are now inline dropdowns in the result table
    // and use the updateInlineResultUnit() function for handling changes
}

// Standardized Results Display System (like Generic Rotary)
const SEGMENT_WIDTH = 250;
let previousOutputs = {};
let startingValues = [];
let showSegments = false;
let currentApplication = '';

function lockStartingValues() {
    const resultsDiv = document.getElementById("results");
    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = resultsDiv.innerHTML;
    const items = tempDiv.querySelectorAll("tbody tr");
    startingValues = [];
    let idx = 0;
    for (const key of Object.keys(previousOutputs)) {
        const item = items[idx];
        if (item) {
            const valueCell = item.querySelectorAll("td")[1];
            if (valueCell) {
                const match = valueCell.textContent.match(/-?\d+(\.\d+)?/);
                if (match) {
                    const num = parseFloat(match[0]);
                    if (!isNaN(num)) {
                        startingValues.push(num);
                    } else {
                        startingValues.push(previousOutputs[key]);
                    }
                } else {
                    startingValues.push(previousOutputs[key]);
                }
            } else {
                startingValues.push(previousOutputs[key]);
            }
        } else {
            startingValues.push(previousOutputs[key]);
        }
        idx++;
    }
    showSegments = true;
    displayStandardResults(previousOutputs);
}

function displayStandardResults(currentOutputs) {
    const resultsDiv = document.getElementById("results");
    
    // Check if application has changed and reset state if needed
    const selectedApp = document.getElementById("application")?.value;
    if (selectedApp && selectedApp !== currentApplication) {
        currentApplication = selectedApp;
        startingValues = [];
        showSegments = false;
        previousOutputs = {};
    }
    
    // Add Lock Starting Values button only if there are valid calculated results
    const hasValidOutputs = currentOutputs && Object.keys(currentOutputs).length > 0;
    let lockButton = document.getElementById("lockStartingValuesBtn");
    const genericLockButton = document.getElementById("genericLockStartingValues");
    
    if (hasValidOutputs && !lockButton && !genericLockButton) {
        const buttonHtml = `<button id="lockStartingValuesBtn" onclick="lockStartingValues()" style="margin-bottom: 10px; display: block;">Lock Starting Values</button>`;
        resultsDiv.insertAdjacentHTML('beforebegin', buttonHtml);
    } else if (hasValidOutputs && genericLockButton && selectedApp === 'Genericrotary') {
        // Use the existing Generic Rotary button
        genericLockButton.style.display = 'block';
    } else if (hasValidOutputs && genericLockButton && selectedApp !== 'Genericrotary') {
        // Hide the Generic Rotary button for other applications
        genericLockButton.style.display = 'none';
        if (!lockButton) {
            const buttonHtml = `<button id="lockStartingValuesBtn" onclick="lockStartingValues()" style="margin-bottom: 10px; display: block;">Lock Starting Values</button>`;
            resultsDiv.insertAdjacentHTML('beforebegin', buttonHtml);
        }
    } else if (!hasValidOutputs) {
        // Remove button if no valid outputs
        if (lockButton) {
            lockButton.remove();
        }
        if (genericLockButton) {
            genericLockButton.style.display = 'none';
        }
    }
    
    let html = `<table style='margin-top:10px; border-collapse:collapse;'>
        <thead>
            <tr>
                <th style='text-align:left;padding:4px;'>Result</th>
                <th style='text-align:left;padding:4px;'>Value</th>
                <th style='text-align:left;padding:4px;'>Adjustment from Starting Value</th>
                <th style='text-align:left;padding:4px;'>Status</th>
            </tr>
        </thead>
        <tbody>`;
    let idx = 0;
    let waitingForStartingValuePresent = false;

    function getSegmentColor(percentChange) {
        if (percentChange > 0) {
            const t = Math.min(percentChange, 1);
            const r = Math.round(255 * (1 - t) + 200 * t);
            const g = Math.round(165 * (1 - t));
            const b = 0;
            return `rgb(${r},${g},${b})`;
        } else if (percentChange < 0) {
            const t = Math.min(-percentChange, 1);
            const r = Math.round(255 * (1 - t));
            const g = Math.round(255 * (1 - t) + 200 * t);
            const b = Math.round(0 * (1 - t));
            return `rgb(${r},${g},${b})`;
        } else {
            return "#222";
        }
    }

    for (const [key, value] of Object.entries(currentOutputs)) {
        // Extract only the first numeric value from the string (before any units or secondary values)
        const match = String(value).match(/-?\d+(?:\.\d+)?/);
        const numericValue = match ? parseFloat(match[0]) : NaN;
        
        let segmentHtml = "";
        let statusHtml = "None";
        let adjustmentHtml = "";
        if (
            showSegments &&
            startingValues[idx] !== undefined &&
            !isNaN(startingValues[idx])
        ) {
            const startVal = startingValues[idx];
            // Use ±100% range for adjustment visualization
            const percentageRange = Math.abs(startVal) * 1.0; // 100% range
            const minimumRange = 0.01; // Minimum absolute range for small values
            const range = Math.max(percentageRange, minimumRange);
            const minVal = startVal - range;
            const maxVal = startVal + range;

            let percentChange = 0;
            if (!isNaN(numericValue) && startVal !== 0) {
                percentChange = (numericValue - startVal) / Math.abs(startVal);
            }

            let pos = SEGMENT_WIDTH / 2;
            if (!isNaN(numericValue)) {
                pos = 10 + (SEGMENT_WIDTH - 20) * ((numericValue - minVal) / (maxVal - minVal));
            }

            const circleColor = getSegmentColor(Math.max(-1, Math.min(1, percentChange)));
            
            segmentHtml = `
                <svg width="${SEGMENT_WIDTH}" height="32" style="vertical-align:middle;">
                  <line x1="10" y1="12" x2="${SEGMENT_WIDTH - 10}" y2="12" stroke="#555" stroke-width="2"/>
                  <rect x="10" y="7" width="4" height="10" fill="#555" />
                  <rect x="${(SEGMENT_WIDTH / 2) - 2}" y="7" width="4" height="10" fill="#222" />
                  <rect x="${SEGMENT_WIDTH - 14}" y="7" width="4" height="10" fill="#555" />
                  <circle cx="${pos}" cy="12" r="10" fill="${circleColor}" />
                  <text x="0" y="30" font-size="10" fill="#555">${minVal.toFixed(2)}</text>
                  <text x="${(SEGMENT_WIDTH / 2) - 10}" y="30" font-size="10" fill="#555">${startVal.toFixed(2)}</text>
                  <text x="${SEGMENT_WIDTH - 30}" y="30" font-size="10" fill="#555">${maxVal.toFixed(2)}</text>
                </svg>
            `;

            adjustmentHtml = segmentHtml;

            if (percentChange > 1 || percentChange < -1) {
                statusHtml = `<span style="color:#c80000;font-weight:bold;">Results out of scope. Change starting values.</span>`;
            }
        } else {
            adjustmentHtml = `<span style="color:#888;">Waiting for starting value</span>`;
            statusHtml = `<span style="color:#888;">None</span>`;
            waitingForStartingValuePresent = true;
        }

        // Hardcoded result unit mappings for each application
        const currentApp = document.getElementById("application")?.value;
        let valueDisplayHtml = String(value);
        
        // Define which results get unit conversion dropdowns
        const resultUnitMappings = {
            'Blower': {
                'Fan Power': { type: 'power', component: 'fan', defaultUnit: 'kW' },
                'Motor Power': { type: 'power', component: 'motor', defaultUnit: 'kW' },
                'Torque Required': { type: 'torque', component: 'motor', defaultUnit: 'Nm' }
            },
            'Conveyor': {
                'Required Motor Power kW': { type: 'power', component: 'motor', defaultUnit: 'kW' },
                'Required Motor Power HP': { type: 'power', component: 'motor', defaultUnit: 'HP' },
                'Required Torque': { type: 'torque', component: 'motor', defaultUnit: 'Nm' }
            },
            'Pump': {
                'Required Motor Power': { type: 'power', component: 'motor', defaultUnit: 'kW' },
                'Motor Required Torque': { type: 'torque', component: 'motor', defaultUnit: 'Nm' }
            },
            'Spindle': {
                'Motor Power': { type: 'power', component: 'motor', defaultUnit: 'kW' },
                'Torque Required': { type: 'torque', component: 'motor', defaultUnit: 'Nm' }
            },
            'Lift': {
                'Motor Required Torque': { type: 'torque', component: 'motor', defaultUnit: 'Nm' },
                'Motor Required Peak Torque': { type: 'torque', component: 'motor', defaultUnit: 'Nm' },
                'Motor Required Power': { type: 'power', component: 'motor', defaultUnit: 'kW' },
                'Gearbox Required Torque': { type: 'torque', component: 'gearbox', defaultUnit: 'Nm' },
                'Gearbox Required Peak Torque': { type: 'torque', component: 'gearbox', defaultUnit: 'Nm' },
                'Gearbox Required Power': { type: 'power', component: 'gearbox', defaultUnit: 'kW' }
            },
            'Rotarytable': {
                'Motor Power Required': { type: 'power', component: 'motor', defaultUnit: 'kW' },
                'Torque Required': { type: 'torque', component: 'motor', defaultUnit: 'Nm' }
            }
        };
        
        // Check if this result key has a unit mapping
        const appMappings = resultUnitMappings[currentApp];
        const baseKey = key.replace(/\s*\([^)]+\)$/, ''); // Remove unit suffix
        const unitMapping = appMappings?.[baseKey];
        
        if (unitMapping && !isNaN(numericValue)) {
            // Extract current unit from the key or use default
            const unitMatch = key.match(/\(([^)]+)\)$/);
            const currentUnit = unitMatch ? unitMatch[1] : unitMapping.defaultUnit;
            
            // Get available units for this type
            const availableUnits = getAvailableUnits(unitMapping.type);
            const dropdownOptions = availableUnits.map(unit => 
                `<option value="${unit}" ${unit === currentUnit ? 'selected' : ''}>${unit}</option>`
            ).join('');
            
            valueDisplayHtml = `
                <div style="display: flex; align-items: center; gap: 8px;">
                    <span style="min-width: 60px;">${numericValue.toFixed(3)}</span>
                    <select onchange="updateInlineResultUnit('${baseKey}', '${unitMapping.component}', '${unitMapping.type}', this.value)" 
                            style="font-size: 12px; padding: 2px; border: 1px solid #ccc; border-radius: 3px;">
                        ${dropdownOptions}
                    </select>
                </div>
            `;
        }

        html += `<tr>
            <td style="padding:4px;">${key}</td>
            <td style="padding:4px;">${valueDisplayHtml}</td>
            <td style="padding:4px;">${adjustmentHtml}</td>
            <td style="padding:4px;">${statusHtml}</td>
        </tr>`;
        idx++;
    }
    html += "</tbody></table>";
    resultsDiv.innerHTML = html;
    previousOutputs = { ...currentOutputs };
    
    // Show sizing suggestions after calculations are completed
    const currentApp = document.getElementById("application")?.value;
    if (currentApp) {
        showSizingSuggestions(currentApp);
    }
}

// Function to handle inline result unit changes
function updateInlineResultUnit(resultKey, componentType, unitType, newUnit) {
    // Store the selected unit for this result type globally
    // This allows all applications to remember unit preferences
    if (!window.selectedResultUnits) {
        window.selectedResultUnits = {};
    }
    window.selectedResultUnits[unitType] = newUnit;
    
    // Update the corresponding unit control if it exists (for backward compatibility)
    const currentApp = document.getElementById("application")?.value;
    
    if (currentApp === 'blower') {
        if (unitType === 'power') {
            const powerSelect = document.getElementById("blowerPowerUnit");
            if (powerSelect) powerSelect.value = newUnit;
        } else if (unitType === 'torque') {
            const torqueSelect = document.getElementById("blowerTorqueUnit");
            if (torqueSelect) torqueSelect.value = newUnit;
        }
    }
    
    // Trigger recalculation to update all results with new units
    calculateForApplication();
}