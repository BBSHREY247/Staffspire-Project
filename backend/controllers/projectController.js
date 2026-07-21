const db = require("../config/db");

// --- PROJECT CRUD ---
const createProject = async (req, res) => {
    try {
        const { project_name, description, department_id, manager_id, priority, start_date, end_date, project_color, project_icon } = req.body;
        if (!project_name) return res.status(400).json({ success: false, message: "Project name is required" });

        const [result] = await db.promise().query(
            `INSERT INTO projects (project_name, description, department_id, manager_id, priority, start_date, end_date, project_color, project_icon, created_by)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [project_name, description, department_id, manager_id, priority, start_date, end_date, project_color, project_icon, req.user.id]
        );

        const projectCode = `PRJ${String(result.insertId).padStart(4, "0")}`;
        await db.promise().query("UPDATE projects SET project_code = ? WHERE id = ?", [projectCode, result.insertId]);

        res.status(201).json({ success: true, message: "Project created", projectId: result.insertId });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

const updateProject = async (req, res) => {
    try {
        const { project_name, description, department_id, manager_id, priority, status, start_date, end_date, project_color, project_icon } = req.body;
        
        await db.promise().query(
            `UPDATE projects SET project_name=?, description=?, department_id=?, manager_id=?, priority=?, status=?, start_date=?, end_date=?, project_color=?, project_icon=? WHERE id=?`,
            [project_name, description, department_id, manager_id, priority, status, start_date, end_date, project_color, project_icon, req.params.id]
        );
        res.json({ success: true, message: "Project updated" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

const deleteProject = async (req, res) => {
    try {
        await db.promise().query("DELETE FROM projects WHERE id = ?", [req.params.id]);
        res.json({ success: true, message: "Project deleted" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

const getAllProjects = async (req, res) => {
    try {
        const [projects] = await db.promise().query(`SELECT * FROM projects ORDER BY created_at DESC`);
        
        // Compute progress dynamically
        for (let p of projects) {
            const [[stats]] = await db.promise().query(`
                SELECT 
                    COUNT(*) as total, 
                    SUM(IF(status='Completed', 1, 0)) as completed
                FROM tasks WHERE project_id = ?
            `, [p.id]);
            p.completion_percentage = stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0;
            
            // fetch member count
            const [[m]] = await db.promise().query("SELECT COUNT(*) as c FROM project_members WHERE project_id = ?", [p.id]);
            p.member_count = m.c;
        }

        res.json({ success: true, projects });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

const getProjectById = async (req, res) => {
    try {
        const [[project]] = await db.promise().query("SELECT * FROM projects WHERE id = ?", [req.params.id]);
        if (!project) return res.status(404).json({ success: false, message: "Not found" });
        
        // Members
        const [members] = await db.promise().query(`
            SELECT pm.*, e.first_name, e.last_name, e.department, e.designation 
            FROM project_members pm
            JOIN employees e ON pm.employee_id = e.employee_id
            WHERE pm.project_id = ?
        `, [req.params.id]);
        
        // Milestones
        const [milestones] = await db.promise().query("SELECT * FROM project_milestones WHERE project_id = ? ORDER BY due_date ASC", [req.params.id]);
        
        // Tasks
        const [tasks] = await db.promise().query(`
            SELECT t.*, CONCAT(e.first_name, ' ', e.last_name) AS employee_name
            FROM tasks t
            LEFT JOIN employees e ON t.employee_id = e.employee_id
            WHERE t.project_id = ?
        `, [req.params.id]);

        res.json({ success: true, project, members, milestones, tasks });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

const archiveProject = async (req, res) => {
    try {
        await db.promise().query("UPDATE projects SET status = 'Archived' WHERE id = ?", [req.params.id]);
        res.json({ success: true, message: "Project archived" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

// --- MEMBERS ---
const addMember = async (req, res) => {
    try {
        const { project_id, employee_id } = req.body;
        // Check if exists
        const [exist] = await db.promise().query("SELECT id FROM project_members WHERE project_id=? AND employee_id=?", [project_id, employee_id]);
        if (exist.length > 0) return res.status(400).json({ success: false, message: "Member already added" });
        
        await db.promise().query("INSERT INTO project_members (project_id, employee_id) VALUES (?, ?)", [project_id, employee_id]);
        res.json({ success: true, message: "Member added" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

const removeMember = async (req, res) => {
    try {
        const { project_id, employee_id } = req.query; // using query params for delete
        await db.promise().query("DELETE FROM project_members WHERE project_id=? AND employee_id=?", [project_id, employee_id]);
        res.json({ success: true, message: "Member removed" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

// --- MILESTONES ---
const createMilestone = async (req, res) => {
    try {
        const { project_id, title, description, due_date } = req.body;
        await db.promise().query(
            "INSERT INTO project_milestones (project_id, title, description, due_date) VALUES (?, ?, ?, ?)",
            [project_id, title, description, due_date]
        );
        res.status(201).json({ success: true, message: "Milestone created" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

const updateMilestone = async (req, res) => {
    try {
        const { title, description, due_date, status } = req.body;
        let completion_date = null;
        if (status === 'Completed') {
            completion_date = new Date().toISOString().split('T')[0];
        }
        await db.promise().query(
            "UPDATE project_milestones SET title=?, description=?, due_date=?, status=?, completion_date=? WHERE id=?",
            [title, description, due_date, status, completion_date, req.params.id]
        );
        res.json({ success: true, message: "Milestone updated" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

const deleteMilestone = async (req, res) => {
    try {
        await db.promise().query("DELETE FROM project_milestones WHERE id = ?", [req.params.id]);
        res.json({ success: true, message: "Milestone deleted" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

// --- ANALYTICS ---
const getProjectAnalytics = async (req, res) => {
    try {
        const [[pStats]] = await db.promise().query(`
            SELECT 
                COUNT(*) as total,
                SUM(IF(status='Active', 1, 0)) as active,
                SUM(IF(status='Completed', 1, 0)) as completed,
                SUM(IF(status='On Hold', 1, 0)) as on_hold,
                SUM(IF(end_date < CURDATE() AND status != 'Completed', 1, 0)) as overdue
            FROM projects
        `);

        // Compute overall progress
        const [projects] = await db.promise().query("SELECT id FROM projects");
        let totalProgress = 0;
        let count = 0;
        for (let p of projects) {
            const [[tStats]] = await db.promise().query(`
                SELECT COUNT(*) as total, SUM(IF(status='Completed', 1, 0)) as completed
                FROM tasks WHERE project_id = ?
            `, [p.id]);
            if (tStats.total > 0) {
                totalProgress += (tStats.completed / tStats.total) * 100;
                count++;
            }
        }
        const avg_progress = count > 0 ? Math.round(totalProgress / count) : 0;

        // Department dist
        const [deptDist] = await db.promise().query(`
            SELECT department_id as name, COUNT(*) as value 
            FROM projects GROUP BY department_id
        `);

        res.json({
            success: true,
            stats: {
                total: pStats.total || 0,
                active: pStats.active || 0,
                completed: pStats.completed || 0,
                on_hold: pStats.on_hold || 0,
                overdue: pStats.overdue || 0,
                avg_progress
            },
            deptDist: deptDist.map(d => ({ name: d.name || 'Unassigned', value: d.value }))
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

module.exports = {
    createProject, updateProject, deleteProject, getAllProjects, getProjectById, archiveProject,
    addMember, removeMember,
    createMilestone, updateMilestone, deleteMilestone,
    getProjectAnalytics
};
