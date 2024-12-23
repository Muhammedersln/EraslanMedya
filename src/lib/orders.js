import { connectToDatabase } from '@/lib/db';

export async function updateOrderStatus(orderId, status, paymentDetails = null) {
  try {
    const { db } = await connectToDatabase();
    const orders = db.collection('orders');

    const updateData = {
      status: status,
      updatedAt: new Date()
    };

    if (paymentDetails) {
      updateData.paymentDetails = paymentDetails;
    }

    const result = await orders.updateOne(
      { _id: orderId },
      { $set: updateData }
    );

    if (result.modifiedCount === 0) {
      throw new Error('Order not found or not updated');
    }

    return { success: true };
  } catch (error) {
    console.error('Error updating order status:', error);
    throw error;
  }
} 