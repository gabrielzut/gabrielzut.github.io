export interface File {
  name: string;
  type: string;
  size: number;
}

export interface Folder extends File {
  type: "folder";
  files: GeneralFile[];
}

export type GeneralFile = File | Folder;
