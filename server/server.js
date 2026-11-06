
const express = require("express");
const cors = require("cors");
const mysql = require("mysql2/promise");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const multer = require("multer");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 5001;

app.use(cors());
app.use(express.json());
const path = require("path");

app.use("/uploads", express.static(path.join(__dirname, "uploads")));
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, "uploads"));
  },
  filename: (req, file, cb) => {
    const uniqueName =
      Date.now() + "-" + Math.round(Math.random() * 1e9) + path.extname(file.originalname);

    cb(null, uniqueName);
  },
});

const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed."));
    }
  },
});
// Admin login

app.post("/api/admin/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(401).json({
        success: false,
        message: "Invalid username or password.",
      });
    }

    const isPasswordValid = await bcrypt.compare(
      password,
      process.env.ADMIN_PASSWORD_HASH
    );

    if (
      username !== process.env.ADMIN_USERNAME ||
      !isPasswordValid
    ) {
      return res.status(401).json({
        success: false,
        message: "Invalid username or password.",
      });
    }

    const token = jwt.sign(
      { username, role: "admin" },
      process.env.JWT_SECRET,
      { expiresIn: "2h" }
    );

    res.json({
      success: true,
      message: "Admin login successful.",
      token,
    });
  } catch (error) {
    console.error("Admin login error:", error.message);
    res.status(500).json({
      success: false,
      message: "Could not log in.",
    });
  }
});

// Verify admin token
function verifyAdmin(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      success: false,
      message: "Access denied. Please log in.",
    });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (decoded.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Admin access required.",
      });
    }

    req.admin = decoded;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Invalid or expired token.",
    });
  }
}

// MySQL connection pool
const db = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: Number(process.env.DB_PORT) || 3306,
  waitForConnections: true,
  connectionLimit: 10,
});

// Test backend
app.get("/", (req, res) => {
  res.json({
    message: "Welcome to the PawConnect API! 🐾",
    status: "Server is running",
  });
});

// Test database connection
app.get("/api/health", async (req, res) => {
  try {
    await db.query("SELECT 1");
    res.json({
      success: true,
      message: "PawConnect backend and database are connected!",
    });
  } catch (error) {
    console.error("Database connection error:", error.message);
    res.status(500).json({
      success: false,
      message: "Database connection failed",
    });
  }
});
 // Get all rescue reports
app.patch(
  "/api/rescue-reports/:id/status",
  verifyAdmin,
  async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const allowedStatuses = ["Pending", "In Progress", "Resolved"];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid report status.",
      });
    }

    const [result] = await db.execute(
      "UPDATE rescue_reports SET status = ? WHERE id = ?",
      [status, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "Rescue report not found.",
      });
    }

    res.json({
      success: true,
      message: "Report status updated successfully.",
    });
  } catch (error) {
    console.error("Error updating report status:", error.message);
    res.status(500).json({
      success: false,
      message: "Could not update report status.",
    });
  }
});

