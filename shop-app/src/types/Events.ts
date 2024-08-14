export type EventRequest = {
  name: string;
  properties: Record<string, string | number | boolean>;
};

export type StoreEventData = {
  serviceName: string;
};

export type AppBarEventData = {
  category?: string;
  freeTier?: boolean;
  darkMode?: boolean;
};

export type ProfileEventData = {
  loggedIn?: boolean;
  viewedProfile?: boolean;
  loggedOut?: boolean;
};
