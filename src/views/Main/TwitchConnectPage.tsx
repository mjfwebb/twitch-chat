import { useEffect, useState } from 'react';
import { TWITCH_AUTH_URL } from '../../constants';
import { persistedStore, store } from '../../store/store';
import { ChatSettings } from './ChatSettings';

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
    <button onClick={handleCopy} className="button button-secondary">
      {success ? 'Copied!' : 'Copy URL'}
    </button>
  );
};

export const TwitchConnectPage = () => {
  const accessToken = persistedStore((s) => s.accessToken);
  const userId = store((s) => s.userId);
  const userLogin = store((s) => s.userLogin);
  const clientId = store((s) => s.clientId);

  const handleLogin = () => {
    const generatedStateValue = Math.random().toString(36).substring(2, 15);
    persistedStore.getState().setAuthStateValue(generatedStateValue);
    const authStateValue = persistedStore.getState().authStateValue;
    console.log('Generated auth state value:', authStateValue);
    window.location.assign(
      `${TWITCH_AUTH_URL}authorize?response_type=token&client_id=${clientId}&redirect_uri=${import.meta.env.VITE_AUTH_REDIRECT_URI}&scope=user%3Aread%3Achat&state=${authStateValue}`,
    );
  };

  const handleLogout = () => {
    persistedStore.getState().setAccessToken('');
    store.getState().reset();
    window.location.assign('/');
  };

  const [chatUrl, setChatUrl] = useState(`${import.meta.env.VITE_BASE_URI}/chat?access_token=${accessToken}`);

  if (accessToken && userLogin && userId) {
    return (
      <div className="logged-in">
        <div className="logged-in-info-box">
          <p>
            You are now connected to Twitch as{' '}
            <strong>
              {userLogin} ({userId})
            </strong>
            .
          </p>
          <button className="button button-ghost" onClick={handleLogout}>
            Disconnect
          </button>
        </div>
        <h2>How to add as a browser source in OBS</h2>
        <ol>
          <li>Open OBS and go to the Sources panel.</li>
          <li>Click the "+" button to add a new source.</li>
          <li>Select "Browser" from the list of source types.</li>
          <li>Create a new browser source</li>
          <li>
            Paste the following URL into the URL field:
            <div className="url-container">
              <code>{chatUrl}</code> <CopyToClipboardButton text={chatUrl} />
            </div>
          </li>
        </ol>
        <ChatSettings chatUrl={chatUrl} setChatUrl={setChatUrl} />
      </div>
    );
  }

  return (
    <div>
      <button className="button-primary" onClick={handleLogin}>
        Connect with Twitch
      </button>
    </div>
  );
};
