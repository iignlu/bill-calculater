document.getElementById("calcBtn").addEventListener("click", () => {
  // --- INPUTS ---
  const inputs = {
    E_kWh: parseFloat(document.getElementById("D5").value) || 0,
    PF_old: parseFloat(document.getElementById("D6").value) || 0,
    PF_new: parseFloat(document.getElementById("D7").value) || 0,
    THDi_old: parseFloat(document.getElementById("D8").value) || 0,
    THDi_new: parseFloat(document.getElementById("D9").value) || 0,
    EnergyRate: parseFloat(document.getElementById("D10").value) || 0,
    PenaltyRate: parseFloat(document.getElementById("D11").value) || 0,
    AllowedReactiveRatio: parseFloat(document.getElementById("D12").value) || 0,
    DemandBilledInKVA: parseFloat(document.getElementById("D13").value) || 0,
    DemandRate: parseFloat(document.getElementById("D14").value) || 0,
    Peak_kW: parseFloat(document.getElementById("D15").value) || 0,
    Bank_kVAr_avg: parseFloat(document.getElementById("D16").value) || 0,
    Bank_loss_W_per_kVAr: parseFloat(document.getElementById("D17").value) || 0,
    SAPF_loss_kW: parseFloat(document.getElementById("D18").value) || 0,
    BaseLossFrac: parseFloat(document.getElementById("D19").value) || 0,
    Hours: parseFloat(document.getElementById("D20").value) || 0,
    CAPEX: parseFloat(document.getElementById("D21").value) || 0,
  };

  // --- CALCULATIONS ---
  const Reactive_kVArh_old = inputs.E_kWh * Math.tan(Math.acos(inputs.PF_old));
  const Reactive_kVArh_new = inputs.E_kWh * Math.tan(Math.acos(inputs.PF_new));
  const Allowed_kVArh = inputs.E_kWh * inputs.AllowedReactiveRatio;
  const Excess_kVArh_old = Math.max(0, Reactive_kVArh_old - Allowed_kVArh);
  const Excess_kVArh_new = Math.max(0, Reactive_kVArh_new - Allowed_kVArh);
  const Penalty_old_SAR = inputs.PenaltyRate * Excess_kVArh_old;
  const Penalty_new_SAR = inputs.PenaltyRate * Excess_kVArh_new;
  const Penalty_savings_SAR = Penalty_old_SAR - Penalty_new_SAR;
  const CurrentFactor_old = Math.sqrt(1 + inputs.THDi_old ** 2) / inputs.PF_old;
  const CurrentFactor_new = Math.sqrt(1 + inputs.THDi_new ** 2) / inputs.PF_new;
  const LossRatio = (CurrentFactor_new / CurrentFactor_old) ** 2;
  const kWh_saved_copper = inputs.E_kWh * inputs.BaseLossFrac * (1 - LossRatio);
  const Bank_losses_kWh =
    (inputs.Bank_kVAr_avg * inputs.Bank_loss_W_per_kVAr * inputs.Hours) / 1000;
  const SAPF_losses_kWh = inputs.SAPF_loss_kW * inputs.Hours;
  const kWh_saved_net = kWh_saved_copper - Bank_losses_kWh - SAPF_losses_kWh;
  const Energy_savings_SAR = inputs.EnergyRate * kWh_saved_net;
  const PF_true_old = inputs.PF_old / Math.sqrt(1 + inputs.THDi_old ** 2);
  const PF_true_new = inputs.PF_new / Math.sqrt(1 + inputs.THDi_new ** 2);
  const S_old_kVA =
    inputs.DemandBilledInKVA === 1 ? inputs.Peak_kW / PF_true_old : 0;
  const S_new_kVA =
    inputs.DemandBilledInKVA === 1 ? inputs.Peak_kW / PF_true_new : 0;
  const Demand_savings_SAR = (S_old_kVA - S_new_kVA) * inputs.DemandRate;
  const Total_monthly_savings_SAR =
    Penalty_savings_SAR + Energy_savings_SAR + Demand_savings_SAR;
  const Simple_payback_years =
    Total_monthly_savings_SAR > 0
      ? inputs.CAPEX / (12 * Total_monthly_savings_SAR)
      : "";

  // --- UPDATED OUTPUT LABELS ---
  const outputs = [
    ["Reactive Energy (Old)", Reactive_kVArh_old],
    ["Reactive Energy (New)", Reactive_kVArh_new],
    ["Allowed Reactive Energy", Allowed_kVArh],
    ["Excess Reactive Energy (Old)", Excess_kVArh_old],
    ["Excess Reactive Energy (New)", Excess_kVArh_new],
    ["Penalty Cost (Old)", Penalty_old_SAR],
    ["Penalty Cost (New)", Penalty_new_SAR],
    ["Penalty Savings", Penalty_savings_SAR],
    ["Current Factor (Old)", CurrentFactor_old],
    ["Current Factor (New)", CurrentFactor_new],
    ["Loss Ratio", LossRatio],
    ["Copper Losses Saved (kWh)", kWh_saved_copper],
    ["Capacitor Bank Losses (kWh)", Bank_losses_kWh],
    ["Active Power Filter Losses (kWh)", SAPF_losses_kWh],
    ["Net Energy Saved (kWh)", kWh_saved_net],
    ["Energy Savings (SAR)", Energy_savings_SAR],
    ["True Power Factor (Old)", PF_true_old],
    ["True Power Factor (New)", PF_true_new],
    ["Apparent Power (Old)", S_old_kVA],
    ["Apparent Power (New)", S_new_kVA],
    ["Demand Savings (SAR)", Demand_savings_SAR],
    ["Total Monthly Savings (SAR)", Total_monthly_savings_SAR],
    ["Simple Payback Period (Years)", Simple_payback_years],
  ];

  // --- DISPLAY OUTPUTS ---
  const resultsDiv = document.getElementById("results");
  resultsDiv.innerHTML = "";

  outputs.forEach(([label, value]) => {
    const div = document.createElement("div");
    div.className = "result-item";
    div.innerHTML = `
      <strong>${label}</strong>
      <div class="result-value">${value === "" ? "—" : value.toFixed(3)}</div>
    `;
    resultsDiv.appendChild(div);
  });
});
