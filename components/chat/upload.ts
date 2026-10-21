"use client";
// Файлыг supplier-backend-ээр дамжуулж танай Azure Blob (uploadToAzure) -д хадгална.
import type { Attachment } from "@/lib/chat/types";
import { chatApi } from "./api";

function imageSize(file: File): Promise<{ width: number; height: number } | null> {
  return new Promise((resolve) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      resolve({ width: img.naturalWidth, height: img.naturalHeight });
      URL.revokeObjectURL(url);
    };
    img.onerror = () => {
      resolve(null);
      URL.revokeObjectURL(url);
    };
    img.src = url;
  });
}

export async function uploadChatFile(file: File): Promise<Attachment> {
  const r = await chatApi.upload(file);
  const isImage = r.type.startsWith("image/");
  const dims = isImage ? await imageSize(file) : null;
  return { url: r.url, name: r.name, size: r.size, type: r.type, isImage, ...(dims ?? {}) };
}
