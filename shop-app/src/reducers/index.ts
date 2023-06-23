import { combineReducers } from "@reduxjs/toolkit";
import service from "./service";

/* How Redux works:
 * 1. The component calls an action.
 * 2. The action dispatches the action type and payload to the reducer.
 * 3. The reducer updates the state of the Redux store.
 * (All reducers are called, but only one handles the action.)
 * 4a. (connect) The component's props get updated, causing a re-render.
 * 4b. (useSelector) The state from the selector changes, causing a re-render.
 */
export default combineReducers({
  service,
});
