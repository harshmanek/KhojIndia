import React from "react";
import RazorpayCheckout from "../components/RazorpayCheckout";
const Checkout = (data) => {
  const bookingId = "9e817744-dfa7-4807-8b09-5741bb046615";
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
