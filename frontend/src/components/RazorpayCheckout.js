import React, { useEffect, useState } from "react";
import { createOrder, verifyPayment } from "../api/payment.api";

const RazorpayCheckout = ({ bookingId, amount, onSuccess, onFailure }) => {
  const [loading, setLoading] = useState(false);
  const [scriptLoaded, setScriptLoaded] = useState(false);

  // Function to load the razorpay script
  useEffect(() => {
    const loadScript = () => {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => setScriptLoaded(true);
      script.onerror = () => {
        console.error("Razorpay SDK failed to load");
        setScriptLoaded(false);
        onFailure("Razorpay SDK failed to load");
      };
      document.body.appendChild(script);
    };
    if (!window.Razorpay) {
      loadScript();
    } else {
      setScriptLoaded(true);
    }
  }, [onFailure]);

  const handlePayment= async()=>{
    if(!scriptLoaded||!bookingId||!amount){
        console.error("Razorpay script not loaded or missing bookingId/amount.");
        onFailure("Payment initiation failed. Please try again.");
        return;
    }

    setLoading(true);
    try{
        // 1. Call backend to create order
        const orderData = await createOrder(bookingId,amount);

        const options = {
            key:process.env.REACT_APP_RAZORPAY_KEY_ID,//Your Razorpay key id
            amount:orderData.amount,
            currency:orderData.currency,
            name:"KhojIndia",
            description:"Booking Payment",
            order_id:orderData.orderId,
            handler:async function (response){
                // 4. Handle success callback from Razorpay
                try{
                    const verificationResult
                     = await verifyPayment(orderData.paymentId,response);
                    if(verificationResult.payment){
                        onSuccess(verificationResult.payment);
                    }
                    else{
                        onFailure(verificationResult.message||'Payment verification failed');
                    }
                }
                catch(error){
                    console.error('Error during payment verification',error);
                    onFailure('Payment verification failed due to error.');
                }
            },prefill:{
                // Optionally prefill user details if you have them
                // name:"John Doe",
                // email:"john.doe@example.com",
                // contact:"9999999"
            },
            notes:{
                bookingId:bookingId,
                payment_id_internal:orderData.paymentId,
            },
            theme:{
                color:"#3399CC"
            }
        };

        const rzp = new window.Razorpay(options);
        rzp.on('payment.failed',function (response){
            // Handle  failure callback from Razorpay
            console.error('Payment failed:',response.error);
            onFailure(response.error.description||'Payment failed.');
        });
        rzp.open();
    }
    catch(error){
        console.error('Error initiating payment:',error);
        onFailure(error.message||'Failed to initiate Payment.');
    }
    finally{
        setLoading(false);
    }
  };
  return(
    <button onClick={handlePayment}disabled={loading||!scriptLoaded}>
        {loading?'Processing.....':'Pay with Razorpay'}
    </button>
  )
};
export default RazorpayCheckout;