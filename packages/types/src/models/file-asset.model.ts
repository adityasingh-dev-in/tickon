import { SafeUser } from './user.model.js';

export interface FileAsset {
  id: string;
  publicId: string;
  secureUrl: string;
  fileName: string;
  fileSize: number;
  fileType: string;
  resourceType: string;
  taskId: string;
  uploadedById: string | null;
  createdAt: Date | string;
}

export interface FileAssetWithUploader extends FileAsset {
  uploadedBy?: SafeUser | null;
}