app.delete(
  "/api/rescue-reports/:id",
  verifyAdmin,
  async (req, res) => {
    try {
      const { id } = req.params;

      const [reports] = await db.execute(
        "SELECT photo_url FROM rescue_reports WHERE id = ?",
        [id]
      );

      if (reports.length === 0) {
        return res.status(404).json({
          success: false,
          message: "Rescue report not found.",
        });
      }

      const photoUrl = reports[0].photo_url;

      await db.execute(
        "DELETE FROM rescue_reports WHERE id = ?",
        [id]
      );

      if (photoUrl) {
        const fs = require("fs");
        const path = require("path");
        const photoPath = path.join(
          __dirname,
          photoUrl.replace(/^\/uploads\//, "uploads/")
        );

        fs.unlink(photoPath, (error) => {
          if (error && error.code !== "ENOENT") {
            console.error("Could not delete report photo:", error.message);
          }
        });
      }

      res.json({
        success: true,
        message: "Rescue report deleted successfully.",
      });
    } catch (error) {
      console.error("Error deleting report:", error.message);
      res.status(500).json({
        success: false,
        message: "Could not delete rescue report.",
      });
    }
  }
);

// Get all rescue reports (Admin only)
app.get("/api/admin/rescue-reports", verifyAdmin, async (req, res) => {
  try {
    const [reports] = await db.query(
      "SELECT * FROM rescue_reports ORDER BY created_at DESC"
    );

    res.json({
      success: true,
      reports,
    });
  } catch (error) {
    console.error("Admin fetch reports error:", error.message);

    res.status(500).json({
      success: false,
      message: "Could not fetch rescue reports.",
    });
  }
});

app.get(
  "/api/admin/adoption-listings",
  verifyAdmin,
  async (req, res) => {
    try {
      const [listings] = await db.query(
        "SELECT * FROM adoption_listings ORDER BY created_at DESC"
      );

      res.json({
        success: true,
        listings,
      });
    } catch (error) {
      console.error("Admin adoption listings error:", error.message);
      res.status(500).json({
        success: false,
        message: "Could not fetch adoption listings.",
      });
    }
  }
);
app.delete(
  "/api/admin/adoption-listings/:id",
  verifyAdmin,
  async (req, res) => {
    try {
      const { id } = req.params;

      const [result] = await db.query(
        "DELETE FROM adoption_listings WHERE id = ?",
        [id]
      );

      if (result.affectedRows === 0) {
        return res.status(404).json({
          success: false,
          message: "Adoption listing not found.",
        });
      }

      res.json({
        success: true,
        message: "Adoption listing deleted successfully.",
      });
    } catch (error) {
      console.error("Delete adoption listing error:", error.message);
      res.status(500).json({
        success: false,
        message: "Could not delete adoption listing.",
      });
    }
  }
);

app.patch(
  "/api/admin/adoption-listings/:id/status",
  verifyAdmin,
  async (req, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body;

      const allowedStatuses = ["Pending", "Approved", "Rejected"];

      if (!allowedStatuses.includes(status)) {
        return res.status(400).json({
          success: false,
          message: "Invalid listing status.",
        });
      }

      const [result] = await db.execute(
        "UPDATE adoption_listings SET status = ? WHERE id = ?",
        [status, id]
      );

      if (result.affectedRows === 0) {
        return res.status(404).json({
          success: false,
          message: "Adoption listing not found.",
        });
      }

      res.json({
        success: true,
        message: "Adoption listing status updated successfully.",
      });
    } catch (error) {
      console.error("Adoption listing status error:", error.message);
      res.status(500).json({
        success: false,
        message: "Could not update listing status.",
      });
    }
  }
);


app.get("/api/rescue-reports", async (req, res) => {
  try {
    const [reports] = await db.query(
  `SELECT id, animal_type, description, location, status, created_at
   FROM rescue_reports
   ORDER BY created_at DESC`
);

    res.json({
      success: true,
      reports: reports,
    });
  } catch (error) {
    console.error("Error fetching rescue reports:", error.message);
    res.status(500).json({
      success: false,
      message: "Could not fetch rescue reports.",
    });
  }
});

app.get("/api/adoption-listings", async (req, res) => {
  try {
    const [listings] = await db.query(`
      SELECT
        id,
        animal_name,
        animal_type,
        age,
        gender,
        description,
        location,
        photo_url,
        created_at
      FROM adoption_listings
      WHERE status = 'Approved'
      ORDER BY created_at DESC
    `);

    res.json({
      success: true,
      listings,
    });
  } catch (error) {
    console.error("Error fetching adoption listings:", error.message);
    res.status(500).json({
      success: false,
      message: "Could not fetch adoption listings.",
    });
  }
});


app.post("/api/rescue-reports", upload.single("photo"), async (req, res) => {
  try {
    const {
      reporter_name,
      animal_type,
      description,
      location,
      contact,
    } = req.body;

    if (
      !reporter_name ||
      !animal_type ||
      !description ||
      !location ||
      !contact
    ) {
      return res.status(400).json({
        success: false,
        message: "Please fill in all required fields.",
      });
    }

    const photo_url = req.file
      ? `/uploads/${req.file.filename}`
      : null;

    const sql = `
      INSERT INTO rescue_reports
      (reporter_name, animal_type, description, location, contact, photo_url)
      VALUES (?, ?, ?, ?, ?, ?)
    `;

    const [result] = await db.execute(sql, [
      reporter_name,
      animal_type,
      description,
      location,
      contact,
      photo_url,
    ]);

    res.status(201).json({
      success: true,
      message: "Rescue report saved successfully!",
      reportId: result.insertId,
      photo_url,
    });
  } catch (error) {
    console.error("Error saving rescue report:", error.message);
    res.status(500).json({
      success: false,
      message: "Could not save rescue report.",
    });
  }
});

