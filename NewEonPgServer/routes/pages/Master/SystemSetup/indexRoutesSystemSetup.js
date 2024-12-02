const express = require("express");
const router = express.Router();
const pool = require("../../../../config/db");
const authMiddleware = require("../../../../middleware/authMiddleware");
const BranchProfileModel = require("../../../../models/pages/Master/SystemSetup/BranchProfileModel");
const AdvSettingsModel = require("../../../../models/pages/Master/SystemSetup/AdvSettingsModel");
const UserProfileModel = require("../../../../models/pages/Master/SystemSetup/UserProfileModel");
const ProductProfileModel = require("../../../../models/pages/Master/SystemSetup/ProductProfileModel");
const TaxMasterModel = require("../../../../models/pages/Master/SystemSetup/TaxMasterModel");

const transformEmptyToNull = (data) => {
  const transformedData = {};
  for (const key in data) {
    if (data[key] === "") {
      transformedData[key] = null;
    } else {
      transformedData[key] = data[key];
    }
  }
  return transformedData;
};

// --------------------------COMPANY RECORD------------------------------

router.get("/companyRecord", authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM "mstCompanyRecord" WHERE "bIsdeleted"=false'
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// --------------------------COMPANY RECORD------------------------------

// ---------------------------------BRANCH/LOCATION PROFILE------------------------------------------------------------

// Options

router.get("/CompanyRecordOptions", authMiddleware, async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT "nCompID","vCompanyName" FROM "mstCompanyRecord" WHERE "bIsdeleted"=false`
    );

    const CompanyOptions = rows.map((row) => ({
      value: row.nCompID,
      label: row.vCompanyName,
    }));

    res.json(CompanyOptions);
  } catch (error) {
    console.error("Error fetching data:", error);
    res.status(500).send("Error fetching data");
  }
});

router.get("/LocationOptions", authMiddleware, async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT "vDescription" FROM "MMASTERS" WHERE "vType" = 'ST' ORDER BY "vDescription"`
    );

    const LocationOptions = rows.map((row) => ({
      value: row.vDescription,
      label: row.vDescription,
    }));

    res.json(LocationOptions);
  } catch (error) {
    console.error("Error fetching data:", error);
    res.status(500).send("Error fetching data");
  }
});

router.get("/CityOptions", authMiddleware, async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT "vDescription","nMasterID" FROM "MMASTERS" WHERE "vType" = 'CT' ORDER BY "vDescription"`
    );

    const CityOptions = rows.map((row) => ({
      value: row.vDescription,
      label: row.vDescription,
      key: row.nMasterID,
    }));

    res.json(CityOptions);
  } catch (error) {
    console.error("Error fetching data:", error);
    res.status(500).send("Error fetching data");
  }
});

router.get("/LocationTypeOptions", authMiddleware, async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT "nLocationTypeID", "vDescription" FROM "mstLocationType"`
    );

    const LocationTypeOptions = rows.map((row) => ({
      value: row.nLocationTypeID,
      label: row.vDescription,
    }));

    res.json(LocationTypeOptions);
  } catch (error) {
    console.error("Error fetching data:", error);
    res.status(500).send("Error fetching data");
  }
});

router.get("/UserOptions", authMiddleware, async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT "nUserID","vName" FROM "mstUser" where "bActive" = true AND "bIsDeleted" = false AND "bIsGroup"=false ORDER BY "vName"`
    );

    const UserOptions = rows.map((row) => ({
      value: row.nUserID,
      label: row.vName,
    }));

    res.json(UserOptions);
  } catch (error) {
    console.error("Error fetching data:", error);
    res.status(500).send("Error fetching data");
  }
});

router.get("/BranchOptions", authMiddleware, async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT "nBranchID","vBranchCode" FROM "mstCompany" WHERE "bIsdeleted"=false AND "bActive"= true`
    );

    const BranchOptions = rows.map((row) => ({
      value: row.nBranchID,
      label: row.vBranchCode,
    }));

    res.json(BranchOptions);
  } catch (error) {
    console.error("Error fetching data:", error);
    res.status(500).send("Error fetching data");
  }
});

// Options END

// LINKING EDNPOINTS

// --------------------------------------------------------------BRANCH COUNTER LINK-----------------------------------------

