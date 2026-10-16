import { ParsedResumeResponse, TailoredResumeResponse, CustomizationOptions } from "../types/resume";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export async function checkBackendHealth() {
  try {
    const res = await fetch(`${API_BASE}/api/health`, { method: "GET" });
    if (!res.ok) return { online: false };
    const data = await res.json();
    return { online: true, ...data };
  } catch {
    return { online: false };
  }
}

export async function parseResumeFile(file: File): Promise<ParsedResumeResponse> {
  const formData = new FormData();
  formData.append("file", file);

  const res = await fetch(`${API_BASE}/api/parse-resume`, {
    method: "POST",
    body: formData,
  });

  if (!res.ok) {
    let errorMsg = "Failed to parse resume";
    try {
      const errData = await res.json();
      errorMsg = errData.detail || errorMsg;
    } catch {
      // ignore
    }
    throw new Error(errorMsg);
  }

  return res.json();
}

export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const res = reader.result as string;
      const base64 = res.split(",")[1] || "";
      resolve(base64);
    };
    reader.onerror = (error) => reject(error);
  });
}

export async function tailorResume(payload: {
  resume_text: string;
  job_description: string;
  candidate_name?: string;
  candidate_email?: string;
  candidate_phone?: string;
  candidate_location?: string;
  candidate_linkedin?: string;
  candidate_github?: string;
  candidate_portfolio?: string;
  pdf_base64?: string;
  pdf_filename?: string;
  options: CustomizationOptions;
}): Promise<TailoredResumeResponse> {
  const res = await fetch(`${API_BASE}/api/tailor-resume`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    let errorMsg = "Failed to customize resume";
    try {
      const errData = await res.json();
      errorMsg = errData.detail || errorMsg;
    } catch {
      // ignore
    }
    throw new Error(errorMsg);
  }

  return res.json();
}

export async function downloadDocxFile(resumeData: TailoredResumeResponse, filename: string = "tailored_resume.docx") {
  const res = await fetch(`${API_BASE}/api/export/docx`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      resume_data: resumeData,
      filename: filename,
    }),
  });

  if (!res.ok) {
    throw new Error("Failed to generate DOCX file");
  }

  const blob = await res.blob();
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.URL.revokeObjectURL(url);
}

export function downloadPlainText(content: string, filename: string = "tailored_resume.txt") {
  const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.URL.revokeObjectURL(url);
}
