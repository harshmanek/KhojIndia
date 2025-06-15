import axios from "axios";

const API = axios.create({
    baseURL:process.env.REACT_APP_BACKEND_URL || 'http://localhost:5000/api'
});

export const createOrder = async(bookingId,amount) =>{
    try {
        const response = await API.post(`/payment/create/${bookingId}`,{amount});
        return response.data;
    } catch (error) {
        console.error('Error creating payment order:',error);
        throw error;
    }
};

export const verifyPayment = async(paymentId,razorpayResponse)=>{
    try {
        const response = await API.post(`/payment/verify/${paymentId}`,{
            razorpay_order_id:razorpayResponse.razorpay_order_id,
            razorpay_payment_id:razorpayResponse.razorpay_payment_id,
            razorpay_signature:razorpayResponse.razorpay_signature,
        });
        return response.data;
    } catch (error) {
        console.error('Error verifying payment:',error);
        throw error;
    }
};
export const getPaymentDetails = async(paymentId)=>{
    try {
        const response = await API.get(`/payment/${paymentId}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching payment details:',error);
        throw error;
    }
};