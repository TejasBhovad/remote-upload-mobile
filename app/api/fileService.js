// Store files
export const storeFiles = async (files) => {
  const apiUrl = "https://remoteupload.vercel.app";

  const response = await fetch(`${apiUrl}/api/expo/files`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ files }),
  });
  console.log("response from storeFiles", response);

  if (!response.ok) {
    throw new Error(`Error storing files: ${response.status}`);
  }

  return response.json();
};

// Get files by code
export const getFiles = async (code) => {
  const apiUrl = "https://remoteupload.vercel.app";

  try {
    const response = await fetch(`${apiUrl}/api/expo/files?code=${code}`);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        `Error getting files: ${response.status} ${errorData.error || ""}`
      );
    }

    return response.json();
  } catch (error) {
    console.error("Failed to fetch files:", error);
    throw error;
  }
};

// Check if code exists
export const checkCode = async (code) => {
  const apiUrl = "https://remoteupload.vercel.app";

  const response = await fetch(`${apiUrl}/api/expo/exist?code=${code}`);

  if (!response.ok) {
    throw new Error(`Error checking code: ${response.status}`);
  }

  return response.json();
};

// Delete code
export const deleteFiles = async (code) => {
  const apiUrl = "https://remoteupload.vercel.app";

  const response = await fetch(`${apiUrl}/api/expo/files?code=${code}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    throw new Error(`Error deleting files: ${response.status}`);
  }

  return response.json();
};
