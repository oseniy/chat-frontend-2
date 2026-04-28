export const downloadFile = async (fileUrl: string, fileName?: string): Promise<boolean> => {
  try {
    const proxyUrl = `/api/download?url=${encodeURIComponent(fileUrl)}${
      fileName ? `&name=${encodeURIComponent(fileName)}` : ""
    }`;

    const response = await fetch(proxyUrl, {
      method: "GET",
      cache: "no-cache",
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const blob = await response.blob();

    let finalFileName = fileName;
    if (!finalFileName) {
      const urlParts = fileUrl.split("/");
      finalFileName = urlParts[urlParts.length - 1] || "download";

      if (!finalFileName.includes(".")) {
        const contentType = response.headers.get("content-type");
        const extension = contentType?.split("/")[1] || "bin";
        finalFileName += `.${extension}`;
      }
    }

    const blobUrl = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = blobUrl;
    link.download = finalFileName;

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    window.URL.revokeObjectURL(blobUrl);
    return true;
  } catch (error) {
    console.error("Error downloading file:", error);
    return false;
  }
};
