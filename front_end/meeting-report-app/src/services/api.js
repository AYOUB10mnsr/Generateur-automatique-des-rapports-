import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://127.0.0.1:8000",
  timeout: 120000,
});

api.interceptors.request.use((config) => {
  console.log(`[API][REQ] ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`);
  return config;
});

api.interceptors.response.use(
  (r) => {
    console.log(`[API][RES] ${r.status} ${r.config.url}`);
    return r.data;
  },
  (e) => {
    if (e?.code === "ECONNABORTED") {
      const timeoutMessage =
        "La requête a dépassé 120 secondes. Le traitement est long, veuillez réessayer.";
      console.error("[API][ERR][TIMEOUT]", e?.config?.url, timeoutMessage);
      return Promise.reject(new Error(timeoutMessage));
    }
    const detail = e?.response?.data?.detail;
    if (e?.response?.status === 409) {
      return Promise.reject(new Error("Le rapport est encore en cours de génération, veuillez patienter."));
    }
    const message =
      typeof detail === "string"
        ? detail
        : typeof detail?.message === "string"
          ? detail.message
        : Array.isArray(detail)
          ? detail.map((x) => x?.msg).filter(Boolean).join(", ")
          : e?.message || "Request failed";
    console.error("[API][ERR]", e?.response?.status, e?.config?.url, message);
    return Promise.reject(new Error(message));
  }
);

export const apiHealth = () => api.get("/health");

export const processMeeting = ({ file, youtubeUrl, lang = "auto" }) => {
  if (file) {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("lang", lang);
    return api.post("/process/file", formData);
  }
  if (youtubeUrl) {
    const formData = new FormData();
    formData.append("url", youtubeUrl);
    formData.append("lang", lang);
    return api.post("/process/youtube", formData);
  }
  return Promise.reject(new Error("Please provide file or youtubeUrl"));
};

export const listReports = () => api.get("/reports");
export const getReportById = (id) => api.get(`/reports/${id}`);
export const getReportStatus = (id) => api.get(`/reports/${id}/status`);
export const deleteReportById = (id) => api.delete(`/reports/${id}`);
export const downloadReportPdf = (id) => api.get(`/reports/${id}/pdf`, { responseType: "blob" });
export const getAnalytics = () => api.get("/analytics");

export const listSpeakers = () => api.get("/speakers");
export const registerSpeaker = ({ name, samples }) => {
  const fd = new FormData();
  fd.append("name", name);
  if (samples?.[0]) fd.append("file", samples[0]);
  return api.post("/speakers/register", fd);
};
export const deleteSpeakerById = (id) => api.delete(`/speakers/${id}`);
export const renameSpeakerById = (id, name) => api.patch(`/speakers/${id}`, { name });
export const addSpeakerSamples = (id, samples) => {
  const fd = new FormData();
  if (samples?.[0]) fd.append("file", samples[0]);
  return api.post(`/speakers/${id}/samples`, fd);
};

// Legacy compatibility helpers used by old pages
export const processYouTubeVideo = async (url, lang = "auto") => {
  const data = await processMeeting({ youtubeUrl: url, lang });
  return { success: true, ...data };
};

export const processLocalMediaFile = async (file, lang = "auto") => {
  const data = await processMeeting({ file, lang });
  return { success: true, ...data };
};

export const processTextNotes = async () => {
  throw new Error("Text-only processing is not supported by current backend routes.");
};

export const downloadReportDocx = async (payload) => {
  const reportId = payload?.report_id || payload?.reportId;
  if (!reportId) {
    throw new Error("No report id available for download.");
  }
  return downloadReportPdf(reportId);
};

export default api;
