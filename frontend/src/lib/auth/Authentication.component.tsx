import type {EventHandler} from "react";
import Logout from "./Logout.tsx";
import {useUserContext} from "../../user-context.ts";
import Login from "./Login.tsx";


interface AuthenticationProperties {
    onLogin: EventHandler<never>;
}

export default function Authentication({ onLogin }: AuthenticationProperties) {
    const user = useUserContext();

    return (
        <span>
      {!user.isAuthenticated ? (
          <Login onLogin={onLogin}></Login>
      ) : (
          <Logout></Logout>
      )}
    </span>
    );
}