import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { User, Election, Candidate, Aadhar } from '../models/models.js';

dotenv.config();

// User registration
export const register = async (req, res) => {
  const { aadharNo, password, role = 'user' } = req.body;  

  try {
    
    const aadhar = await Aadhar.findOne({ aadharNo });  
    if (!aadhar) {
      return res.status(400).json({ status: 'error', message: 'Aadhar number does not exist in the system' });
    }

    const existingUser = await User.findOne({ aadhar: aadhar._id }); 
    if (existingUser) {
      return res.status(400).json({ status: 'error', message: 'User already registered with this Aadhar number' });
    }

  
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const newUser = new User({
      aadhar: aadhar._id,  
      password: hashedPassword,
      role: role,  
      votedElections: []  
    });

    
    await newUser.save();

    
    res.status(201).json({ 
      status: 'success', 
      message: 'User registered successfully',
      user: { id: newUser._id, role: newUser.role }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: 'error', message: 'User registration failed', error: error.message });
  }
};

// User login
export const login = async (req, res) => {
  const { aadharNo, password } = req.body;

  try {
    
    const aadhar = await Aadhar.findOne({ aadharNo });
    if (!aadhar) {
      return res.status(400).json({ status: 'error', message: 'Aadhar number not found' });
    }

   
    const user = await User.findOne({ aadhar: aadhar._id });
    if (!user) {
      return res.status(400).json({ status: 'error', message: 'No user registered with this Aadhar number' });
    }

    
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ status: 'error', message: 'Invalid password' });
    }

   
    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET || '', { expiresIn: '1h' });

    
    res.status(200).json({
      status: 'success',
      message: 'Login successful',
      token,
      user: { id: user._id, aadharNo, role: user.role }
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ status: 'error', message: 'Login failed', error: error.message });
  }
};

// Create an election (admin)
export const createElection = async (req, res) => {
  const election = new Election(req.body);
  try {
    await election.save();
    res.status(201).json({ status: 'success', data: election });
  } catch (error) {
    res.status(500).json({ status: 'error', message: 'Failed to create election', error: error.message });
  }
};

export const voteCandidate = async (req, res) => {
  const { electionId, candidateId } = req.body;
  const userId = req.user.id;

  // Find the user
  const user = await User.findById(userId);
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  // Check if the user has already voted in this election
  if (user.votedElections.includes(electionId)) {
    return res.status(403).json({ message: "User has already voted in this election" });
  }

  // Proceed to vote for the candidate
  const candidate = await Candidate.findById(candidateId);
  if (!candidate) {
    return res.status(404).json({ message: "Candidate not found" });
  }

  // Update the candidate's vote count
  candidate.votes += 1;
  candidate.votedBy.push(userId);
  await candidate.save();

  // Record that the user has voted in this election
  user.votedElections.push(electionId);
  await user.save();

  res.status(200).json({ message: "Vote cast successfully" });
};


// Add a candidate to an election (admin)
export const addCandidate = async (req, res) => {
  const { electionId, candidateName } = req.body;
  const candidate = new Candidate({ name: candidateName });
  try {
    await candidate.save();
    await Election.findByIdAndUpdate(electionId, { $push: { candidates: candidate._id } });
    res.status(201).json({ status: 'success', data: candidate });
  } catch (error) {
    res.status(500).json({ status: 'error', message: 'Failed to add candidate', error: error.message });
  }
};

// End an election (admin)
export const endElection = async (req, res) => {
  try {
    const electionId = req.params.id;
    const updatedElection = await Election.findByIdAndUpdate(electionId, { isActive: false }, { new: true });
    if (!updatedElection) {
      return res.status(404).json({ status: 'error', message: 'Election not found' });
    }
    res.json({ status: 'success', message: 'Election ended successfully', data: updatedElection });
  } catch (error) {
    res.status(500).json({ status: 'error', message: 'An error occurred while ending the election', error: error.message });
  }
};

// Get election results
export const getResults = async (req, res) => {
  try {
    const elections = await Election.find().populate('candidates');
    res.json({ status: 'success', data: elections });
  } catch (error) {
    res.status(500).json({ status: 'error', message: 'An error occurred while fetching results', error: error.message });
  }
};

// Get all elections
export const getElections = async (req, res) => {
  try {
    const elections = await Election.find().populate('candidates');
    res.status(200).json({ status: 'success', data: elections });
  } catch (error) {
    res.status(500).json({ status: 'error', message: 'An error occurred while fetching elections', error: error.message });
  }
};
