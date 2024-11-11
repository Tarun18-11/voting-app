import mongoose from 'mongoose';

// Candidate Schema
const candidateSchema = new mongoose.Schema({
  name: { type: String, required: true },
  votes: { type: Number, default: 0 },
  votedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
});

// Election Schema
const electionSchema = new mongoose.Schema({
  name: { type: String, required: true },
  candidates: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Candidate' }],
  isActive: { type: Boolean, default: true }, 
});

const aadharSchema = new mongoose.Schema({
  aadharNo: { 
    type: String,  // Store Aadhar number as String to preserve leading zeros
    required: true, 
    unique: true, 
    minlength: 12,  // Minimum length of Aadhar number (12 digits)
    maxlength: 12,  // Maximum length of Aadhar number (12 digits)
    validate: {
      validator: (v) => /^[0-9]{12}$/.test(v),  // Regex to check for exactly 12 digits
      message: 'Invalid Aadhar Number format'
    }
  },
  isValid: { type: Boolean, default: true } 
}, { timestamps: true });

const userSchema = new mongoose.Schema({
  aadhar: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Aadhar',
    required: true 
  },
  password: { type: String, required: true },  
  role: { type: String, enum: ['user', 'admin'], default: 'user' }, 
  votedElections: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Election' }]  
});

export const Candidate = mongoose.model('Candidate', candidateSchema);
export const Election = mongoose.model('Election', electionSchema);
export const User = mongoose.model('User', userSchema);
export const Aadhar = mongoose.model('Aadhar', aadharSchema);
