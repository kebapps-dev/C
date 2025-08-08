let productData = [];
let productData2 = [];

// Global variables for selected pump characteristics
let selectedPumpname = "";
let selectedPumpdisplacement = 0;
let selectedPumpefficiency = 1;

// Load CSV data on page load
Papa.parse("csv/pumps.csv", {
  download: true,
  header: true,
  complete: function(results) {
    productData = results.data;
    console.log("Pump product data loaded:", productData.length, "items");
  },
  error: function(error) {
    console.error("Error loading pumps.csv:", error);
  }
});

Papa.parse("csv/motors.csv", {
  download: true,
  header: true,
  complete: function(results) {
    productData2 = results.data;
    console.log("Motor product data loaded:", productData2.length, "items");
  },
  error: function(error) {
    console.error("Error loading motors.csv:", error);
  }
});

// Show/hide input groups based on application selected


// Find closest pump product based on flow input
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
  
  console.log("Input values:", { boreDiameter, rodDiameter, strokeLength, clampPressure, rpm, timeOfStroke });
  
  // Check if formulas object exists
  if (typeof formulas === 'undefined') {
    console.error("Formulas object not found");
    resultsDiv.innerHTML = "<p>Error: Formulas not loaded. Please check if formulas.js is loaded.</p>";
    return;
  }
  
  const clamparea = formulas.clamparea(boreDiameter, rodDiameter);
  const clampvolume = formulas.clampvolume(strokeLength, clamparea);
  const pumpflowrate = formulas.pumpflowrate(timeOfStroke, clampvolume);
  const pumpdisplacement = formulas.pumpdisplacement(pumpflowrate, rpm);
  const pumpclampingforce = formulas.pumpclampingforce(clampPressure, clamparea);
  
  console.log("Calculated values:", { clamparea, clampvolume, pumpflowrate, pumpdisplacement, pumpclampingforce });

  if (isNaN(pumpdisplacement)) {
    console.warn("Pump displacement is NaN, inputs may be invalid");
    resultsDiv.innerHTML = "<p>Please enter valid numbers for all pump inputs.</p>";
    return;
  }

  if (productData.length === 0) {
    console.warn("Product data not loaded");
    resultsDiv.innerHTML = "<p>Product data not loaded yet. Please wait or check if pumps.csv is available.</p>";
    return;
  }

  let closestProduct = null;
  let smallestDiff = Infinity;

  productData.forEach(product => {
    //if (product.Application === "Pump") {
      const productFlow = parseFloat(product["Specific volume Vth [cm3/U]"]);
      if (!isNaN(productFlow)) {
        const diff = Math.abs(productFlow - pumpdisplacement);
        if (diff < smallestDiff) {
          smallestDiff = diff;
          closestProduct = product;
        }
      }
    //}
  });

  

  if (closestProduct) {
    resultsDiv.innerHTML = `
      <p><strong>Closest Pump Product to displacement ${pumpdisplacement.toFixed(2)} cc/rev:</strong></p>
      <ul>
        <li><strong>Model:</strong> ${closestProduct.Pumpname}</li>
        <li><strong>Displacement Volume [ccm/rev]:</strong> ${closestProduct["Specific volume Vth [cm3/U]"]}</li>
        <li><strong>Efficiency</strong> ${closestProduct["Nhm[1]"]}</li>
      </ul>
    `;
    
} else {
    resultsDiv.innerHTML = "<p>No sufficient pump product available.</p>";
}
  selectedPumpname = closestProduct ? closestProduct.Pumpname : "Unknown";
  selectedPumpdisplacement = closestProduct ? closestProduct["Specific volume Vth [cm3/U]"] : "Unknown";
  selectedPumpefficiency = closestProduct ? closestProduct["Nhm[1]"] : "Unknown";
  findClosestMotor(); // Automatically find closest motor after pump selection
}

