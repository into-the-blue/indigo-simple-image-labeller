import { dialog, remote, BrowserWindow } from 'electron';
import { message } from 'antd';
import fs from 'fs-extra';
import Mousetrap from 'mousetrap';
import Path from 'path';
const IMAGE_EXT = /\.(bmp|jpg|jpeg|png|tif|gif|pcx|tga|exif|fpx|svg|psd|cdr|pcd|dxf|ufo|eps|ai|raw|wmf|webp)+$/;
function verifyImages(filenames) {
  const arr = [];
  for (let i = 0; i < filenames.length; i++) {
    if (IMAGE_EXT.test(filenames[i].toLowerCase().trim())) {
      arr.push(filenames[i]);
    }
  }
  return arr;
}
class Presenter {
  imageNames = [];
  activePath;
  savingPath;
  fileSavingName = 'labeled';
  fileSaingExt = '.json';
  delimiter = ';';
  labeledImages = [];
  constructor(getStore) {
    this.getStore = getStore;
  }
  componentDidMount() {}

  selectFolder = () => {
    const win = remote.getCurrentWindow();
    remote.dialog.showOpenDialog(
      win,
      {
        properties: ['openDirectory']
      },
      filePaths => {
        // console.log(filePaths);
        if (filePaths[0]) {
          this.loadImagesFromPath(filePaths[0]);
        }
      }
    );
  };
  get savedFilePath() {
    return Path.join(this.savingPath, this.fileSavingName + this.fileSaingExt);
  }
  loadSavedFile = async () => {
    try {
      if (!this.activePath)
        return message.error('Please choose a folder first');
      const exist = await fs.exists(this.savedFilePath);
      if (!exist) return message.error('Saved file not found');
      let data = await fs.readFile(this.savedFilePath, 'utf8');
      if (!data) return message.error('No data in file');
      data = JSON.parse(data);
      this.labeledImages = data;
      const allLabels = new Set();
      for (let i = 0; i < data.length; i++) {
        const { labels } = data[i];
        labels.split(this.delimiter).forEach(o => allLabels.add(o));
      }
      const { setStore } = this.getStore();
      const lastImage = data[data.length - 1];
      const currentIndex =
        this.imageNames.findIndex(o => o === lastImage.filename) + 1;
      setStore({
        currentIndex,
        options: [...allLabels]
      });
    } catch (err) {
      console.error(err);
      message.error('load saved file');
    }
  };
  loadImagesFromPath = async path => {
    try {
      const hide = message.loading('Reading files');
      this.activePath = path;
      this.savingPath = Path.join(path, '../');
      const filenames = await fs.readdir(path);
      this.imageNames = verifyImages(filenames);
      this.getStore().setStore({
        imageCount: filenames.length,
        activeDir: path
      });
      hide();
      message.success(
        `Files loaded, Total ${filenames.length}, Invalid ${filenames.length -
          this.imageNames.length}`
      );
    } catch (err) {
      message.error('Failed to open directory');
    }
  };

  onChangeOption = selected => {
    this.getStore().setStore({
      selectedOptions: selected
    });
  };
  _selectOption = value => {
    const { store, setStore } = this.getStore();
    const { selectedOptions } = store;
    if (selectedOptions.includes(value)) {
      setStore({
        selectedOptions: selectedOptions.filter(o => o !== value)
      });
    } else {
      setStore({
        selectedOptions: selectedOptions.concat(value)
      });
    }
  };
  onPressAdd = tag => {
    const { store, setStore } = this.getStore();
    const { options } = store;
    if (options.includes(tag)) return;
    setStore({
      options: options.concat(tag)
    });
  };

  /**
   *
   *
   * @memberof Presenter
   * updated :{
   * kv:{
   * key,
   * value
   * }
   * operation:'add' | 'delete'
   * }
   */
  onChangeBoundKey = (boundKeys, updated) => {
    const { store, setStore } = this.getStore();
    setStore({ boundKeys });
    const {
      kv: { key, value },
      operation
    } = updated;
    if (operation === 'add') {
      Mousetrap.bind(key, () => this._selectOption(value));
    } else {
      Mousetrap.unbind(key);
    }
  };
  getCurrentImage = index => {
    if (!this.imageNames.length) return null;
    const filename = this.imageNames[index];
    return {
      uri: Path.join(this.activePath, filename),
      filename,
      extname: Path.extname(filename)
    };
  };

  saveImageAndLabel = async (filename, labels) => {
    const doc = {
      filename,
      labels: labels.join(this.delimiter)
    };
    this.labeledImages.push(doc);
    await this.writeFile();
  };

  writeFile = async () => {
    if (!this.labeledImages.length) return;
    const savingPath = Path.join(
      this.savingPath,
      this.fileSavingName + this.fileSaingExt
    );
    try {
      const exist = await fs.exists(savingPath);
      if (exist) {
      } else {
      }
      fs.writeFile(savingPath, JSON.stringify(this.labeledImages), 'utf8');
    } catch (err) {
      console.warn('writeFile', err);
      message.error('Failed to write file');
    }
  };

  retrieveLastImage = async () => {
    const { store, setStore } = this.getStore();
    const { selectedOptions, currentIndex } = store;
    const hide = message.loading();
    try {
      const savingPath = Path.join(
        this.savingPath,
        this.fileSavingName + this.fileSaingExt
      );
      if (!(await fs.exists(savingPath))) {
        return message.error('File not exists!');
      }
      let data = await fs.readFile(savingPath, 'utf8');
      if (!data) {
        return message.error('No data found in the file');
      }
      data = JSON.parse(data);
      if (!Array.isArray(data)) {
        return message.error('Data is not type of array');
      }
      const last = data[data.length - 1];
      if (!last) {
        return message.error('Last element not exists');
      }
      // const expectedLastFilename = this.imageNames[currentIndex - 1];
      const savedLastFilename = this.labeledImages[
        this.labeledImages.length - 1
      ].filename;
      if (!(last.filename.trim() === savedLastFilename.trim())) {
        message.error(
          `Expect saved last filename ${savedLastFilename}, actual filename ${
            last.filename
          }`
        );
        console.error(savedLastFilename, last.filename);
      } else {
        this.labeledImages.pop();
        setStore({
          currentIndex: currentIndex - 1,
          selectedOptions: last.labels.split(this.delimiter)
        });
        await this.writeFile();
        hide();
      }
    } catch (err) {
      console.warn('retrieveLastImage', err);
      message.error('retrieveLastImage error');
    }
  };

  lastImage = async ({ uri, extname, filename }) => {
    const { store, setStore } = this.getStore();
    const { selectedOptions, currentIndex } = store;
    if (currentIndex === 0) return message.error('No last image');
    await this.retrieveLastImage();
  };

  skipOne = ({ uri, extname, filename }) => {
    const { store, setStore } = this.getStore();
    const { selectedOptions, currentIndex } = store;
    if (currentIndex < this.imageNames.length - 1) {
      setStore({
        currentIndex: currentIndex + 1
      });
    } else {
      message.error('This is the last image !');
    }
  };

  nextImage = async ({ uri, extname, filename }) => {
    const { store, setStore } = this.getStore();
    const { selectedOptions, currentIndex } = store;
    if (!selectedOptions.length) return message.error('Please select label !');
    if (currentIndex < this.imageNames.length - 1) {
      await this.saveImageAndLabel(filename, selectedOptions);
      setStore({
        currentIndex: currentIndex + 1,
        selectedOptions: []
      });
    } else {
      message.error('This is the last image !');
    }
  };
}

export default Presenter;