app.post(
  "/api/adoption-listings",
  upload.single("photo"),
  async (req, res) => {
    try {
      const {
        animal_name,
        animal_type,
        age,
        gender,
        description,
        location,
        contact_name,
        contact,
      } = req.body;

      if (
        !animal_name ||
        !animal_type ||
        !description ||
        !location ||
        !contact_name ||
        !contact
      ) {
        return res.status(400).json({
          success: false,
          message: "Please fill in all required fields.",
        });
      }

      const photo_url = req.file
        ? `/uploads/${req.file.filename}`
        : null;

      const sql = `
        INSERT INTO adoption_listings
        (animal_name, animal_type, age, gender, description,
         location, contact_name, contact, photo_url)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;

      const [result] = await db.execute(sql, [
        animal_name,
        animal_type,
        age || null,
        gender || null,
        description,
        location,
        contact_name,
        contact,
        photo_url,
      ]);

      res.status(201).json({
        success: true,
        message: "Animal listed for adoption successfully!",
        listingId: result.insertId,
      });
    } catch (error) {
      console.error("Adoption listing error:", error.message);
      res.status(500).json({
        success: false,
        message: "Could not submit adoption listing.",
      });
    }
  }
);


// Submit an adoption application
app.post("/api/adoption-applications", async (req, res) => {
  console.log("ADOPTION APPLICATION REQUEST RECEIVED");
  try {
    const {
      animal_name,
      applicant_name,
      email,
      phone,
      reason,
    } = req.body;

    if (
      !animal_name ||
      !applicant_name ||
      !email ||
      !phone ||
      !reason
    ) {
      return res.status(400).json({
        success: false,
        message: "Please fill in all required fields.",
      });
    }

    const sql = `
      INSERT INTO adoption_applications
      (animal_name, applicant_name, email, phone, reason)
      VALUES (?, ?, ?, ?, ?)
    `;

    const [result] = await db.execute(sql, [
      animal_name,
      applicant_name,
      email,
      phone,
      reason,
    ]);
    console.log("New adoption application saved. ID:", result.insertId);

    res.status(201).json({
      success: true,
      message: "Adoption application submitted successfully!",
      applicationId: result.insertId,
    });
  } catch (error) {
    console.error("Adoption application error:", error.message);

    res.status(500).json({
      success: false,
      message: "Could not submit adoption application.",
    });
  }
});
// Get all adoption applications (Admin only)
app.get("/api/adoption-applications", verifyAdmin, async (req, res) => {
  try {
    const [applications] = await db.query(
      "SELECT * FROM adoption_applications ORDER BY created_at DESC"
    );

    res.json({
      success: true,
      applications,
    });
  } catch (error) {
    console.error("Fetch adoption applications error:", error.message);

    res.status(500).json({
      success: false,
      message: "Could not fetch adoption applications.",
    });
  }
});
// Update adoption application status (Admin only)
app.patch("/api/adoption-applications/:id/status", verifyAdmin, async (req, res) => {
  try {
    const { status } = req.body;
    const { id } = req.params;

    const allowedStatuses = ["Pending", "Approved", "Rejected"];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid application status.",
      });
    }

    const [result] = await db.execute(
      "UPDATE adoption_applications SET status = ? WHERE id = ?",
      [status, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "Application not found.",
      });
    }

    res.json({
      success: true,
      message: "Application status updated successfully.",
    });
  } catch (error) {
    console.error("Update application status error:", error.message);

    res.status(500).json({
      success: false,
      message: "Could not update application status.",
    });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`PawConnect server running at http://localhost:${PORT}`);
});
