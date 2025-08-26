import { useEffect, useState } from 'react';
import { Button } from '../../components/Button/Button';
import { useToast } from '../../components/Toast/useToast';
import { TWITCH_AUTH_URL } from '../../constants';
import { persistedStore, store } from '../../store/store';
import { ChatSettings } from './ChatSettings';

import './TwitchConnectPage.less';

const CopyToClipboardButton = ({ text }: { text: string }) => {
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setSuccess(false), 2000);
    return () => clearTimeout(timer);
  }, [success]);

  const handleCopy = () => {
    navigator.clipboard.writeText(text).then(
      () => {
        setSuccess(true);
      },
      () => {
        setSuccess(false);
      },
    );
  };
  return (
    <Button onClick={handleCopy} type="secondary">
      {success ? 'Copied!' : 'Copy URL'}
    </Button>
  );
};

export const TwitchConnectPage = () => {
  const accessToken = persistedStore((s) => s.accessToken);
  const userId = store((s) => s.userId);
  const userLogin = store((s) => s.userLogin);
  const clientId = store((s) => s.clientId);
  const baseOverlayURL = `${import.meta.env.VITE_BASE_URI}/chat?access_token=${accessToken}`;
  const [chatUrl, setChatUrl] = useState(baseOverlayURL);
  const [channelName, setChannelName] = useState('');
  const toast = useToast();

  const handleLogin = () => {
    const generatedStateValue = Math.random().toString(36).substring(2, 15);
    persistedStore.getState().setAuthStateValue(generatedStateValue);
    const authStateValue = persistedStore.getState().authStateValue;
    window.location.assign(
      `${TWITCH_AUTH_URL}authorize?response_type=token&client_id=${clientId}&redirect_uri=${import.meta.env.VITE_AUTH_REDIRECT_URI}&scope=user%3Aread%3Achat&state=${authStateValue}`,
    );
  };

  const handleLogout = () => {
    persistedStore.getState().setAccessToken('');
    store.getState().reset();
    window.location.assign('/');
  };

  const handleChannelNameChange = () => {
    if (channelName === '') {
      return;
    }
    const url = new URL(chatUrl);
    url.searchParams.set('channel', channelName);
    setChatUrl(url.toString());

    toast.showToast('Channel updated!');
  };

  if (accessToken && userLogin && userId) {
    return (
      <div className="twitch-connect-page">
        <div className="twitch-connect-page-info-box">
          <span>
            You are <strong>now connected</strong> to Twitch as{' '}
            <strong>
              {userLogin} ({userId})
            </strong>
          </span>
          <Button type="ghost" onClick={handleLogout}>
            Disconnect
          </Button>
        </div>
        <section className="add-to-obs">
          <h2>Add as a browser source in OBS</h2>
          <ol>
            <li>Open OBS and go to the Sources panel.</li>
            <li>Click the "+" button to add a new source.</li>
            <li>Select "Browser" from the list of source types.</li>
            <li>Create a new browser source</li>
            <li>Paste the following URL into the URL field:</li>
          </ol>
          <div className="twitch-connect-page-url-container">
            <code>{chatUrl}</code> <CopyToClipboardButton text={chatUrl} />{' '}
            <a href={chatUrl} target="_blank">
              Open in new tab
            </a>
          </div>
          <div className="twitch-connect-page-change-channel-wrapper">
            <p>Optionally set a channel so you can watch someone else's Twitch chat:</p>
            <div className="twitch-connect-page-change-channel">
              <input type="text" placeholder="Enter channel name" onChange={(e) => setChannelName(e.target.value)} />
              <Button type="secondary" onClick={handleChannelNameChange}>
                Set channel name
              </Button>
            </div>
          </div>
        </section>
        <ChatSettings chatUrl={chatUrl} setChatUrl={setChatUrl} />
      </div>
    );
  }

  return (
    <div className="twitch-connect-page-logged-out">
      <p>Connect your Twitch account to start using the chat overlay</p>
      <Button type="primary" onClick={handleLogin}>
        Connect with Twitch
      </Button>
    </div>
  );
};
