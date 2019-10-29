import { dialog, remote, BrowserWindow } from 'electron';
import fs from 'fs-extra';

// type = 'openFile' | 'openDirectory'
export const selectFile = type => {
  return new Promise((resolve, reject) => {
    const win = remote.getCurrentWindow();
    remote.dialog.showOpenDialog(
      win,
      {
        properties: [type]
      },
      filePaths => {
        if (!filePaths) return reject(new Error('no file selected'));
        return resolve(filePaths);
      }
    );
  });
};

export const safelyReadFile = async (pth, returnType = 'JSON') => {
  const data = await fs.readFile(pth, 'utf8');
  if (!data) throw new Error('empty file');
  if (returnType === 'JSON') return JSON.parse(data);
  return data;
};
