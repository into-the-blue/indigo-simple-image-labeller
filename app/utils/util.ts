import { remote } from 'electron';
import * as fs from 'fs-extra';
import { ILabeledImage } from '../models';

// type = 'openFile' | 'openDirectory'
export const selectFile = (type: 'openFile' | 'openDirectory') => {
  return new Promise((resolve, reject) => {
    const win = remote.getCurrentWindow();
    remote.dialog.showOpenDialog(
      win,
      {
        properties: [type]
      },
      filePaths => {
        if (!filePaths) return reject('no file selected');
        return resolve(filePaths);
      }
    );
  });
};

export const safelyReadFile = async (
  pth: string,
  returnType: 'JSON' = 'JSON'
): Promise<ILabeledImage[] | string> => {
  const data = await fs.readFile(pth, 'utf8');
  if (!data) throw new Error('empty file');
  if (returnType === 'JSON') return JSON.parse(data);
  return data;
};
