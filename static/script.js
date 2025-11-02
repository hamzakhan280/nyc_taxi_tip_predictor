document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("taxiForm");
  const inputs = form.querySelectorAll("input");

  form.addEventListener("submit", () => {
    const btn = form.querySelector("button");
    btn.innerText = "Predicting...";
    btn.disabled = true;
  });

  // Automatically calculate total when values change
  const autoSum = () => {
    const fare = parseFloat(form.fare_amount.value) || 0;
    const extra = parseFloat(form.extra.value) || 0;
    const mta = parseFloat(form.mta_tax.value) || 0;
    const tolls = parseFloat(form.tolls_amount.value) || 0;
    const imp = parseFloat(form.improvement_surcharge.value) || 0;
    const cong = parseFloat(form.congestion_surcharge.value) || 0;
    const airport = parseFloat(form.airport_fee.value) || 0;

    const total = (fare + extra + mta + tolls + imp + cong + airport).toFixed(2);
    form.dataset.total = total; // store total in dataset (for debugging)
  };

  inputs.forEach(input => input.addEventListener("input", autoSum));
});
