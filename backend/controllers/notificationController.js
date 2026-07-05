const db = require("../config/db");

// Helper function to create notification in DB
const createNotification = async (userId, title, message) => {
    try {
        await db.promise().query(
            "INSERT INTO notifications (user_id, title, message) VALUES (?, ?, ?)",
            [userId, title, message]
        );
        return true;
    } catch (err) {
        console.error("Error creating notification helper:", err);
        return false;
    }
};

// GET /api/notifications
const getNotifications = async (req, res) => {
    try {
        const userId = req.user.id;
        const [rows] = await db.promise().query(
            "SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT 50",
            [userId]
        );
        return res.status(200).json({
            success: true,
            notifications: rows
        });
    } catch (error) {
        console.error("Error fetching user notifications:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to fetch notifications."
        });
    }
};

// PUT /api/notifications/:id/read
const markAsRead = async (req, res) => {
    try {
        const userId = req.user.id;
        const { id } = req.params;
        await db.promise().query(
            "UPDATE notifications SET is_read = 1 WHERE id = ? AND user_id = ?",
            [id, userId]
        );
        return res.status(200).json({
            success: true,
            message: "Notification marked as read."
        });
    } catch (error) {
        console.error("Error marking notification as read:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to mark notification as read."
        });
    }
};

// PUT /api/notifications/read-all
const markAllAsRead = async (req, res) => {
    try {
        const userId = req.user.id;
        await db.promise().query(
            "DELETE FROM notifications WHERE user_id = ?",
            [userId]
        );
        return res.status(200).json({
            success: true,
            message: "All notifications cleared."
        });
    } catch (error) {
        console.error("Error clearing all notifications:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to clear all notifications."
        });
    }
};

module.exports = {
    createNotification,
    getNotifications,
    markAsRead,
    markAllAsRead
};
