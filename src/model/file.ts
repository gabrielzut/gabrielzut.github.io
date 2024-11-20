export interface File {
  name: string;
  type: string;
  icon?: string;
  content: string;
  command?: Function;
}

export interface Folder extends Omit<Omit<File, "content">, "command"> {
  type: "folder";
  files: GeneralFile[];
}

export type GeneralFile = File | Folder;
