import { Review, Track, Enrollment, User } from '../models/index.js';
import {sequelize} from '../models/index.js'

export const createReview = async (req, res) => {
  try {
    // Check if user is enrolled
    const enrollment = await Enrollment.findOne({
      where: {
        userId: req.user.id,
        trackId: req.params.trackId
      }
    });
    console.log('Enrollment:', enrollment);

    if (!enrollment) {
      return res.status(403).json({ error: 'You must enroll in the track first' });
    }

    // Check for existing review
    const existingReview = await Review.findOne({
      where: {
        userId: req.user.id,
        trackId: req.params.trackId
      }
    });

    if (existingReview) {
      return res.status(400).json({ error: 'You already reviewed this track' });
    }

    const review = await Review.create({
      ...req.body,
      userId: req.user.id,
      trackId: req.params.trackId
    });

    // Update track rating average
    await updateTrackRating(req.params.trackId);

    res.status(201).json(review);
  } catch (error) {
    console.error('Failed to create review:', error);
    res.status(500).json({ error: 'Failed to create review' });
  }
};

export const getTrackReviews = async (req, res) => {
  try {
    const reviews = await Review.findAll({
      where: { trackId: req.params.trackId },
      include: [{
        model: User,
        as: 'user',
        attributes: ['id', 'name', 'avatarUrl']
      }],
      order: [['createdAt', 'DESC']]
    });

    res.json(reviews);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch reviews' });
  }
};

const updateTrackRating = async (trackId) => {
  const result = await Review.findOne({
    where: { trackId },
    attributes: [
      [sequelize.fn('AVG', sequelize.col('rating')), 'averageRating'],
      [sequelize.fn('COUNT', sequelize.col('id')), 'reviewCount']
    ],
    raw: true
  });

  await Track.update({
    rating: parseFloat(result.averageRating) || 0,
    reviewCount: result.reviewCount
  }, { where: { id: trackId } });
};