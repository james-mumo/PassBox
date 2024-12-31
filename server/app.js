const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const dotenv = require("dotenv");

// Load environment variables from .env file
dotenv.config();

// MongoDB Atlas connection URL from environment variables
const mongoDBURI =
  process.env.MONGODB_URI ||
  "mongodb+srv://98kithome:98kithome@cluster0.ijx96ju.mongodb.net/flipload";

// Connect to MongoDB (deprecated options removed)
mongoose
  .connect(mongoDBURI)
  .then(() => console.log("Connected to MongoDB Atlas"))
  .catch((err) => console.error("Error connecting to MongoDB Atlas:", err));

// Define a Mongoose schema for file data
const fileDataSchema = new mongoose.Schema({
  fileName: { type: String, required: true },
  fileUrl: { type: String, required: true },
  snapshotUrl: { type: String }, // Optional field for snapshots
  password: { type: String, required: true },
});

const FileData = mongoose.model("FileData", fileDataSchema);

const app = express();
app.use(cors());
app.use(express.json());

// POST endpoint to save file data to MongoDB
app.post("/api/saveFileData", async (req, res) => {
  const { fileName, fileUrl, snapshotUrl, password } = req.body;

  // Validate required fields
  if (!fileName || !fileUrl || !password) {
    return res.status(400).json({ message: "Missing required fields." });
  }

  try {
    const fileData = new FileData({ fileName, fileUrl, snapshotUrl, password });
    const savedFile = await fileData.save();

    console.log("File data saved:", savedFile); // Log to check the saved file

    res.status(201).json({
      message: "File data saved successfully.",
      data: savedFile,
    });
  } catch (error) {
    console.error("Error saving file data:", error);
    res.status(500).json({
      message: "Internal server error.",
      error: error.message,
    });
  }
});

// GET endpoint to fetch all saved file data
app.get("/api/getAllFiles", async (req, res) => {
  try {
    const allFiles = await FileData.find();
    console.log("Fetched files:", allFiles); // Log fetched files

    if (!allFiles || allFiles.length === 0) {
      return res.status(404).json({ message: "No files found." });
    }

    res.status(200).json({
      message: "Files fetched successfully.",
      data: allFiles, // Return the array of files
    });
  } catch (error) {
    console.error("Error fetching files:", error);
    res.status(500).json({
      message: "Internal server error.",
      error: error.message,
    });
  }
});

app.post("/api/deleteAllFiles", async (req, res) => {
  const { password } = req.body;

  // Check if the provided password is correct
  if (password !== "Saijam*98") {
    return res.status(403).json({ message: "Incorrect password." });
  }

  try {
    // Delete all files from the database
    const deletedFiles = await FileData.deleteMany();

    if (deletedFiles.deletedCount === 0) {
      return res.status(404).json({ message: "No files to delete." });
    }

    res.status(200).json({
      message: `${deletedFiles.deletedCount} file(s) deleted successfully.`,
    });
  } catch (error) {
    console.error("Error deleting files:", error);
    res.status(500).json({
      message: "Internal server error.",
      error: error.message,
    });
  }
});

// GET endpoint to fetch a single file by ID (optional feature)
app.get("/api/getFile/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const file = await FileData.findById(id);
    if (!file) {
      return res.status(404).json({ message: "File not found." });
    }

    res.status(200).json({
      message: "File fetched successfully.",
      data: file,
    });
  } catch (error) {
    console.error("Error fetching file:", error);
    res.status(500).json({
      message: "Internal server error.",
      error: error.message,
    });
  }
});

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
