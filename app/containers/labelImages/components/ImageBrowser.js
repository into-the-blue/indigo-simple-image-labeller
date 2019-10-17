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
    const { image, lastImage, skipOne, nextImage } = this.props;
    const { uri, extname, filename } = image;
    return (
      <div>
        <img
          src={uri}
          style={{ width: '100%', objectFit: 'contain' }}
          alt={'img'}
        />
        <div
          className={styles.rowCenter}
          style={{ justifyContent: 'space-between', width: '100%' }}
        >
          <Button onClick={() => lastImage(image)}>{'⬅️ or ⬆️ Last'}</Button>
          <Button onClick={() => skipOne(image)}>{'Skip space+space'}</Button>
          <Button onClick={() => nextImage(image)}>{'Next ⬇️ or ➡️'}</Button>
        </div>
      </div>
    );
  }
}

export default ImageBrowser;
