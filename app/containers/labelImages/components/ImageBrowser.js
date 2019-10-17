import React from 'react';
import { Button } from 'antd';
import styles from '../labelImages.css';
import Mousetrap from 'mousetrap';
class ImageBrowser extends React.Component {
  componentDidMount() {
    this._initKeyboardListener();
  }
  _initKeyboardListener = () => {
    const { lastImage, skipOne, nextImage, image } = this.props;
    Mousetrap.bind('left', () => lastImage(image));
    Mousetrap.bind('up', () => lastImage(image));

    Mousetrap.bind('space space', () => skipOne(image));

    Mousetrap.bind('right', () => nextImage(image));
    Mousetrap.bind('down', () => nextImage(image));
  };
  render() {
    const { image } = this.props;
    const { uri, extname, filename } = image;
    return (
      <div>
        <img src={uri} style={{ width: '100%' }} alt={'img'} />
        <div
          className={styles.rowCenter}
          style={{ justifyContent: 'space-between', width: '100%' }}
        >
          <Button>{'⬅️ or ⬆️ Last'}</Button>
          <Button>{'Skip space+space'}</Button>
          <Button>{'Next ⬇️ or ➡️'}</Button>
        </div>
      </div>
    );
  }
}

export default ImageBrowser;
