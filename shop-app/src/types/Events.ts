export type EventRequest = {
  name: string;
  properties: Record<string, string | number | boolean>;
};

export type StoreEventData = {
  serviceName: string;
};

// export interface StoreEvent extends EventRequest {
//   name: "store";
//   properties: {
//     serviceName: string;
//   };
// }

export type AppBarEventData = {
  category?: "free" | "trial" | "paid";
  freeTier?: boolean;
  darkMode?: boolean;
};

// export interface AppBarEvent extends EventRequest {
//   name: "app-bar";
//   properties: {
//     category?: "free" | "trial" | "paid";
//     freeTier?: boolean;
//     darkMode?: boolean;
//   };
// }

export type ProfileEventData = {
  loggedIn?: boolean;
  viewedProfile?: boolean;
  loggedOut?: boolean;
};

// export interface ProfileEvent extends EventRequest {
//   name: "profile";
//   properties: {
//     loggedIn?: boolean;
//     viewedProfile?: boolean;
//     loggedOut?: boolean;
//   };
// }
