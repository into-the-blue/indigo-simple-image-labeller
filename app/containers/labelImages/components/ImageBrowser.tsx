import * as React from 'react';
import { Button } from 'antd';
import '../labelImages.css';
import * as Mousetrap from 'mousetrap';
import { IBaseImage } from '../../../models';

interface IProps {
  lastImage: () => void;
  skipOne: () => void;
  nextImage: () => void;
  image: IBaseImage;
}
class ImageBrowser extends React.Component<IProps> {
  componentDidMount() {
    this._initKeyboardListener();
  }
  _initKeyboardListener = () => {
    const { lastImage, skipOne, nextImage, image } = this.props;
    Mousetrap.bind('left', lastImage);
    Mousetrap.bind('up', lastImage);

    Mousetrap.bind('space space', skipOne);

    Mousetrap.bind('right', nextImage);
    Mousetrap.bind('down', nextImage);
  };
  render() {
    const { image, lastImage, skipOne, nextImage } = this.props;
    const { uri, extname, filename } = image;
    return (
      <div>
        <div className={'rowCenter'}>
          <h3>{'filename: ' + filename}</h3>
        </div>
        <img
          src={uri}
          style={{ width: '100%', objectFit: 'contain' }}
          alt={'img'}
        />
        <div
          className={'rowCenter'}
          style={{ justifyContent: 'space-between', width: '100%' }}
        >
          <Button onClick={lastImage}>{'⬅️ or ⬆️ Last'}</Button>
          <Button onClick={skipOne}>{'Skip space+space'}</Button>
          <Button onClick={nextImage}>{'Next ⬇️ or ➡️'}</Button>
        </div>
      </div>
    );
  }
}

export default ImageBrowser;
