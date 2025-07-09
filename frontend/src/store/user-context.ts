import * as React from "react";
import {User} from "../services/user-service.ts";

export const UserContext = React.createContext(User.ANONYMOUS);
export function useUserContext() {
  return React.useContext(UserContext);
}