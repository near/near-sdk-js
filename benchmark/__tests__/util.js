export function formatGas(gas) {
  if (gas < 10 ** 12) {
    let tGas = gas / 10 ** 12;
    let roundTGas = Math.round(tGas * 100000) / 100000;
    return roundTGas + "T";
  }
  let tGas = gas / 10 ** 12;
  let roundTGas = Math.round(tGas * 100) / 100;
  return roundTGas + "T";
}

export function gasBreakdown(outcome) {
  return new Map(
    outcome.metadata.gas_profile.map((g) => {
      return [g.cost, Number(g.gas_used)];
    })
  );
}

export function logGasBreakdown(map, t) {
  map.forEach((v, k) => {
    t.log("  ", k, ": ", formatGas(v));
  });
}

export function logGasDetail(r, t) {
  t.log(
    "Gas used to convert transaction to receipt: ",
    formatGas(r.result.transaction_outcome.outcome.gas_burnt)
  );
  t.log(
    "Gas used to execute the receipt (actual contract call): ",
    formatGas(r.result.receipts_outcome[0].outcome.gas_burnt)
  );
  let map = gasBreakdown(r.result.receipts_outcome[0].outcome);
  logGasBreakdown(map, t);
  t.log(
    "Gas used to refund unused gas: ",
    // TODO: fix after near-workspaces is updated
    formatGas(r.result.receipts_outcome[1]?.outcome.gas_burnt || 0)
  );
  t.log(
    "Total gas used: ",
    formatGas(
      r.result.transaction_outcome.outcome.gas_burnt +
        r.result.receipts_outcome[0].outcome.gas_burnt +
        // TODO: fix after near-workspaces is updated
        (r.result.receipts_outcome[1]?.outcome.gas_burnt || 0)
    )
  );
}
