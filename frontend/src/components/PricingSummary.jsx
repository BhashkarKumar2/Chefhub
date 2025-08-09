import React, { useMemo } from 'react';

const PricingSummary = ({ rate, guests, addOns }) => {
  const summary = useMemo(() => {
    const baseFee = rate * guests;
    const travelFee = 500;
    const decorFee = addOns.includes('Decor') ? 1000 : 0;
    const cleanupFee = addOns.includes('Cleanup') ? 500 : 0;
    const subtotal = baseFee + travelFee + decorFee + cleanupFee;
    const serviceCharge = subtotal * 0.1;
    const total = subtotal + serviceCharge;
    return { baseFee, travelFee, decorFee, cleanupFee, serviceCharge, total };
  }, [rate, guests, addOns]);

  return (
    <div className="bg-white p-4 rounded-2xl shadow-md">
      <h3 className="text-xl font-semibold mb-2">Pricing Summary</h3>
      <ul className="space-y-1">
        <li>Base Fee ({guests}×₹{rate}): ₹{summary.baseFee}</li>
        <li>Travel Fee: ₹{summary.travelFee}</li>
        {summary.decorFee > 0 && <li>Decor: ₹{summary.decorFee}</li>}
        {summary.cleanupFee > 0 && <li>Cleanup: ₹{summary.cleanupFee}</li>}
        <li>Service Charge (10%): ₹{summary.serviceCharge.toFixed(2)}</li>
      </ul>
      <div className="mt-3 text-lg font-bold">Total: ₹{summary.total.toFixed(2)}</div>
    </div>
  );
};

export default PricingSummary;