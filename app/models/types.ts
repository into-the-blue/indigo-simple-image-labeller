export interface ILabeledImage {
  labels: string;
  filename: string;
}
export type TImageExt = '';
export interface IBaseImage {
  filename: string;
  uri: string;
  extname: string;
}

export type IGetStore<T> = () => {
  store: T;
  setStore: <K extends keyof T>(v: Pick<T, K>) => void;
};

export interface IOption {
  value: string;
  annotation: string;
}
export type ILabelObjType = 'checkbox' | 'radio';
export interface ILabelObj {
  type: ILabelObjType;
  options: IOption[];
}

export interface IBoundKey {
  key: string;
  value: string;
}
