import React from "react";
import { paymentService } from "../services/paymentService";
const RazorpayCheckout = ({ bookingId, amount, onSuccess }) => {
  const handlePayment = async () => {
    try {
      // 1. create the payment order on backend
      const data = await paymentService.create(bookingId, amount);

      // 2. Open Razorpay checkout
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: data.amount,
        currency: data.currency,
        order_id: data.orderId,
        handler: async function (response) {
          // 3. verify the payment
          const verifyRes = await paymentService.verifyPayment(
            data.paymentId,
            response.razorpay_order_id,
            response.razorpay_payment_id,
            response.razorpay_signature
          );
          if (verifyRes.success) {
            alert("Payment successfull and verified");
            if (onSuccess) onSuccess(verifyRes);
          } else {
            alert("Payment verification failed");
          }
        },
      };
      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (error) {
      alert("Error: " + (error.response?.data?.message || error.message));
    }
  };
  return <button onClick={handlePayment}>Pay with Razorpay</button>;
};

export default RazorpayCheckout;
