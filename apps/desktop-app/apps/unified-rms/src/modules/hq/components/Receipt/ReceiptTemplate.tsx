import React from 'react';

export interface ReceiptProps {
 orderNumber: string;
 customerName: string;
 itemsSummary: string;
 totalAmount: number;
 deliveryCost: number;
 orderType: string;
 externalCompanyName?: string;
 externalOrderId?: string;
}

export const ReceiptTemplate: React.FC<ReceiptProps> = ({
 orderNumber,
 customerName,
 itemsSummary,
 totalAmount,
 deliveryCost,
 orderType,
 externalCompanyName,
 externalOrderId
}) => {
 return (
 <div className="receipt p-4 max-w-xs mx-auto border-carbon-border font-mono text-sm bg-carbon-layer text-black">
 <div className="text-center font-bold text-lg mb-2">FoodRMS Receipt</div>
 <div className="text-center mb-4">Order {orderNumber}</div>
 
 <div className="mb-2">
 <div><strong>Type:</strong> {orderType}</div>
 <div><strong>Customer:</strong> {customerName}</div>
 </div>

 {externalCompanyName && (
 <div className="mb-2 p-1 border-solid border-gray-400">
 <div><strong>App:</strong> {externalCompanyName}</div>
 {externalOrderId && <div><strong>Ext ID:</strong> {externalOrderId}</div>}
 </div>
 )}

 <div className="border-t-2 border-carbon-border py-2 my-2">
 <div className="font-bold mb-1">Items:</div>
 <div className="whitespace-pre-line">{itemsSummary.split(', ').join('\n')}</div>
 </div>

 <div className="border-t-2 border-carbon-border pt-2">
 <div className="flex justify-between">
 <span>Delivery:</span>
 <span>{deliveryCost} SAR</span>
 </div>
 <div className="flex justify-between font-bold text-base mt-2">
 <span>Total:</span>
 <span>{totalAmount} SAR</span>
 </div>
 </div>
 
 <div className="text-center mt-6 text-xs">
 Thank you!
 </div>
 </div>
 );
};
