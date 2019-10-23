import { dialog, remote, BrowserWindow } from 'electron';
import { message } from 'antd';
import fs from 'fs-extra';
import Mousetrap from 'mousetrap';
import Path from 'path';
import Moment from 'moment';
import { selectFile, safelyReadFile } from '../../utils';
import { flatten } from 'lodash';
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
function _uniqLabels(labels) {
  return [...new Set(labels)];
}
function extractLabelsFromJson(data, delimiter) {
  return _uniqLabels(
    flatten(data.map(({ labels }) => labels.split(delimiter)))
  );
}
class Presenter {
  fileNames = [];
  startTime = Moment().format('YYYY-MM-DD');
  activePath;
  savingPath;
  fileSavingName = 'labeled-' + this.startTime;
  skippedFileSavingName = 'skipped-' + this.startTime;
  skippedImages = [];
  fileSaingExt = '.json';
  delimiter = ';';
  labeledImages = [];
  _reviewingFile;
  constructor(getStore, viewModel) {
    this.getStore = getStore;
    this.viewModel = viewModel;
  }
  componentDidMount() {}

  selectFolder = async () => {
    try {
      const filePaths = await selectFile('openDirectory');
      if (!filePaths) return;
      if (filePaths[0]) {
        this.loadImagesFromPath(filePaths[0]);
      }
    } catch (err) {
      console.error(err);
    }
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

  /**
   *
   *
   * @memberof Presenter
   * load saved file
   * retrieve labels from file
   */
  loadSavedFile = async () => {
    try {
      if (!this.activePath)
        return message.error('Please choose a folder first');
      const filePaths = await selectFile('openFile');
      if (filePaths[0]) {
        if (!/\.json$/.test(filePaths[0])) {
          return message.error('Only JSON files are supported');
        }
        const data = await safelyReadFile(filePaths[0]);
        this.labeledImages = data;
        const uniqedLabels = extractLabelsFromJson(data, this.delimiter);
        const { setStore } = this.getStore();
        const lastImage = data[data.length - 1];
        const currentIndex =
          this.fileNames.findIndex(o => o === lastImage.filename) + 1;
        setStore({
          currentIndex,
          labelsFromFile: uniqedLabels
        });
      }
    } catch (err) {
      console.error(err);
      message.error('failed to load saved file');
    }
  };

  /**
   *
   *
   * @memberof Presenter
   *
   * read files under the folder
   */
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

  /**
   *
   *
   * @memberof Presenter
   * get image from currentIndex
   */
  getCurrentImage = () => {
    const { currentIndex, mode } = this.getStore().store;
    if (!this.fileNames.length) return null;
    let filename = this.fileNames[currentIndex];
    if (mode === 'review') {
      filename = this.labeledImages[currentIndex].filename;
    }
    return {
      uri: Path.join(this.activePath, filename),
      filename,
      extname: Path.extname(filename)
    };
  };

  saveImageAndLabel = async (filename, labels) => {
    const { currentIndex } = this.getStore().store;
    if (this.isReviewMode) {
      const origin = this.labeledImages[currentIndex];
      if (origin.filename !== filename) {
        message.error(`filename not match ${origin.filename} ${filename}`);
        console.error(`filename not match ${origin.filename} ${filename}`);
      }
      if (
        origin.filename === filename &&
        origin.labels === labels.join(this.delimiter)
      ) {
        message.info('Labels not modified');
        return;
      }
      this.labeledImages[currentIndex].labels = labels.join(this.delimiter);
    } else {
      const doc = {
        filename,
        labels: labels.join(this.delimiter)
      };
      this.labeledImages.push(doc);
    }
    await this.writeFile();
  };

  /**
   *
   *
   * @memberof Presenter
   *
   * write this.labeledImages to json file
   */
  writeFile = async () => {
    if (!this.labeledImages.length) return;
    try {
      // const exist = await fs.exists(this.savedFilePath);
      // if (exist) {
      // } else {
      // }
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

  get isReviewMode() {
    const { store, setStore } = this.getStore();
    const { currentIndex, mode } = store;
    const isReviewMode = mode === 'review';
    return isReviewMode;
  }

  /**
   *
   *
   * @memberof Presenter
   * get last image
   */
  retrieveLastImage = async () => {
    const { store, setStore } = this.getStore();
    const { currentIndex, mode } = store;
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
        if (!this.isReviewMode) {
          this.labeledImages.pop();
        }
        // todo last image display skipped one
        setStore({
          currentIndex: currentIndex - 1
        });
        this.setSelectedLabels(last.labels);
        if (!this.isReviewMode) {
          await this.writeFile();
        }
        hide();
      }
    } catch (err) {
      console.warn('retrieveLastImage', err);
      message.error('retrieveLastImage error');
    }
  };

  setSelectedLabels = labels => {
    if (Array.isArray(labels)) {
      this.viewModel.setSelectedLabels(labels);
    }
    if (typeof labels === 'string') {
      this.viewModel.setSelectedLabels(labels.split(this.delimiter));
    }
  };

  lastImage = async () => {
    const { uri, extname, filename } = this.getCurrentImage();
    const { store, setStore } = this.getStore();
    const { currentIndex } = store;
    if (currentIndex === 0) return message.error('No last image');
    await this.retrieveLastImage();
  };

  /**
   *
   *
   * @memberof Presenter
   * skip one image
   * if review delete 
   */
  skipOne = async () => {
    const { uri, extname, filename } = this.getCurrentImage();
    const { store, setStore, mode } = this.getStore();
    const { currentIndex } = store;
    const maxIndex = this.isReviewMode
      ? this.labeledImages.length - 1
      : this.fileNames.length - 1;
    if (currentIndex < maxIndex) {
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
      if (this.isReviewMode) {
        this.labeledImages.filter((_, idx) => idx !== currentIndex);
        await this.writeFile();
      }
    } else {
      message.error('This is the last image !');
    }
  };

  /**
   *
   *
   * @readonly
   * @memberof Presenter
   * get selected labels
   */
  get selectedLabels() {
    return this.viewModel.getSelectedLabels;
  }

  /**
   *
   *
   * @memberof Presenter
   * reset selected labels
   */
  resetSelectedLabels = () => this.viewModel.resetSelectedLabels();

  /**
   *
   *
   * @memberof Presenter
   * get next image
   */
  nextImage = async () => {
    const { uri, extname, filename } = this.getCurrentImage();
    const { store, setStore } = this.getStore();
    const { currentIndex, modalVisible, mode } = store;

    const maxLength = this.isReviewMode
      ? this.labeledImages.length - 1
      : this.fileNames.length - 1;

    if (!this.selectedLabels.length) {
      return message.error('Please select label !');
    }
    if (!modalVisible) {
      return setStore({
        modalVisible: true
      });
    }
    setStore({
      modalVisible: false
    });
    if (currentIndex < maxLength) {
      // save labeled images
      await this.saveImageAndLabel(filename, this.selectedLabels);
      setStore({
        currentIndex: currentIndex + 1
      });
      if (this.isReviewMode) {
        this.setSelectedLabels(this.labeledImages[currentIndex + 1].labels);
      } else {
        this.resetSelectedLabels();
      }
    } else {
      message.error('This is the last image !');
    }
  };

  get unassignedLabels() {
    const { setStore, store } = this.getStore();
    const { labelsFromFile } = store;
    if (!this.viewModel.getAllLabels) return [];
    return labelsFromFile.filter(v => !this.viewModel.getAllLabels.includes(v));
  }
  /**
   *
   *
   * @memberof Presenter
   * load image from file,
   * review file
   */
  reviewFile = async () => {
    const { setStore, store } = this.getStore();
    try {
      const filePaths = await selectFile('openFile');
      if (filePaths[0]) {
        this._reviewingFile = filePaths[0];
        const data = await safelyReadFile(filePaths[0]);
        this.labeledImages = data;
        const uniqedLabels = extractLabelsFromJson(data, this.delimiter);
        setStore({
          labelsFromFile: uniqedLabels,
          mode: 'review',
          currentIndex: 0
        });
        this.setSelectedLabels(this.labeledImages[0].labels);
      }
    } catch (err) {
      console.error(err);
    }
  };
}

export default Presenter;
