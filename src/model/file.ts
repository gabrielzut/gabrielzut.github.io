export interface File {
  name: string;
  type: string;
  icon?: string;
  content: string;
}

export interface Folder extends Omit<File, "content"> {
  type: "folder";
  files: GeneralFile[];
}

export type GeneralFile = File | Folder;
