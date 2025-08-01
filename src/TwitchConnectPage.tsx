import { TWITCH_AUTH_URL } from "./constants";
import { persistedStore, store } from "./store/store";

export const TwitchConnectPage = () => {
  const accessToken = persistedStore((s) => s.accessToken);
  const broadcasterId = store((s) => s.broadcasterId);
  const clientId = store((s) => s.clientId);

  const handleLogin = () => {
    const generatedStateValue = Math.random().toString(36).substring(2, 15);
    persistedStore.getState().setAuthStateValue(generatedStateValue);
    const authStateValue = persistedStore.getState().authStateValue;
    console.log("Generated auth state value:", authStateValue);
    window.location.assign(
      `${TWITCH_AUTH_URL}authorize?response_type=token&client_id=${clientId}&redirect_uri=http://localhost:5174/auth&scope=user%3Aread%3Achat&state=${authStateValue}`
    );
  };

  const handleLogout = () => {
    persistedStore.getState().setAccessToken("");
    store.getState().setBroadcasterId(null);
    window.location.assign("/");
  };

  if (accessToken && broadcasterId) {
    return (
      <div>
        <button onClick={handleLogout}>Logout</button>
      </div>
    );
  }

  return (
    <div>
      <button onClick={handleLogin}>Connect with Twitch</button>
    </div>
  );
};
