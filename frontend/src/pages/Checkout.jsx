import React from "react";
import RazorpayCheckout from "../components/RazorpayCheckout";
const Checkout = (data) => {
  const bookingId = "97116fc4-7967-4b65-8c44-1549d0b29fa8";
  const amount = 10000;

  const handleSuccess = (data) => {
    alert("Payment and verification complete");
    console.log("Payment verified", data);
  };

  return (
    <div>
      <h2>Checkout</h2>
      <RazorpayCheckout
        bookingId={bookingId}
        amount={amount}
        onSuccess={handleSuccess}
      />
    </div>
  );
};

export default Checkout;
