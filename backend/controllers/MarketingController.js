const Marker = require('../models/Marker');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configure multer for file uploads
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

// Get all markers with filters
exports.getMarkers = async (req, res) => {
    try {
        const { type, status, district } = req.query;
        const query = {};

        if (type) query.type = type;
        if (status) query.status = status;
        if (district) query.district = district;

        const markers = await Marker.find(query);
        res.json({
            success: true,
            data: markers
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Markerlarni olishda xatolik yuz berdi'
        });
    }
};

// Get single marker by ID
exports.getMarkerById = async (req, res) => {
    try {
        const marker = await Marker.findById(req.params.id);
        if (!marker) {
            return res.status(404).json({
                success: false,
                message: 'Marker topilmadi'
            });
        }
        res.json({
            success: true,
            data: marker
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Markerni olishda xatolik yuz berdi'
        });
    }
};

// Create new marker
exports.createMarker = async (req, res) => {
    try {
        const markerData = req.body;
        
        // Validate required fields based on type
        if (!markerData.type) {
            return res.status(400).json({
                success: false,
                message: 'Marker type is required'
            });
        }

        // Handle file upload for banner or logo
        if (req.file) {
            if (markerData.type === 'banner') {
                markerData.bannerImage = req.file.path;
            } else if (markerData.type === 'hamkor') {
                markerData.logo = req.file.path;
            }
        } else if (markerData.type === 'banner' || markerData.type === 'hamkor') {
            return res.status(400).json({
                success: false,
                message: 'Image is required for banner and hamkor types'
            });
        }

        // Validate location coordinates
        if (!markerData.lat || !markerData.lng) {
            return res.status(400).json({
                success: false,
                message: 'Location coordinates (lat, lng) are required'
            });
        }

        // Convert lat/lng to GeoJSON Point
        const lat = parseFloat(markerData.lat);
        const lng = parseFloat(markerData.lng);

        // Validate coordinates
        if (isNaN(lat) || isNaN(lng) || 
            lat < -90 || lat > 90 || 
            lng < -180 || lng > 180) {
            return res.status(400).json({
                success: false,
                message: 'Invalid coordinates. Longitude must be between -180 and 180, latitude between -90 and 90'
            });
        }

        markerData.location = {
            type: 'Point',
            coordinates: [lng, lat] // MongoDB GeoJSON uses [longitude, latitude]
        };

        // Remove lat/lng from markerData
        delete markerData.lat;
        delete markerData.lng;

        const marker = await Marker.create(markerData);
        res.status(201).json({
            success: true,
            message: 'Marker muvaffaqiyatli yaratildi',
            data: marker
        });
    } catch (error) {
        // Delete uploaded file if marker creation fails
        if (req.file) {
            fs.unlinkSync(req.file.path);
        }

        // Handle validation errors
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(err => err.message);
            return res.status(400).json({
                success: false,
                message: 'Validation error',
                errors: messages
            });
        }

        console.error('Create marker error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Markerni yaratishda xatolik yuz berdi'
        });
    }
};

// Update marker
exports.updateMarker = async (req, res) => {
    try {
        const markerData = req.body;
        const oldMarker = await Marker.findById(req.params.id);
        
        if (!oldMarker) {
            // Delete uploaded file if marker not found
            if (req.file) {
                fs.unlinkSync(req.file.path);
            }
            return res.status(404).json({
                success: false,
                message: 'Marker topilmadi'
            });
        }

        // Handle file upload for banner or logo
        if (req.file) {
            // Delete old file if exists
            if (oldMarker.bannerImage) {
                fs.unlinkSync(oldMarker.bannerImage);
            }
            if (oldMarker.logo) {
                fs.unlinkSync(oldMarker.logo);
            }

            if (markerData.type === 'banner') {
                markerData.bannerImage = req.file.path;
            } else if (markerData.type === 'hamkor') {
                markerData.logo = req.file.path;
            }
        }

        const marker = await Marker.findByIdAndUpdate(
            req.params.id,
            markerData,
            { new: true, runValidators: true }
        );

        res.json({
            success: true,
            message: 'Marker muvaffaqiyatli yangilandi',
            data: marker
        });
    } catch (error) {
        // Delete uploaded file if update fails
        if (req.file) {
            fs.unlinkSync(req.file.path);
        }
        res.status(500).json({
            success: false,
            message: 'Markerni yangilashda xatolik yuz berdi'
        });
    }
};

// Delete marker
exports.deleteMarker = async (req, res) => {
    try {
        const marker = await Marker.findByIdAndDelete(req.params.id);
        
        if (!marker) {
            return res.status(404).json({
                success: false,
                message: 'Marker topilmadi'
            });
        }

        // Delete associated files
        if (marker.bannerImage) {
            fs.unlinkSync(marker.bannerImage);
        }
        if (marker.logo) {
            fs.unlinkSync(marker.logo);
        }

        res.json({
            success: true,
            message: 'Marker muvaffaqiyatli o\'chirildi'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Markerni o\'chirishda xatolik yuz berdi'
        });
    }
};

// Get districts list
exports.getDistricts = async (req, res) => {
    try {
        const districts = [
            'Andijon shahri',
            'Andijon tumani',
            'Asaka tumani',
            'Baliqchi tumani',
            'Bo\'z tumani',
            'Buloqboshi tumani',
            'Izboskan tumani',
            'Jalaquduq tumani',
            'Marhamat tumani',
            'Oltinko\'l tumani',
            'Paxtaobod tumani',
            'Qo\'rg\'ontepa tumani',
            'Shahrixon tumani',
            'Ulug\'nor tumani',
            'Xo\'jaobod tumani'
        ];

        res.json({
            success: true,
            data: districts
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Tumanlar ro\'yxatini olishda xatolik yuz berdi'
        });
    }
};

// Get marketing statistics
exports.getStatistics = async (req, res) => {
    try {
        const stats = await Marker.aggregate([
            {
                $group: {
                    _id: {
                        type: '$type',
                        status: '$status'
                    },
                    count: { $sum: 1 }
                }
            },
            {
                $group: {
                    _id: '$_id.type',
                    statuses: {
                        $push: {
                            status: '$_id.status',
                            count: '$count'
                        }
                    },
                    total: { $sum: '$count' }
                }
            }
        ]);

        const districtStats = await Marker.aggregate([
            {
                $group: {
                    _id: '$district',
                    count: { $sum: 1 }
                }
            }
        ]);

        res.json({
            success: true,
            data: {
                by_type: stats,
                by_district: districtStats
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Statistikani olishda xatolik yuz berdi'
        });
    }
}; 