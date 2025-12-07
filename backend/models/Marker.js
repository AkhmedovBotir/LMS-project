const mongoose = require('mongoose');

const markerSchema = new mongoose.Schema({
    type: {
        type: String,
        enum: ['banner', 'reklama', 'hamkor'],
        required: true
    },
    title: {
        type: String,
        required: function() {
            return this.type === 'banner';
        }
    },
    address: {
        type: String,
        required: true
    },
    location: {
        type: {
            type: String,
            enum: ['Point'],
            default: 'Point'
        },
        coordinates: {
            type: [Number],
            required: true,
            validate: {
                validator: function(v) {
                    return v.length === 2 && 
                           v[0] >= -180 && v[0] <= 180 && // longitude
                           v[1] >= -90 && v[1] <= 90;     // latitude
                },
                message: 'Invalid coordinates. Longitude must be between -180 and 180, latitude between -90 and 90'
            }
        }
    },
    // Banner specific fields
    bannerName: {
        type: String,
        required: function() {
            return this.type === 'banner';
        }
    },
    bannerImage: {
        type: String,
        required: function() {
            return this.type === 'banner';
        }
    },
    bannerSize: {
        width: {
            type: Number,
            required: function() {
                return this.type === 'banner';
            }
        },
        height: {
            type: Number,
            required: function() {
                return this.type === 'banner';
            }
        }
    },
    // Reklama specific fields
    reklamaMavzusi: {
        type: String,
        required: function() {
            return this.type === 'reklama';
        }
    },
    joyNomi: {
        type: String,
        required: function() {
            return this.type === 'reklama';
        }
    },
    // Hamkor specific fields
    hamkorNomi: {
        type: String,
        required: function() {
            return this.type === 'hamkor';
        }
    },
    logo: {
        type: String,
        required: function() {
            return this.type === 'hamkor';
        }
    },
    // Common fields
    description: {
        type: String,
        required: true
    },
    status: {
        type: String,
        required: true,
        validate: {
            validator: function(v) {
                const validStatuses = {
                    banner: ['qo\'yilgan', 'olib_tashlangan', 'yangilangan'],
                    reklama: ['o\'rganilmoqda', 'tayyor', 'cancelled'],
                    hamkor: ['o\'rganilmoqda', 'hamkor_bo\'ldi', 'cancelled']
                };
                return validStatuses[this.type].includes(v);
            },
            message: props => `${props.value} is not a valid status for type ${this.type}`
        }
    }
}, {
    timestamps: true
});

// Create geospatial index
markerSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('Marker', markerSchema); 