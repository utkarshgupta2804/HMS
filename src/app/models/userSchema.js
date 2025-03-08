import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email'],
  },
  phone: {
    type: String,
    trim: true,
  },
  dateOfBirth: {
    type: Date,
    required: [true, 'Date of birth is required'],
  },
  gender: {
    type: String,
    required: [true, 'Gender is required'],
    enum: ['Male', 'Female', 'Other'],
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters long'],
    select: false // This line ensures password isn't returned by default
  },
  role: {
    type: String,
    default: 'patient',
    enum: ['patient', 'doctor', 'admin', 'superadmin'],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
}, {
  timestamps: true,
});

// Hash password before saving
userSchema.pre('save', async function(next) {
    if (!this.isModified('password')) return next();
    
    try {
        // Always use the same salt rounds for consistency
        const hash = await bcrypt.hash(this.password, 10);
        this.password = hash;
        next();
    } catch (error) {
        next(error);
    }
});

userSchema.methods.comparePassword = async function(candidatePassword) {
    try {
        // For debugging
        console.log('Comparing passwords:');
        console.log('Candidate:', candidatePassword);
        console.log('Stored:', this.password);
        
        if (!candidatePassword || !this.password) {
            console.log('Missing password data');
            return false;
        }

        const isMatch = await bcrypt.compare(candidatePassword, this.password);
        console.log('Password match:', isMatch);
        return isMatch;
    } catch (error) {
        console.error('Password comparison error:', error);
        return false;
    }
};

const User = mongoose.models.User || mongoose.model('User', userSchema);

export default User;
