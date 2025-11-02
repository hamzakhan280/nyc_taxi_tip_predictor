function calcTotal() {
  const fare = parseFloat(document.getElementById("fare_amount").value) || 0;
  const tolls = parseFloat(document.getElementById("tolls_amount").value) || 0;
  const congestion = parseFloat(document.getElementById("congestion_surcharge").value) || 0;
  const airport = parseFloat(document.getElementById("airport_fee").value) || 0;
  const total = fare + tolls + congestion + airport;
  document.getElementById("total_amount").value = total.toFixed(2);
}

["fare_amount", "tolls_amount", "congestion_surcharge", "airport_fee"].forEach(id => {
  document.getElementById(id).addEventListener("input", calcTotal);
  document.getElementById(id).addEventListener("change", calcTotal);
});
