export const api = {
  compress: async (file: File, algorithm: string) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("algorithm", algorithm);

    const res = await fetch("/api/compress", {
      method: "POST",
      body: formData
    });

    return res.json();
  }
};
