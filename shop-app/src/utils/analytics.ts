import {
  AppBarEventData,
  EventRequest,
  ProfileEventData,
  StoreEventData,
} from "../types/Events";
import { Constants } from "./constants";

// Helper methods to create the appropriate payloads for each event type
export const storeEvent = (properties: StoreEventData): EventRequest => ({
  name: Constants.Events.STORE,
  properties,
});

export const appBarEvent = (properties: AppBarEventData): EventRequest => ({
  name: Constants.Events.APP_BAR,
  properties,
});

export const profileEvent = (properties: ProfileEventData): EventRequest => ({
  name: Constants.Events.PROFILE,
  properties,
});
