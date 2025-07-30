import { Discussion, User, Track } from '../models/index.js';
import { supabase } from '../services/supabase.js';
import { notifyDiscussionReply } from '../services/notificationService.js';
import multer from 'multer';

export const createDiscussion = async (req, res) => {
    try {
        const { trackId, moduleId, content, parentId, attachments } = req.body;
        const userId = req.user.id;
        
        console.log('attachments from body:', attachments, typeof attachments);

        let attachmentUrls = [];
        if (req.files) {
            for (const file of req.files) {
                const fileName = `discussions/${trackId}/${userId}/${Date.now()}-${file.originalname}`;
                const { data, error } = await supabase.storage
                    .from('discussion-attachments')
                    .upload(fileName, file.buffer, {
                        contentType: file.mimetype
                    });
                
                if (error) throw error;
                attachmentUrls.push(`${process.env.SUPABASE_URL}/storage/v1/object/public/discussion-attachments/${fileName}`);
            }
        }

        const discussion = await Discussion.create({
            trackId,
            moduleId,
            content,
            parentId: parentId || null,
            attachments: attachments || [],
            userId
        });

        // If this is a reply, notify the parent message author
        if (parentId) {
            try {
                const parentDiscussion = await Discussion.findByPk(parentId, {
                    include: [{ model: User, as: 'user', attributes: ['id', 'name'] }]
                });
                
                if (parentDiscussion && parentDiscussion.userId !== userId) {
                    const track = await Track.findByPk(trackId);
                    const currentUser = await User.findByPk(userId);
                    
                    await notifyDiscussionReply(
                        parentDiscussion.userId,
                        track.title,
                        currentUser.name
                    );
                }
            } catch (notificationError) {
                console.error('Failed to send discussion notification:', notificationError);
            }
        }

        res.status(201).json(discussion);
    } catch (error) {
        console.error('Discussion creation error:', error);
        res.status(500).json({ error: 'Failed to create discussion' });
    }
};

export const getTrackDiscussions = async (req, res) => {
    const { trackId } = req.params;
    const discussions = await Discussion.findAll({
        where: { trackId },
        include: [{ model: User, as: 'user', attributes: ['id', 'name', 'avatarUrl'] }],
        order: [['createdAt', 'ASC']]
    });
    res.json(discussions);
};

export const getModuleDiscussions = async (req, res) => {
    const { moduleId } = req.params;
    const discussions = await Discussion.findAll({
        where: { moduleId },
        include: [{ model: User, as: 'user', attributes: ['id', 'name', 'avatarUrl'] }],
        order: [['createdAt', 'ASC']]
    });
    res.json(discussions);
};

export const updateDiscussion = async (req, res) => {
    try {
        const discussion = await Discussion.findByPk(req.params.discussionId);
        
        if (!discussion) {
            return res.status(404).json({ error: 'Discussion not found' });
        }
        
        if (discussion.userId !== req.user.id && req.user.role !== 'Admin') {
            return res.status(403).json({ error: 'Unauthorized' });
        }

        await discussion.update({ content: req.body.content });
        res.json(discussion);
    } catch (error) {
        res.status(500).json({ error: 'Failed to update discussion' });
    }
};

export const deleteDiscussion = async (req, res) => {
    const { id } = req.params;
    const discussion = await Discussion.findByPk(id);
    if (!discussion) return res.status(404).json({ error: 'Not found' });
    if (String(discussion.userId) !== String(req.user.id)) return res.status(403).json({ error: 'Forbidden' });
    await discussion.destroy();
    res.json({ success: true });
};

export const uploadAttachment = async (req, res) => {
    try {
        console.log('uploadAttachment called');
        if (!req.file) {
            console.log('No file uploaded');
            return res.status(400).json({ error: 'No file uploaded' });
        }
        const userId = req.user.id;
        const fileName = `discussions/${userId}/${Date.now()}-${req.file.originalname}`;
        console.log('Uploading to Supabase:', fileName);

        const { data, error } = await supabase.storage
            .from('discussion-attachments')
            .upload(fileName, req.file.buffer, {
                contentType: req.file.mimetype
            });

        if (error) {
            console.error('Supabase upload error:', error);
            return res.status(500).json({ error: 'Failed to upload to Supabase', details: error.message });
        }
        const url = `${process.env.SUPABASE_URL}/storage/v1/object/public/discussion-attachments/${fileName}`;
        console.log('Upload successful:', url);
        res.json({ url });
    } catch (error) {
        console.error('uploadAttachment error:', error);
        res.status(500).json({ error: 'Failed to upload attachment', details: error.message });
    }
};

export const editDiscussion = async (req, res) => {
    try {
        const { id } = req.params;
        const { content } = req.body;
        const userId = req.user.id;
        const discussion = await Discussion.findByPk(id);
        if (!discussion) return res.status(404).json({ error: 'Discussion not found' });
        if (discussion.userId !== userId) return res.status(403).json({ error: 'Forbidden' });
        discussion.content = content;
        discussion.updatedAt = new Date();
        await discussion.save();
        res.json(discussion);
    } catch (err) {
        res.status(500).json({ error: 'Failed to edit discussion' });
    }
};

export const getDiscussionById = async (req, res) => {
    // handle discussion retrieval
};

