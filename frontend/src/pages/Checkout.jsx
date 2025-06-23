import React from "react";
import RazorpayCheckout from "../components/RazorpayCheckout";
const Checkout = (data) => {
  const bookingId = "1739674f-79bf-42fa-a793-15e53e17d81a";
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
