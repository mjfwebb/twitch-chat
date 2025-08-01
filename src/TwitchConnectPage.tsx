import { useEffect, useState } from 'react';
import { TWITCH_AUTH_URL } from './constants';
import { persistedStore, store } from './store/store';

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
    <button onClick={handleCopy} className="button-secondary">
      {success ? 'Copied!' : 'Copy URL'}
    </button>
  );
};

export const TwitchConnectPage = () => {
  const accessToken = persistedStore((s) => s.accessToken);
  const broadcasterId = store((s) => s.broadcasterId);
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
    store.getState().setBroadcasterId(null);
    window.location.assign('/');
  };

  const chatUrl = `${import.meta.env.VITE_BASE_URI}/chat?access_token=${accessToken}`;

  if (accessToken && broadcasterId) {
    return (
      <div className="logged-in">
        <p>
          You are now connected to Twitch as <strong>{broadcasterId}</strong>.
        </p>
        <h2>How to add as a browser source in OBS</h2>
        <ol>
          <li>Open OBS and go to the Sources panel.</li>
          <li>Click the "+" button to add a new source.</li>
          <li>Select "Browser" from the list of source types.</li>
          <li>Create a new browser source</li>
          <li>
            Paste the following URL into the URL field:
            <p>
              <code>{chatUrl}</code> <CopyToClipboardButton text={chatUrl} />
            </p>
          </li>
        </ol>
        <button className="button-ghost" onClick={handleLogout}>
          Logout
        </button>
      </div>
    );
  }

  return (
    <div>
      <button onClick={handleLogin}>Connect with Twitch</button>
    </div>
  );
};
