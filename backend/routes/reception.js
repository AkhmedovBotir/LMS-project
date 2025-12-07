const express = require('express');
const router = express.Router();
const receptionController = require('../controllers/ReceptionController');

// Mehmonlar bilan ishlash
router.post('/', receptionController.createReception);
router.get('/', receptionController.getAllReceptions);
router.get('/:id', receptionController.getReceptionById);
router.put('/:id', receptionController.updateReception);
router.delete('/:id', receptionController.deleteReception);

// Aloqa qilish
router.patch('/:id/contact', receptionController.contactReception);

// Sinovga qo'shish
router.patch('/:id/trial', receptionController.addToTrial);

// O'quvchiga aylantirish va guruhga qo'shish
router.post('/:id/convert-to-student', receptionController.convertToStudent);

module.exports = router; 