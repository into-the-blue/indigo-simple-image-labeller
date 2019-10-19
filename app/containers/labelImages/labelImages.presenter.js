import { dialog, remote, BrowserWindow } from 'electron';
import { message } from 'antd';
import fs from 'fs-extra';
import Mousetrap from 'mousetrap';
import Path from 'path';
import Moment from 'moment';
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
  fileNames = [];
  startTime = Moment().format('YYYY-MM-DD-HH:MM:SS');
  activePath;
  savingPath;
  fileSavingName = 'labeled-' + this.startTime;
  skippedFileSavingName = 'skipped-' + this.startTime;
  skippedImages = [];
  fileSaingExt = '.json';
  delimiter = ';';
  labeledImages = [];
  constructor(getStore, viewModel) {
    this.getStore = getStore;
    this.viewModel = viewModel;
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
        if (!filePaths) return;
        if (filePaths[0]) {
          this.loadImagesFromPath(filePaths[0]);
        }
      }
    );
  };
  get savedFilePath() {
    return Path.join(this.savingPath, this.fileSavingName + this.fileSaingExt);
  }
  get skippedFilePath() {
    return Path.join(
      this.savingPath,
      this.skippedFileSavingName + this.fileSaingExt
    );
  }
  loadSavedFile = async () => {
    try {
      if (!this.activePath)
        return message.error('Please choose a folder first');
      const win = remote.getCurrentWindow();
      remote.dialog.showOpenDialog(
        win,
        {
          properties: ['openFile']
        },
        async filePaths => {
          if (!filePaths) return;
          if (filePaths[0]) {
            if (!/\.json$/.test(filePaths[0])) {
              return message.error('Only JSON files are supported');
            }
            let data = await fs.readFile(filePaths[0], 'utf8');
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
              this.fileNames.findIndex(o => o === lastImage.filename) + 1;
            setStore({
              currentIndex,
              options: [...allLabels]
            });
          }
        }
      );
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
      this.fileNames = verifyImages(filenames);
      this.getStore().setStore({
        imageCount: filenames.length,
        activeDir: path
      });
      hide();
      message.success(
        `Files loaded, Total ${filenames.length}, Invalid ${filenames.length -
          this.fileNames.length}`
      );
    } catch (err) {
      message.error('Failed to open directory');
    }
  };

  getCurrentImage = () => {
    const { currentIndex } = this.getStore().store;
    if (!this.fileNames.length) return null;
    const filename = this.fileNames[currentIndex];
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
    console.log(filename, labels);
    this.labeledImages.push(doc);
    await this.writeFile();
  };

  writeFile = async () => {
    if (!this.labeledImages.length) return;
    try {
      const exist = await fs.exists(this.savedFilePath);
      if (exist) {
      } else {
      }
      await fs.writeFile(
        this.savedFilePath,
        JSON.stringify(this.labeledImages),
        'utf8'
      );
    } catch (err) {
      console.warn('writeFile', err);
      message.error('Failed to write file');
    }
  };

  retrieveLastImage = async () => {
    const { store, setStore } = this.getStore();
    const { currentIndex } = store;
    const hide = message.loading();
    try {
      if (!(await fs.exists(this.savedFilePath))) {
        return message.error('File not exists!');
      }
      let data = await fs.readFile(this.savedFilePath, 'utf8');
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
      // const expectedLastFilename = this.fileNames[currentIndex - 1];
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
        // todo last image display skipped one
        setStore({
          currentIndex: currentIndex - 1
        });
        this.viewModel.setSelectedLabels(last.labels.split(this.delimiter));
        await this.writeFile();
        hide();
      }
    } catch (err) {
      console.warn('retrieveLastImage', err);
      message.error('retrieveLastImage error');
    }
  };

  lastImage = async () => {
    const { uri, extname, filename } = this.getCurrentImage();
    const { store, setStore } = this.getStore();
    const { currentIndex } = store;
    if (currentIndex === 0) return message.error('No last image');
    await this.retrieveLastImage();
  };

  skipOne = async () => {
    const { uri, extname, filename } = this.getCurrentImage();
    const { store, setStore } = this.getStore();
    const { currentIndex } = store;
    if (currentIndex < this.fileNames.length - 1) {
      setStore({
        currentIndex: currentIndex + 1
      });
      message.info('Skipped');
      if (!this.skippedImages.includes(filename)) {
        this.skippedImages.push(filename);
        await fs
          .writeFile(
            this.skippedFilePath,
            JSON.stringify(this.skippedImages),
            'utf8'
          )
          .catch(err => {
            message.error('Failed to save skipped filenames');
          });
      }
    } else {
      message.error('This is the last image !');
    }
  };

  get selectedLabels() {
    return this.viewModel.getSelectedLabels;
  }
  resetSelectedLabels = () => this.viewModel.resetSelectedLabels();
  nextImage = async () => {
    const { uri, extname, filename } = this.getCurrentImage();
    const { store, setStore } = this.getStore();
    const { currentIndex, modalVisible } = store;
    if (!this.selectedLabels.length)
      return message.error('Please select label !');
    if (!modalVisible) {
      return setStore({
        modalVisible: true
      });
    }
    setStore({
      modalVisible: false
    });
    if (currentIndex < this.fileNames.length - 1) {
      await this.saveImageAndLabel(filename, this.selectedLabels);
      setStore({
        currentIndex: currentIndex + 1
      });
      this.resetSelectedLabels();
    } else {
      message.error('This is the last image !');
    }
  };
}

export default Presenter;