// Fetch all counters and branch-counter links
router.post("/BranchCounterLink", authMiddleware, async (req, res) => {
  const { nBranchID } = req.body;

  try {
    // Fetch all counters
    const countersResult = await pool.query(
      `SELECT * FROM "mstCounter" WHERE "bIsDeleted" = false`
    );
    const counters = countersResult.rows;

    // Fetch existing branch-counter links
    const branchCounterResult = await pool.query(
      `SELECT * FROM "mstBranchCounterLink" WHERE "nBranchID" = $1`,
      [nBranchID]
    );
    const branchCounters = branchCounterResult.rows;

    // Merge data to indicate which counters are linked
    const mergedData = counters.map((counter) => {
      const link = branchCounters.find(
        (bc) => bc.nCounterID === counter.nCounterID
      );
      return {
        ...counter,
        bIsActive: link ? link.bIsActive : false,
      };
    });

    res.json(mergedData);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Insert/Update branch-counter links
router.put("/BranchCounterLink", authMiddleware, async (req, res) => {
  const { nCounterID, nBranchID, bIsActive } = req.body;

  const query = `
    INSERT INTO "mstBranchCounterLink" ("nCounterID", "nBranchID", "bIsActive","vBranchCode")
    VALUES ($1, $2, $3,(SELECT "vBranchCode" FROM "mstCompany" WHERE "nBranchID" = $2)
    )
    ON CONFLICT ("nCounterID", "nBranchID")
    DO UPDATE SET "bIsActive" = EXCLUDED."bIsActive",
    "vBranchCode" = (SELECT "vBranchCode" FROM "mstCompany" WHERE "nBranchID" = $2)
  `;

  try {
    await pool.query(query, [nCounterID, nBranchID, bIsActive]);
    res.status(201).json({ message: "Data updated successfully" });
  } catch (error) {
    console.error("Error updating data:", error);
    res.status(500).json({ error: "Error updating data" });
  }
});

// --------------------------------------------------------------BRANCH COUNTER LINK END-----------------------------------------

// --------------------------------------------------------------BRANCH PRODUCT LINK-----------------------------------------
// fetch all products

router.get("/BranchProducts", authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT "nProductID","PRODUCTCODE" FROM "mProductM" WHERE "bIsDeleted" = false ORDER BY "nProductID" ASC`
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.post("/BranchProductLink", authMiddleware, async (req, res) => {
  const { nBranchID } = req.body;
  try {
    const result = await pool.query(
      `SELECT "nBranchProductLinkID","bActive","vProductCode","bRevEffect","vBranchCode","nBranchID" FROM "mstBranchProductLink" WHERE "nBranchID" = $1 ORDER BY "nBranchProductLinkID" ASC `,
      [nBranchID]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Add this new endpoint for inserting new records
router.post("/BranchProductLink/new", authMiddleware, async (req, res) => {
  const { PRODUCTCODE, bActive, bRevEffect, vBranchCode, nBranchID } = req.body;

  const query = `
    INSERT INTO "mstBranchProductLink" 
    ("vProductCode", "bActive", "bRevEffect", "vBranchCode", "nBranchID") 
    VALUES ($1, $2, $3, $4, $5)
    RETURNING "nBranchProductLinkID"
  `;

  try {
    const result = await pool.query(query, [
      PRODUCTCODE,
      bActive,
      bRevEffect,
      vBranchCode,
      nBranchID
    ]);
    res.status(201).json({ 
      message: "Data inserted successfully",
      nBranchProductLinkID: result.rows[0].nBranchProductLinkID 
    });
  } catch (error) {
    console.error("Error Inserting:", error);
    res.status(500).json({ error: "Error inserting data" });
  }
});

router.put("/BranchProductLink", authMiddleware, async (req, res) => {
  const { nBranchProductLinkID, bActive, bRevEffect } = req.body;

  if (!nBranchProductLinkID) {
    return res.status(400).json({ error: "nBranchProductLinkID is required for updates" });
  }

  const query = `
    UPDATE "mstBranchProductLink" 
    SET "bActive" = $2, "bRevEffect" = $3 
    WHERE "nBranchProductLinkID"= $1
  `;

  try {
    const result = await pool.query(query, [
      nBranchProductLinkID,
      bActive,
      bRevEffect,
    ]);
    res.status(200).json({ message: "Data updated successfully" });
  } catch (error) {
    console.error("Error Updating:", error);
    res.status(500).json({ error: "Error updating data" });
  }
});

// --------------------------------------------------------------BRANCH PRODUCT LINK END-----------------------------------------

// --------------------------------------------------------------BRANCH DIVISION LINK-----------------------------------------

router.post("/BranchDivisionLink", authMiddleware, async (req, res) => {
  const { nBranchID } = req.body;
  try {
    const result = await pool.query(
      `SELECT "nDivID","vDivCode","bActive","nBranchID","vBranchCode" FROM "DivisionProfileDetailsLink" WHERE "nBranchID"= $1`,
      [nBranchID]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.put("/BranchDivisionLink", authMiddleware, async (req, res) => {
  const { nDivID, bActive } = req.body;

  const query = `
    UPDATE "DivisionProfileDetailsLink" SET "bActive" = $2 WHERE "nDivID" = $1
    `;

  try {
    pool.query(query, [nDivID, bActive], (error, results) => {
      if (error) {
        console.error("Error Editing:", error);
        res.status(500).json({ error: "Error Editing data" });
      }
      console.log("Data Edited successfully");
      res.status(201).json({ message: "Data Edited successfully" });
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("Server error");
  }
});

// --------------------------------------------------------------BRANCH DIVISION LINK END-----------------------------------------

// LINKING EDNPOINTS END

//  CRUD

// GET - Fetch all branch profiles
router.get("/branchProfile", authMiddleware, async (req, res) => {
  try {
      const branchProfiles = await BranchProfileModel.getAllBranchProfiles();
      res.json(branchProfiles);
  } catch (error) {
      console.error(error);
      res.status(500).json({ error: error.message || "Internal Server Error" });
  }
});

// POST - Create new branch profile
router.post("/branchProfile", authMiddleware, async (req, res) => {
  try {
      const data = transformEmptyToNull(req.body);
      const newBranchProfile = await BranchProfileModel.createBranchProfile(data);
      res.status(201).json(newBranchProfile);
  } catch (error) {
      console.error(error);
      res.status(500).json({ error: error.message || "Error creating data" });
  }
});

// PUT - Update branch profile
router.put("/branchProfile", authMiddleware, async (req, res) => {
  try {
      const data = transformEmptyToNull(req.body);
      const updatedBranchProfile = await BranchProfileModel.updateBranchProfile(data);
      res.status(200).json(updatedBranchProfile);
  } catch (error) {
      console.error(error);
      if (error.message === "Branch profile not found") {
          res.status(404).json({ error: error.message });
      } else {
          res.status(500).json({ error: error.message || "Error updating branch profile" });
      }
  }
});

// POST - Delete branch profile
router.post("/branchProfileDelete", authMiddleware, async (req, res) => {
  try {
      const { nBranchID } = req.body;
      await BranchProfileModel.deleteBranchProfile(nBranchID);
      res.status(200).json({ message: "Data deleted successfully" });
  } catch (error) {
      console.error(error);
      if (error.message === "Branch profile not found") {
          res.status(404).json({ error: error.message });
      } else {
          res.status(500).json({ error: error.message || "Error deleting data" });
      }
  }
});

//  CRUD END

// ------------------------****-------BRANCH/LOCATION PROFILE END------****---------------------------------------------------

// --------------------------****-----ADV SETTINGS (GLOBAL AND BRANCH) START-----****-----------------------------------------------------

// Fetch advanced settings
router.post("/advSettings", authMiddleware, async (req, res) => {
    try {
        const { nBranchID } = transformEmptyToNull(req.body);
        const settings = await AdvSettingsModel.getAdvSettings(nBranchID);
        res.json(settings);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message || "Error fetching advanced settings" });
    }
});

// Update advanced settings
router.post("/advUpdate", authMiddleware, async (req, res) => {
    try {
        const { nBranchID, settings } = req.body;
        const result = await AdvSettingsModel.updateAdvSettings(nBranchID, settings);
        res.json(result);
    } catch (error) {
        console.error(error);
        if (error.message === "No settings to update") {
            res.status(400).json({ error: error.message });
        } else {
            res.status(500).json({ error: error.message || "Error updating settings" });
        }
    }
});

// --------------------------****-----ADV SETTINGS (GLOBAL AND BRANCH) END-----****-----------------------------------------------------

// ---------------------------***----USER GROUP SETTINGS START---------***----------------------------------------------------

// Fetch
router.get("/userProfile", authMiddleware, async (req, res) => {
  const { isGroup } = req.query;
  if (isGroup === undefined) {
    return res.status(400).send("isGroup query parameter is required");
  }

  try {
    const profiles = await UserProfileModel.getUserProfiles(isGroup);
    res.json(profiles);
  } catch (error) {
    console.error("Error Fetching data:", error);
    res.status(500).send(error.message || "Error Fetching data");
  }
});

// Check for vUID availability
router.post("/checkCode", authMiddleware, async (req, res) => {
  const { vUID } = req.body;
  if (!vUID) return res.status(400).json({ error: "vUID is required" });

  try {
    const exists = await UserProfileModel.checkUIDExists(vUID);
    res.json({ exists });
  } catch (error) {
    console.error("Error checking code:", error);
    res.status(500).json({ error: error.message || "Error checking code" });
  }
});

// Check for vName availability
router.post("/checkName", authMiddleware, async (req, res) => {
  const { vName } = req.body;
  if (!vName) return res.status(400).json({ error: "vName is required" });

  try {
    const exists = await UserProfileModel.checkNameExists(vName);
    res.json({ exists });
  } catch (error) {
    console.error("Error checking name:", error);
    res.status(500).json({ error: error.message || "Error checking name" });
  }
});

// Options
router.get("/userProfile/BranchOptions", authMiddleware, async (req, res) => {
  try {
    const branchOptions = await UserProfileModel.getBranchOptions();
    res.json(branchOptions);
  } catch (error) {
    console.error("Error fetching data:", error);
    res.status(500).send(error.message || "Error fetching data");
  }
});

router.get("/userProfile/GroupOptions", authMiddleware, async (req, res) => {
  try {
    const groupOptions = await UserProfileModel.getGroupOptions();
    res.json(groupOptions);
  } catch (error) {
    console.error("Error fetching data:", error);
    res.status(500).send(error.message || "Error fetching data");
  }
});

// Get ALL Navigation Items
router.get("/all-navigation", authMiddleware, async (req, res) => {
  try {
    const navTree = await UserProfileModel.getAllNavigation();
    res.json(navTree);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// Get User Rights
router.get("/UserProfile/user-rights", authMiddleware, async (req, res) => {
  const { parentId, userID } = req.query;

  if (!parentId || !userID) {
    return res.status(400).send("parentId and userID query parameters are required");
  }

  try {
    const rights = await UserProfileModel.getUserRights(userID, parentId);
    res.json(rights);
  } catch (error) {
    console.error("Error fetching User rights:", error);
    res.status(500).send(error.message || "Error fetching User rights");
  }
});

// Get Group Rights
router.get("/UserProfile/group-rights", authMiddleware, async (req, res) => {
  const { parentId, groupId } = req.query;

  if (!parentId || !groupId) {
    return res.status(400).send("parentId and groupId query parameters are required");
  }

  try {
    const rights = await UserProfileModel.getGroupRights(groupId, parentId);
    res.json(rights);
  } catch (error) {
    console.error("Error fetching group rights:", error);
    res.status(500).send(error.message || "Error fetching group rights");
  }
});

// Update Group Rights
router.post("/UserProfile/update-group-rights", authMiddleware, async (req, res) => {
  const { parentId, groupId, rights } = req.body;

  if (!parentId || !groupId || !rights) {
    return res.status(400).send("parentId, groupId, and rights body parameters are required");
  }

  try {
    await UserProfileModel.updateGroupRights(groupId, parentId, rights);
    res.status(200).send("Group rights updated successfully");
  } catch (error) {
    console.error("Error updating group rights:", error);
    res.status(500).send(error.message || "Error updating group rights");
  }
});

// Update User Rights
router.post("/UserProfile/update-user-rights", authMiddleware, async (req, res) => {
  const { parentId, userID, rights } = req.body;

  if (!parentId || !userID || !rights) {
    return res.status(400).send("parentId, userID, and rights body parameters are required");
  }

  try {
    await UserProfileModel.updateUserRights(userID, parentId, rights);
    res.status(200).send("User rights updated successfully");
  } catch (error) {
    console.error("Error updating user rights:", error);
    res.status(500).send(error.message || "Error updating user rights");
  }
});

// Fetch counters for a user
router.get("/UserProfile/counters", authMiddleware, async (req, res) => {
  const { userId } = req.query;

  try {
    const branches = await UserProfileModel.getUserCounters(userId);
    res.json(branches);
  } catch (error) {
    console.error("Error fetching counters", error);
    res.status(500).send(error.message || "Server error");
  }
});

// Update counter access
router.post("/UserProfile/updateCounterAccess", authMiddleware, async (req, res) => {
  const { userId, branchId, counterId, isActive } = req.body;

  try {
    await UserProfileModel.updateCounterAccess(userId, branchId, counterId, isActive);
    res.status(200).send("Counter access updated successfully");
  } catch (error) {
    console.error("Error updating counter access:", error);
    res.status(500).send(error.message || "Error updating counter access");
  }
});

// Fetch branches for a user
router.get("/UserProfile/branchesOnUser", authMiddleware, async (req, res) => {
  try {
    const branches = await UserProfileModel.getBranchesForUser();
    res.json(branches);
  } catch (error) {
    console.error("Error fetching branches:", error);
    res.status(500).json({ error: error.message || "Error fetching branches" });
  }
});

// Fetch user branch links
router.get("/UserProfile/userBranchLinks", authMiddleware, async (req, res) => {
  const { userId } = req.query;
  try {
    const branchLinks = await UserProfileModel.getUserBranchLinks(userId);
    res.json(branchLinks);
  } catch (error) {
    console.error("Error fetching user branch links:", error);
    res.status(500).json({ error: error.message || "Error fetching user branch links" });
  }
});

// Update user branch link
router.post("/UserProfile/updateUserBranchLink", authMiddleware, async (req, res) => {
  const { userId, branchId, isActive } = req.body;

  if (userId == null || branchId == null || isActive == null) {
    return res.status(400).json({ error: "Invalid parameters" });
  }

  try {
    await UserProfileModel.updateUserBranchLink(userId, branchId, isActive);
    res.status(200).json({ message: "User branch link updated successfully" });
  } catch (error) {
    console.error("Error updating user branch link:", error);
    res.status(500).json({ error: error.message || "Error updating user branch link" });
  }
});

// Create a new user
router.post("/userProfile", authMiddleware, async (req, res) => {
  const data = transformEmptyToNull(req.body);
  
  if (!data.vUID || !data.vName || data.bIsGroup === undefined) {
    return res.status(400).json({ error: "vUID, vName and bIsGroup are required" });
  }

  // Set default values for required fields
  const defaultValues = {
    bActive: true,
    bIsDeleted: false,
    bCanOptCentralM: false,
    BDATAENTRYPRIVILEGE: false,
    bSpecialRights: false,
    bIsVerified: false,
    bIsOrderCreation: false,
    bIsOrderAllotment: false,
    nCreatedBy: req.user?.nUserID || null,
    dCreationDate: new Date(),
    nLastUpdateBy: req.user?.nUserID || null,
    dLastUpdateDate: new Date()
  };

  try {
    const userData = {
      ...defaultValues,
      ...data
    };
    
    const newUser = await UserProfileModel.createUserProfile(userData);
    res.json(newUser);
  } catch (error) {
    console.error("Error creating user profile:", error);
    res.status(500).json({ error: error.message || "Error creating user profile" });
  }
});

// Update a user
router.put("/userProfile", authMiddleware, async (req, res) => {
  const data = transformEmptyToNull(req.body);
  const { nUserID } = data;

  if (!nUserID || !data.vUID || !data.vName || !data.nGroupID) {
    return res.status(400).json({
      error: "nUserID, vUID, vName, nGroupID are required",
    });
  }

  try {
    const updatedUser = await UserProfileModel.updateUserProfile(nUserID, data);
    res.json(updatedUser);
  } catch (error) {
    console.error("Error updating user profile:", error);
    res.status(500).json({ error: error.message || "Error updating user profile" });
  }
});

// Delete a user
router.post("/userProfile/delete", authMiddleware, async (req, res) => {
  const { nUserID } = req.body;

  if (!nUserID) {
    return res.status(400).json({ error: "nUserID is required" });
  }

  if (!req.user.bIsAdministrator) {
    return res.status(403).json({ error: "Only an admin user can delete" });
  }

  try {
    const deletedUser = await UserProfileModel.deleteUserProfile(nUserID);
    res.json(deletedUser);
  } catch (error) {
    console.error("Error deleting user profile:", error);
    res.status(500).json({ error: error.message || "Error deleting user profile" });
  }
});

// ---------------------------***----USER GROUP SETTINGS END---------***------------------------------------------------------

// ---------------------------***----PRODUCT PROFILE START---------***------------------------------------------------------

// ISSUER LINK
router.post("/ProductIssuerLink", authMiddleware, async (req, res) => {
  const { PRODUCTCODE } = req.body;

  try {
    const mergedData = await ProductProfileModel.getProductIssuerLinks(PRODUCTCODE);
    res.json(mergedData);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Insert/Update product-issuer links
router.put("/ProductIssuerLink", authMiddleware, async (req, res) => {
  const { PRODUCTCODE, nIssuerID, bIsActive } = req.body;

  try {
    const result = await ProductProfileModel.updateProductIssuerLink(PRODUCTCODE, nIssuerID, bIsActive);
    res.status(201).json(result);
  } catch (error) {
    console.error("Error updating data:", error);
    res.status(500).json({ error: "Error updating data" });
  }
});

//--------CRUD---------

//FETCH
router.get("/productProfile", authMiddleware, async (req, res) => {
  try {
    const products = await ProductProfileModel.getAllProducts();
    res.json(products);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// CREATE
router.post("/productProfile", authMiddleware, async (req, res) => {
  try {
    const data = transformEmptyToNull(req.body);
    const newProduct = await ProductProfileModel.createProduct(data);
    res.json(newProduct);
  } catch (error) {
    console.error("Error inserting data:", error);
    res.status(500).json({ error: "Error inserting data" });
  }
});

// UPDATE
router.put("/productProfile", authMiddleware, async (req, res) => {
  try {
    const data = transformEmptyToNull(req.body);
    const updatedProduct = await ProductProfileModel.updateProduct(data);
    res.json(updatedProduct);
  } catch (error) {
    console.error("Error updating data:", error);
    res.status(500).json({ error: "Error updating data" });
  }
});

// DELETE
router.post("/productProfile/delete", authMiddleware, async (req, res) => {
  const { nProductID } = req.body;

  if (!nProductID) {
    return res.status(400).json({ error: "nProductID is required" });
  }

  try {
    const result = await ProductProfileModel.deleteProduct(nProductID);
    res.status(200).json(result);
  } catch (error) {
    console.error("Error deleting data:", error);
    res.status(500).json({ error: "Error deleting data" });
  }
});

// ---------------------------***----PRODUCT PROFILE END---------***------------------------------------------------------

// ---------------------------***----TAX MASTER START---------***------------------------------------------------------

// TAX SLABS

// FETCH
router.get("/taxMaster/taxSlabs", authMiddleware, async (req, res) => {
  try {
    const { nTaxID } = req.query;
    const taxSlabs = await TaxMasterModel.getTaxSlabs(nTaxID);
    res.json(taxSlabs);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message || "Internal Server Error" });
  }
});

// INSERT
router.post("/taxMaster/taxSlabs", authMiddleware, async (req, res) => {
  try {
    const data = transformEmptyToNull(req.body);
    const result = await TaxMasterModel.createTaxSlab(data);
    res.json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message || "Error inserting data" });
  }
});

// EDIT
router.put("/taxMaster/taxSlabs", authMiddleware, async (req, res) => {
  try {
    const data = transformEmptyToNull(req.body);
    const result = await TaxMasterModel.updateTaxSlab(data);
    res.json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message || "Error updating data" });
  }
});

// DELETE TAX SLABS
router.post("/taxMaster/taxSlabs/delete", authMiddleware, async (req, res) => {
  try {
    const { nTaxID } = req.body;
    const result = await TaxMasterModel.deleteTaxSlabs(nTaxID);
    res.json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message || "Error deleting tax slabs" });
  }
});

// Options

// Posting A/C
router.get("/taxMaster/postingAccOptions", authMiddleware, async (req, res) => {
  try {
    const options = await TaxMasterModel.getPostingAccOptions();
    res.json(options);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message || "Internal Server Error" });
  }
});

//--------CRUD---------

//FETCH
router.get("/taxMaster", authMiddleware, async (req, res) => {
  try {
    const taxes = await TaxMasterModel.getAllTaxes();
    res.json(taxes);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message || "Internal Server Error" });
  }
});

// CREATE
router.post("/taxMaster", authMiddleware, async (req, res) => {
  try {
    const data = transformEmptyToNull(req.body);
    const result = await TaxMasterModel.createTax(data);
    res.json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message || "Error inserting data" });
  }
});

// UPDATE
router.put("/taxMaster", authMiddleware, async (req, res) => {
  try {
    const data = transformEmptyToNull(req.body);
    const result = await TaxMasterModel.updateTax(data);
    res.json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message || "Error updating data" });
  }
});

// DELETE
router.post("/taxMaster/delete", authMiddleware, async (req, res) => {
  try {
    const { nTaxID } = req.body;
    if (!nTaxID) {
      return res.status(400).json({ error: "nTaxID is required" });
    }
    const result = await TaxMasterModel.deleteTax(nTaxID);
    res.json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message || "Error deleting data" });
  }
});

// ---------------------------***----TAX MASTER END---------***------------------------------------------------------

module.exports = router;
