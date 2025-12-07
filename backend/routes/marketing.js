const express = require('express');
const router = express.Router();
const MarketingController = require('../controllers/MarketingController');
const auth = require('../middleware/auth');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Multer configuration
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const type = req.body.type;
        const dir = `uploads/marketing/${type}`;
        
        // Create directory if it doesn't exist
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        
        cb(null, dir);
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname);
    }
});

const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
        cb(null, true);
    } else {
        cb(new Error('Not an image! Please upload only images.'), false);
    }
};

const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB limit
    }
});

// Protect all routes
router.use(auth);

// Marker routes
router.get('/markers', MarketingController.getMarkers);
router.get('/markers/:id', MarketingController.getMarkerById);
router.post('/markers', upload.single('image'), MarketingController.createMarker);
router.put('/markers/:id', upload.single('image'), MarketingController.updateMarker);
router.delete('/markers/:id', MarketingController.deleteMarker);

// District routes
router.get('/districts', MarketingController.getDistricts);

// Statistics routes
router.get('/statistics', MarketingController.getStatistics);

module.exports = router; 