import { FileAsset } from '../models/file-asset.model.js';

export interface UploadFileResponse {
  asset: FileAsset;
  message?: string;
}
