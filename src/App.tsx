import { Route, Switch, useSearchParams } from 'wouter';
import './App.css';
import { fetchBadges } from './handlers/twitch/helix/fetchBadges';
import { fetchCheers } from './handlers/twitch/helix/fetchCheers';
import { useMount } from './hooks/useMount';
import { persistedStore } from './store/store';
import { TwitchAuthHandler } from './TwitchAuthHandler';
import { TwitchBroadcasterIdLoader } from './TwitchBroadcasterIdLoader';
import { TwitchConnectPage } from './TwitchConnectPage';
import { TwitchWebSocketClient } from './TwitchWebSocketClient';
import { Chat } from './views/Chat/Chat';

function App() {
  useMount(() => {
    fetchBadges('global');
    fetchCheers('global');
  });
  const [searchParams] = useSearchParams();
  const accessToken = persistedStore((s) => s.accessToken);

  if (!accessToken) {
    // Try to get the access token from the URL hash
    const token = searchParams.get('access_token');
    if (token) {
      persistedStore.getState().setAccessToken(token);
    }
  }

  return (
    <>
      {accessToken && (
        <>
          <TwitchBroadcasterIdLoader />
          <TwitchWebSocketClient />
        </>
      )}
      <Switch>
        <Route
          path="/"
          component={() => (
            <main>
              <h1>Athano's Twitch Chat Overlay</h1>
              <TwitchConnectPage />
              <p>Connect your Twitch account to start using the chat overlay.</p>
              <p>
                This app is open source and available on{' '}
                <a href="https://github.com/mjfwebb/twitch-chat/">
                  <i className="fa fa-github"></i> GitHub
                </a>
                . If you encounter issues or have feature requests, please check the{' '}
                <a href="https://github.com/mjfwebb/twitch-chat/issues">issues page</a>.
              </p>
              <p>
                Made with 🧟 by <a href="https://twitch.tv/athano">Athano</a>
              </p>
            </main>
          )}
        />
        <Route path="/auth" component={TwitchAuthHandler} />
        <Route path="/chat" component={Chat} />
        <Route>404: No such page!</Route>
      </Switch>
    </>
  );
}

export default App;
