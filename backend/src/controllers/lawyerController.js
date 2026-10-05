const Lawyer = require('../models/Lawyer');
const Review = require('../models/Review');
const User = require('../models/User');

// Create or update lawyer profile details
const updateLawyerProfile = async (req, res, next) => {
  try {
    let lawyer = await Lawyer.findOne({ userId: req.user._id });
    const payload = {
      ...req.body,
      userId: req.user._id,
      fullName: req.user.name,
      profileImage: req.user.profileImage || ''
    };

    if (lawyer) {
      lawyer = await Lawyer.findOneAndUpdate({ userId: req.user._id }, payload, { new: true });
    } else {
      lawyer = await Lawyer.create(payload);
    }
    
    res.json({ success: true, message: 'Lawyer profile updated successfully', data: lawyer });
  } catch (error) {
    next(error);
  }
};

// Retrieve all verified lawyers (or pending for admin access)
const getLawyers = async (req, res, next) => {
  try {
    const query = { verificationStatus: 'Verified' };
    
    // If requesting user is Admin, allow viewing all statuses
    if (req.user && req.user.role === 'Admin' && req.query.all) {
      delete query.verificationStatus;
    }
    
    const lawyers = await Lawyer.find(query).populate('userId', 'name email phone location');
    res.json({ success: true, data: lawyers });
  } catch (error) {
    next(error);
  }
};

// Get lawyer profile details by ID (either User ID or Lawyer ID)
const getLawyerById = async (req, res, next) => {
  try {
    const lawyer = await Lawyer.findById(req.params.id).populate('userId', 'name email phone location') 
      || await Lawyer.findOne({ userId: req.params.id }).populate('userId', 'name email phone location');
      
    if (!lawyer) {
      res.status(404);
      return next(new Error('Lawyer profile not found'));
    }
    res.json({ success: true, data: lawyer });
  } catch (error) {
    next(error);
  }
};

// Update advocate availabilityStatus
const updateAvailability = async (req, res, next) => {
  try {
    const { availabilityStatus } = req.body;
    const lawyer = await Lawyer.findOneAndUpdate(
      { userId: req.user._id },
      { availabilityStatus },
      { new: true }
    );
    if (!lawyer) {
      res.status(404);
      return next(new Error('Lawyer profile not found'));
    }
    res.json({ success: true, message: 'Availability status updated', data: lawyer });
  } catch (error) {
    next(error);
  }
};

// Update advocate pricing metrics
const updateFees = async (req, res, next) => {
  try {
    const { consultationFee, caseFilingFee, courtRepresentationFee, hourlyFee } = req.body;
    const lawyer = await Lawyer.findOneAndUpdate(
      { userId: req.user._id },
      { consultationFee, caseFilingFee, courtRepresentationFee, hourlyFee },
      { new: true }
    );
    if (!lawyer) {
      res.status(404);
      return next(new Error('Lawyer profile not found'));
    }
    res.json({ success: true, message: 'Professional fee structures updated', data: lawyer });
  } catch (error) {
    next(error);
  }
};

// Submit feedback review for a Lawyer
const createReview = async (req, res, next) => {
  try {
    const { rating, comment, caseId } = req.body;
    const lawyerId = req.params.id;

    // Check if review already exists
    const duplicate = await Review.findOne({ applicantId: req.user._id, caseId });
    if (duplicate) {
      res.status(400);
      return next(new Error('You have already submitted a review for this case representation.'));
    }

    const review = await Review.create({
      applicantId: req.user._id,
      lawyerId,
      caseId,
      rating: Number(rating),
      comment
    });

    // Update lawyer overall rating metrics
    const reviews = await Review.find({ lawyerId });
    const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
    
    await Lawyer.findByIdAndUpdate(lawyerId, {
      rating: Number(avgRating.toFixed(1)),
      reviewCount: reviews.length
    });

    res.status(201).json({ success: true, message: 'Review recorded successfully', data: review });
  } catch (error) {
    next(error);
  }
};

// Retrieve reviews for a Lawyer
const getReviews = async (req, res, next) => {
  try {
    const reviews = await Review.find({ lawyerId: req.params.id })
      .populate('applicantId', 'name profileImage');
    res.json({ success: true, data: reviews });
  } catch (error) {
    next(error);
  }
};

// Advanced filter & search endpoint
const filterLawyers = async (req, res, next) => {
  try {
    const { specialization, location, rating, minFee, maxFee, experience } = req.query;
    const query = { verificationStatus: 'Verified' };

    if (specialization) {
      query.specializations = { $in: [new RegExp(specialization, 'i')] };
    }
    if (location) {
      query.location = new RegExp(location, 'i');
    }
    if (rating) {
      query.rating = { $gte: Number(rating) };
    }
    if (experience) {
      query.experience = { $gte: Number(experience) };
    }
    if (minFee || maxFee) {
      query.consultationFee = {};
      if (minFee) query.consultationFee.$gte = Number(minFee);
      if (maxFee) query.consultationFee.$lte = Number(maxFee);
    }

    const lawyers = await Lawyer.find(query).populate('userId', 'name email phone location');
    res.json({ success: true, data: lawyers });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  updateLawyerProfile,
  getLawyers,
  getLawyerById,
  updateAvailability,
  updateFees,
  createReview,
  getReviews,
  filterLawyers
};