// Find closest motor product based on pump selection
function findClosestMotor() {
  const resultsDiv = document.getElementById("results2");
  
  console.log("findClosestMotor called");
  
  const clampPressureElement = document.getElementById("clampPressure");
  const safetyFactorElement = document.getElementById("safetyFactor");
  
  if (!clampPressureElement || !safetyFactorElement) {
    console.error("Missing elements for motor calculation");
    resultsDiv.innerHTML = "<p>Error: Missing input fields for motor calculation.</p>";
    return;
  }
  
  const clampPressure = getValueWithUnit ? (getValueWithUnit("clampPressure") || parseFloat(clampPressureElement.value)) : parseFloat(clampPressureElement.value);
  const safetyFactor = parseFloat(safetyFactorElement.value);
  
  // Use clampFlowRate if it exists, otherwise calculate from other inputs
  let clampFlowRate = 0;
  const clampFlowRateElement = document.getElementById("clampFlowRate");
  if (clampFlowRateElement) {
    clampFlowRate = getValueWithUnit ? (getValueWithUnit("clampFlowRate") || parseFloat(clampFlowRateElement.value)) : parseFloat(clampFlowRateElement.value);
  } else {
    // Calculate flow rate from stroke parameters
    const boreDiameter = getValueWithUnit ? (getValueWithUnit("boreDiameter") || parseFloat(document.getElementById("boreDiameter").value)) : parseFloat(document.getElementById("boreDiameter").value);
    const rodDiameter = getValueWithUnit ? (getValueWithUnit("rodDiameter") || parseFloat(document.getElementById("rodDiameter").value)) : parseFloat(document.getElementById("rodDiameter").value);
    const strokeLength = getValueWithUnit ? (getValueWithUnit("strokeLength") || parseFloat(document.getElementById("strokeLength").value)) : parseFloat(document.getElementById("strokeLength").value);
    const timeOfStroke = parseFloat(document.getElementById("timeOfStroke").value);
    
    const clamparea = formulas.clamparea(boreDiameter, rodDiameter);
    const clampvolume = formulas.clampvolume(strokeLength, clamparea);
    clampFlowRate = formulas.pumpflowrate(timeOfStroke, clampvolume);
  }
  
  const motortorque = safetyFactor * formulas.motortorque(selectedPumpdisplacement, clampPressure, selectedPumpefficiency);
  const motorspeed = safetyFactor * formulas.motorspeed(clampFlowRate, selectedPumpdisplacement, selectedPumpefficiency);

  console.log("Motor calculations:", { motortorque, motorspeed, selectedPumpdisplacement, selectedPumpefficiency });

  if (productData2.length === 0) {
    console.warn("Motor product data not loaded");
    resultsDiv.innerHTML = "<p>Motor product data not loaded yet. Please wait or check if motors.csv is available.</p>";
    return;
  }

  let closestProduct = null;
  let smallestDiff = Infinity;

    productData2.forEach(product => {
    if (product.Motorname.startsWith("V")) return; //dont include V motors
    const productMotortorque = parseFloat(product["Peak torque 20C [Nm]"]);
    const productMotorspeed = parseFloat(product["Nominal speed [rpm]"]);

    if (
        !isNaN(productMotortorque) &&
        !isNaN(productMotorspeed) &&
        productMotortorque >= motortorque &&
        productMotorspeed >= motorspeed
    ) {
        // You can base "closeness" on one of them, or both
        const diff = Math.abs(productMotortorque - motortorque); // only flow used

        if (diff < smallestDiff) {
        smallestDiff = diff;
        closestProduct = product;
        }
    }
    });


  if (closestProduct) {
    resultsDiv.innerHTML = `
      <p><strong>Closest Motor Product to required torque: ${motortorque.toFixed(2)} Nm <br/> 
      and required speed ${motorspeed.toFixed(2)} RPM: </strong></p>
      <ul>
        <li><strong>Model:</strong> ${closestProduct.Motorname}</li>
        <li><strong>Maximum Torque at 20C [Nm]:</strong> ${closestProduct["Peak torque 20C [Nm]"]}</li>
        <li><strong>Nominal Speed [rpm]</strong> ${closestProduct["Nominal speed [rpm]"]}</li>
      </ul>
    `;
} else {
    resultsDiv.innerHTML = "<p>No sufficient motor product available.</p>";
}
}
if (typeof fastMode !== 'undefined' && fastMode === "True") {
  findClosestPumpMotor();
}