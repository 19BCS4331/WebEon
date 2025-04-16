const express = require("express");
const router = express.Router();
const pool = require("../config/db");
const authMiddleware = require("../middleware/authMiddleware");

// router.get("/navigation", authMiddleware, async (req, res) => {
//   try {
//     console.log("User ID from middleware:", req.user.nUserID);
//     const userId = req.user.nUserID;

//     // Fetch navigation items based on user permissions from the view
//     const navQuery = `
//       SELECT n.*
//       FROM "mstNavigation" n
//       JOIN user_navigation_access a ON n.id = a.navigation_id
//       WHERE a.user_id = $1
//       ORDER BY n."order"
//     `;
//     const navItems = (await pool.query(navQuery, [userId])).rows;

//     // Log navigation items for debugging
//     console.log("Navigation Items:", navItems);

//     // Build hierarchical structure
//     const buildTree = (items, parentId = null) => {
//       return items
//         .filter((item) => item.parent_id === parentId)
//         .map((item) => ({
//           ...item,
//           subItems: buildTree(items, item.id), // Use `item.id` instead of `item.nNavigationID`
//         }));
//     };

//     const navTree = buildTree(navItems);
//     res.json(navTree);
//   } catch (err) {
//     console.error(err); // Log the error for debugging
//     res.status(500).json({ error: err.message });
//   }
// });

router.get("/navigation", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.nUserID;

    // Fetch user group
    const userGroupQuery = `
      SELECT u."nGroupID"
      FROM "mstUser" u
      WHERE u."nUserID" = $1 AND u."bActive" = TRUE
    `;
    const userGroup = (await pool.query(userGroupQuery, [userId])).rows[0];

    // Fetch navigation items based on user and group permissions
    const navQuery = `
      SELECT DISTINCT n.*
      FROM "mstNavigation" n
      LEFT JOIN "mstUserRights" ur ON n.id = ur."nMenuID" AND ur."nUserID" = $1
      LEFT JOIN "mstGroupRights" gr ON n.id = gr."nMenuID" AND gr."nGroupID" = $2
      WHERE COALESCE(ur."bViewRights", gr."bViewRights") = TRUE AND n."bIsdeleted" = FALSE
      ORDER BY n."order"
    `;
    const navItems = (await pool.query(navQuery, [userId, userGroup.nGroupID]))
      .rows;

    // Build hierarchical structure
    const buildTree = (items, parentId = null) => {
      return items
        .filter((item) => item.parent_id === parentId)
        .map((item) => ({
          ...item,
          subItems: buildTree(items, item.id),
        }));
    };

    const navTree = buildTree(navItems);
    res.json(navTree);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
