export interface ExtractedOrderData {
  externalCompanyId: string; // The ID will map to the backend
  companyName: string;
  paymentMethod: 'Cash' | 'Visa';
  externalOrderId: string;
  customerPhone: string;
  items: Array<{ name: string; quantity: number; price: number }>;
  subtotal?: number;
  tax?: number;
  deliveryFee?: number;
  total: number;
}

export const mockExtractData = async (imageUri: string): Promise<ExtractedOrderData> => {
  // Simulate network delay for AI processing
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        externalCompanyId: '00000000-0000-0000-0000-000000000000', // Will be replaced in verification screen
        companyName: 'Burger Hub', // Updated to match the generated receipt
        paymentMethod: 'Visa', // Matches "Credit Card"
        externalOrderId: '#45892',
        customerPhone: '+966 501234567',
        items: [
          { name: 'Cheese Burger', quantity: 2, price: 45.00 },
          { name: 'French Fries', quantity: 1, price: 20.00 },
          { name: 'Cola', quantity: 1, price: 15.00 }
        ],
        subtotal: 125.00,
        tax: 18.75,
        deliveryFee: 6.25,
        total: 150.00
      });
    }, 2500); // 2.5 seconds delay
  });
};
