import { Module, Quiz, Track } from '../models/index.js';
import { generateQuiz } from '../services/aiService.js'; // Implement AI integration
import { processModuleVideo, checkVideoProcessingStatus } from '../services/videoProcessingService.js';
import { supabase } from '../services/supabase.js';
import { notifyNewModule } from '../services/notificationService.js';


export const addModule = async (req, res) => {
  try {
    const track = await Track.findByPk(req.params.trackId);
    if (!track) {
      return res.status(404).json({ error: 'Track not found' });
    }
    if (track.creatorId !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    // Ensure duration is either a number or null
    const moduleData = {
      ...req.body,
      duration: req.body.duration ? parseInt(req.body.duration) : null,
      trackId: req.params.trackId,
    };

    const module = await Module.create(moduleData);

    // Send notification to enrolled users
    try {
      await notifyNewModule(req.params.trackId, module.title);
    } catch (notificationError) {
      console.error('Failed to send new module notification:', notificationError);
    }

    res.status(201).json(module);
  } catch (error) {
    console.error('Error adding module:', error);
    res.status(500).json({ 
      error: 'Failed to add module',
      details: error.message 
    });
  }
};

export const updateModule = async (req, res) => {
  try {
    const module = await Module.findByPk(req.params.moduleId, {
      include: [{
        model: Track,
        as: 'Track',
        attributes: ['creatorId']
      }]
    });

    if (!module) {
      return res.status(404).json({ error: 'Module not found' });
    }

    if (!module.Track) {
      return res.status(404).json({ error: 'Track not found for this module' });
    }

    if (module.Track.creatorId !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized to edit this module' });
    }

    await module.update(req.body);
    res.json(module);
  } catch (error) {
    console.error('Error updating module:', error);
    res.status(500).json({ error: 'Failed to update module' });
  }
};

export const deleteModule = async (req, res) => {
  try {
    const module = await Module.findByPk(req.params.moduleId, {
      include: [{
        model: Track,
        as: 'Track',
        attributes: ['creatorId']
      }]
    });

    if (!module) {
      return res.status(404).json({ error: 'Module not found' });
    }

    if (!module.Track) {
      return res.status(404).json({ error: 'Track not found for this module' });
    }

    if (module.Track.creatorId !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized to delete this module' });
    }

    // Delete associated quiz if exists
    if (module.quiz) {
      await module.quiz.destroy();
    }

    // Delete video file from storage if exists
    if (module.videoUrl) {
      try {
        const filePath = module.videoUrl.split('/public/')[1];
        if (filePath) {
          await supabase.storage
            .from('module-videos')
            .remove([filePath]);
        }
      } catch (error) {
        console.error('Error deleting video file:', error);
        // Continue with module deletion even if video deletion fails
      }
    }

    await module.destroy();
    res.json({ message: 'Module deleted successfully' });
  } catch (error) {
    console.error('Error deleting module:', error);
    res.status(500).json({ error: 'Failed to delete module' });
  }
};

// Add to existing controller
export const uploadModuleVideo = async (req, res) => {
  try {
    // Verify module exists and user has permission
    const module = await Module.findByPk(req.params.moduleId, {
      include: [{
        model: Track,
        as: 'Track',
        attributes: ['creatorId']
      }]
    });

    if (!module) {
      return res.status(404).json({ error: 'Module not found' });
    }

    if (!module.Track || module.Track.creatorId !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    if (!req.file) {
      return res.status(400).json({ error: 'No video file provided' });
    }

    // Check file size
    if (req.file.size > 500 * 1024 * 1024) { // 500MB limit
      return res.status(400).json({ error: 'File too large (max 500MB)' });
    }

    // Generate unique filename
    const fileName = `modules/${req.params.moduleId}/${Date.now()}-${req.file.originalname}`;

    // Upload to Supabase
    const { data, error } = await supabase.storage
      .from('module-videos')
      .upload(fileName, req.file.buffer, {
        contentType: req.file.mimetype,
        cacheControl: '3600',
        upsert: false
      });

    if (error) {
      console.error('Supabase upload error:', error);
      throw error;
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('module-videos')
      .getPublicUrl(fileName);

    // For now, mark as ready immediately since we don't have video processing
    // In a production environment, you would:
    // 1. Send to video processing service (Mux, AWS MediaConvert, etc.)
    // 2. Get a processing job ID
    // 3. Mark status as 'processing'
    // 4. Poll for completion and update with duration, thumbnails, etc.
    
    await module.update({
      videoUrl: publicUrl,
      videoStatus: 'ready', // Mark as ready immediately
      // videoDuration: will be set when video is first played or processed
    });

    res.json({
      message: 'Video uploaded successfully',
      videoUrl: publicUrl,
      status: 'ready'
    });
  } catch (error) {
    console.error('Video upload error:', error);
    res.status(500).json({ 
      error: 'Video upload failed',
      details: error.message 
    });
  }
};

export const getVideoStatus = async (req, res) => {
  try {
    const module = await Module.findByPk(req.params.moduleId);
    if (!module) return res.status(404).json({ error: 'Module not found' });

    if (module.videoStatus === 'ready') {
      return res.json({ status: 'ready', videoUrl: module.videoUrl });
    }

    const status = await checkVideoProcessingStatus(module.videoProcessingJobId);
    if (status.status === 'ready') {
      await module.update({
        videoStatus: 'ready',
        videoDuration: status.duration
      });
    }

    res.json(status);
  } catch (error) {
    res.status(500).json({ error: 'Failed to check status' });
  }
};

export const getModuleWithQuiz = async (req, res) => {
  try {
    const module = await Module.findByPk(req.params.moduleId, {
      include: [{
        model: Quiz,
        as: 'quiz'
      }]
    });
    if (!module) {
      return res.status(404).json({ error: 'Module not found' });
    }
    res.json(module);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch module' });
  }
};

// Helper function to update video duration when video is accessed
export const updateVideoDuration = async (moduleId, duration) => {
  try {
    const module = await Module.findByPk(moduleId);
    if (module && !module.videoDuration) {
      await module.update({
        videoDuration: Math.round(duration)
      });
    }
  } catch (error) {
    console.error('Error updating video duration:', error);
  }
};