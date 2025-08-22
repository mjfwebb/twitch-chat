import { useState } from 'react';

import './ChatSettings.less';

export const ChatSettings = ({ chatUrl, setChatUrl }: { chatUrl: string; setChatUrl: (url: string) => void }) => {
  const [backgroundColor, setBackgroundColor] = useState('');
  const [fontSize, setFontSize] = useState('');

  const handleUpdateUrl = () => {
    const url = new URL(chatUrl);
    if (backgroundColor) url.searchParams.set('background-color', backgroundColor);
    if (fontSize) url.searchParams.set('font-size', fontSize);
    setChatUrl(url.toString());
  };

  const handleParseUrl = (existingUrl: string) => {
    const url = new URL(existingUrl);
    setBackgroundColor(url.searchParams.get('background-color') || '');
    setFontSize(url.searchParams.get('font-size') || '');
  };

  return (
    <details className="chat-settings">
      <summary>Customise look and feel</summary>
      <p>
        <label htmlFor="chat-url">If you already have a URL and want to update it, enter it here so we can get the settings:</label>
        <input name="chat-url" type="text" value={chatUrl} readOnly />
        <button onClick={() => handleParseUrl(chatUrl)} className="button-secondary">
          Load existing URL
        </button>
      </p>
      <label htmlFor="background-color">Background Color:</label>
      <input type="text" placeholder="#000000" value={backgroundColor} onChange={(e) => setBackgroundColor(e.target.value)} />
      <label htmlFor="font-size">Font Size:</label>{' '}
      <input type="text" placeholder="18px" value={fontSize} onChange={(e) => setFontSize(e.target.value)} />
      <button onClick={handleUpdateUrl}>Update Chat URL</button>
    </details>
  );
};
