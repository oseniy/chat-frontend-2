import { FILE_ACCEPT } from "./constants";

export const openFilePicker = (options?: { multiple?: boolean }): Promise<File[]> => {
  return new Promise((resolve) => {
    const input = document.createElement("input");
    input.type = "file";

    input.accept = FILE_ACCEPT.join(",");
    input.multiple = options?.multiple ?? true;

    input.onchange = () => {
      resolve(input.files ? Array.from(input.files) : []);
    };

    input.click();
  });
};
