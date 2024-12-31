import { useState, useEffect } from "react";
import axios from "axios";

function App() {
  const [file, setFile] = useState(null);
  const [password, setPassword] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadedUrl, setUploadedUrl] = useState(null);
  const [snapshotUrl, setSnapshotUrl] = useState(null);
  const [fileName, setFileName] = useState("");
  const [savedData, setSavedData] = useState(null);
  const [allFiles, setAllFiles] = useState([]);
  const [loadingFiles, setLoadingFiles] = useState(false);
  const [passwords, setPasswords] = useState({});
  const [deletePassword, setDeletePassword] = useState("");

  // const API_BASE_URL = "http://localhost:5000"; // Backend URL
  const API_BASE_URL = "https://passbox-backend-express.onrender.com/";

  // Handle file selection
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (
      selectedFile &&
      (selectedFile.type === "image/png" ||
        selectedFile.type === "image/jpeg" ||
        selectedFile.type === "application/pdf")
    ) {
      setFile(selectedFile);
      setFileName(selectedFile.name);
    } else {
      alert("Please upload an image or PDF file.");
    }
  };

  // Handle file upload and saving to backend
  const handleUpload = async () => {
    if (!file || !password) {
      alert("Please select a file and enter a password.");
      return;
    }

    setUploading(true);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", "react_presets");
    formData.append("cloud_name", "djv535hkn");

    try {
      const res = await axios.post(
        `https://api.cloudinary.com/v1_1/djv535hkn/upload`,
        formData
      );
      const fileUrl = res.data.secure_url;

      // Set the snapshot URL based on file type (PDF or Image)
      const snapshotUrl =
        file.type === "application/pdf"
          ? "./assets/pdff.png" // PDF snapshot
          : "./assets/img.png"; // Image snapshot

      // Save the file details (URL, snapshot URL, file name, password) to the backend
      const saveData = {
        fileName,
        fileUrl,
        snapshotUrl,
        password,
      };

      await axios.post(`${API_BASE_URL}/api/saveFileData`, saveData);

      setUploadedUrl(fileUrl);
      setSnapshotUrl(snapshotUrl);
      setUploading(false);
      alert("File uploaded and saved successfully!");
      fetchAllFiles();
    } catch (error) {
      setUploading(false);
      console.error("Error uploading file:", error);
      alert("Failed to upload the file.");
    }
  };

  const fetchAllFiles = async () => {
    setLoadingFiles(true);
    try {
      const response = await axios.get(`${API_BASE_URL}/api/getAllFiles`);
      setAllFiles(response.data.data || []);
      setLoadingFiles(false);
    } catch (error) {
      console.error("Error fetching all files:", error);
      setLoadingFiles(false);
    }
  };

  useEffect(() => {
    fetchAllFiles();
  }, []);

  const handlePasswordCheck = (filePassword, savedPassword, fileUrl) => {
    if (filePassword === savedPassword) {
      window.open(fileUrl, "_blank");
    } else {
      alert("Incorrect password. Please try again.");
    }
  };

  const handlePasswordChange = (index, value) => {
    setPasswords((prev) => ({
      ...prev,
      [index]: value,
    }));
  };

  const handleDeleteAllFiles = async () => {
    if (deletePassword === "Saijam*98") {
      try {
        await axios.post(`${API_BASE_URL}/api/deleteAllFiles`, {
          password: deletePassword,
        });
        setAllFiles([]);
        alert("All files have been deleted.");
      } catch (error) {
        console.error("Error deleting files:", error);
        alert("Failed to delete files.");
      }
    } else {
      alert("Incorrect password. Please try again.");
    }
  };

  return (
    <div className="App bg-gray-100 min-h-screen flex flex-col items-center py-8">
      <h1 className="text-4xl font-bold text-center text-blue-600 mb-8">
        Upload PDF or Image to Cloudinary
      </h1>

      <div className="flex flex-col items-center space-y-4 mb-8 w-full sm:w-96">
        <input
          type="file"
          onChange={handleFileChange}
          className="border border-gray-300 p-2 rounded-lg w-full"
        />
        <input
          type="password"
          placeholder="Enter a password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="border border-gray-300 p-2 rounded-lg w-full"
        />
        <button
          onClick={handleUpload}
          disabled={uploading}
          className="bg-blue-500 text-white p-2 rounded-lg hover:bg-blue-600 w-full disabled:opacity-50"
        >
          {uploading ? "Uploading..." : "Upload"}
        </button>
      </div>

      {uploadedUrl && (
        <div className="mb-8 w-full sm:w-96 text-center">
          <h3 className="text-xl font-semibold text-center mb-4">
            Uploaded File:
          </h3>
          <img
            src={snapshotUrl || uploadedUrl}
            alt="Snapshot"
            className="max-w-xs mx-auto mb-4"
          />
          <a
            href={uploadedUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-500 underline"
          >
            View File
          </a>
        </div>
      )}

      {loadingFiles ? (
        <p className="text-gray-500">Loading files...</p>
      ) : allFiles.length > 0 ? (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 w-full sm:w-96">
            {allFiles.map((file, index) => (
              <div
                key={index}
                className="border p-4 rounded-lg shadow-lg bg-white"
              >
                <p className="font-semibold text-lg">{file.fileName}</p>
                <p className="text-gray-600">Snapshot:</p>
                <img
                  // src={file.snapshotUrl}
                  src="assets/img.png"
                  alt="Snapshot"
                  className="max-w-xs mx-auto mb-4"
                />
                <input
                  type="password"
                  placeholder="Enter password to view"
                  value={passwords[index] || ""}
                  onChange={(e) => handlePasswordChange(index, e.target.value)}
                  className="border border-gray-300 p-2 rounded-lg mb-4 w-full"
                />
                <button
                  onClick={() =>
                    handlePasswordCheck(
                      passwords[index],
                      file.password,
                      file.fileUrl
                    )
                  }
                  className="bg-green-500 text-white p-2 rounded-lg hover:bg-green-600 w-full"
                >
                  View/Download File
                </button>
              </div>
            ))}
          </div>

          <div className="mt-8">
            <input
              type="password"
              placeholder="Enter password to delete all files"
              value={deletePassword}
              onChange={(e) => setDeletePassword(e.target.value)}
              className="border border-gray-300 p-2 rounded-lg mb-4 w-full sm:w-96"
            />
            <button
              onClick={handleDeleteAllFiles}
              className="bg-red-500 text-white p-2 rounded-lg hover:bg-red-600 w-full sm:w-96"
            >
              Delete All Files
            </button>
          </div>
        </>
      ) : (
        <p className="text-gray-500">No files uploaded yet.</p>
      )}
    </div>
  );
}

export default App;
