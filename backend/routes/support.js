const express = require('express');
const router = express.Router();
const SupportTicket = require('../models/SupportTicket');
const auth = require('../middleware/authMiddleware');
const adminAuth = require('../middleware/adminMiddleware');

// Kullanıcı destek talebi oluşturma
router.post('/support-tickets', auth, async (req, res) => {
  try {
    const { category, orderId, message, priority } = req.body;
    
    if (!category || !message) {
      return res.status(400).json({ 
        message: 'Kategori ve mesaj alanları zorunludur' 
      });
    }

    const ticket = new SupportTicket({
      user: req.user._id,
      category,
      orderId: orderId || undefined,
      message,
      priority: priority || 'normal'
    });

    await ticket.save();

    // Populate user bilgilerini ekleyelim
    await ticket.populate('user', 'username email firstName lastName');

    res.status(201).json(ticket);
  } catch (error) {
    console.error('Support ticket creation error:', error);
    res.status(500).json({ 
      message: 'Destek talebi oluşturulurken bir hata oluştu',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Kullanıcının kendi destek taleplerini görüntüleme
router.get('/support-tickets/my', auth, async (req, res) => {
  try {
    const tickets = await SupportTicket.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .populate('user', 'username email firstName lastName');
    
    res.json(tickets);
  } catch (error) {
    console.error('Support tickets fetch error:', error);
    res.status(500).json({ 
      message: 'Destek talepleri yüklenirken bir hata oluştu' 
    });
  }
});

// Admin: Tüm destek taleplerini görüntüleme
router.get('/admin/support-tickets', adminAuth, async (req, res) => {
  try {
    const tickets = await SupportTicket.find()
      .sort({ createdAt: -1 })
      .populate('user', 'username email firstName lastName');
    
    if (!tickets) {
      return res.status(404).json({ message: 'Destek talebi bulunamadı' });
    }
    
    res.json(tickets);
  } catch (error) {
    console.error('Admin support tickets fetch error:', error);
    res.status(500).json({ 
      message: 'Destek talepleri yüklenirken bir hata oluştu',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Admin: Destek talebini güncelleme
router.patch('/admin/support-tickets/:id', adminAuth, async (req, res) => {
  try {
    const { status, adminNotes, adminResponse } = req.body;
    
    const ticket = await SupportTicket.findByIdAndUpdate(
      req.params.id,
      { 
        status, 
        adminNotes, 
        adminResponse,
        updatedAt: Date.now()
      },
      { new: true }
    ).populate('user', 'username email firstName lastName');

    if (!ticket) {
      return res.status(404).json({ message: 'Destek talebi bulunamadı' });
    }

    res.json(ticket);
  } catch (error) {
    console.error('Support ticket update error:', error);
    res.status(500).json({ 
      message: 'Destek talebi güncellenirken bir hata oluştu',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

module.exports = router; 