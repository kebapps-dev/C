function findClosestSpindleMotor() {
  const resultsDiv = document.getElementById("results");
  const spindleResults = sizeSpindleMotor(
    {
        
      }

  );

    resultsDiv.innerHTML = `
      <p><strong>
        Fan Power: ${spindleResults.fanPowerWatts} <br>
        Motor Power: ${spindleResults.motorPowerWatts}, ${spindleResults.motorPowerHP} <br>
        Torque Required: ${spindleResults.torqueNm} <br>
      </strong></p>`;
}