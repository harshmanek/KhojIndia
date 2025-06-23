import api from "./api";

export const paymentService = {
  // create payment
  // get payment details
  // verify payment
  async create(bookingId, amount) {
    try {
      const response = await api.post(
        `/payment/create/${bookingId}`,
        { amount },
        { withCredentials: true }
      );
      return response.data;
    } catch (error) {
      console.error("error in creating payment: ", error);
      throw error;
    }
  },
  async getPaymentDetails(paymentId) {
    try {
      const response = await api.get(`/payment/${paymentId}`, {
        withCredentials: true,
      });
      return response.data;
    } catch (error) {
      console.error("error in fetching payment details: ", error);
      throw error;
    }
  },
  async verifyPayment(
    paymentId,
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature
  ) {
    try {
      const response = await api.post(
        `/payment/verify/${paymentId}`,
        { razorpay_order_id, razorpay_payment_id, razorpay_signature },
        { withCredentials: true }
      );
      return response.data;
    } catch (error) {
      console.error("error in verifying payment: ", error);
      throw error;
    }
  },
};
