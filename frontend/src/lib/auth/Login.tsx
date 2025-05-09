import axios from "axios";
import type {FormEvent} from "react";
import {type EventHandler, useCallback, useEffect, useRef, useState} from "react";
import {useUserContext} from "../../user-context.ts";
import {useLocation} from "react-router-dom";

const LoginExperience = {
    DEFAULT: 0,
    IFRAME: 1,
} as const;
type LoginExperience = typeof LoginExperience[keyof typeof LoginExperience];

interface LoginOptionDto {
    label: string;
    loginUri: string;
    isSameAuthority: boolean;
}

async function getLoginOptions(): Promise<Array<LoginOptionDto>> {
    const response = await axios.get<Array<LoginOptionDto>>('/bff/login-options');
    return response.data;
}

interface LoginProperties {
    onLogin: EventHandler<any>;
}

export default function Login({onLogin}: LoginProperties) {
    const user = useUserContext();
    const [loginUri, setLoginUri] = useState("");
    const [selectedLoginExperience, setSelectedLoginExperience] = useState<LoginExperience>(LoginExperience.DEFAULT);
    const [isLoginModalDisplayed, setLoginModalDisplayed] = useState(false);
    const [isIframeLoginPossible, setIframeLoginPossible] = useState(false);
    const location = useLocation();
    const currentPath = location.pathname;
    const iframeRef = useRef<HTMLIFrameElement>(null);

    const fetchLoginOptions = useCallback(async () => {
        try {
            const loginOptions = await getLoginOptions();
            if (loginOptions?.length > 1 || !loginOptions[0].loginUri) {
                setLoginUri("");
                setIframeLoginPossible(false);
            } else {
                setLoginUri(loginOptions[0].loginUri);
                setIframeLoginPossible(true);
            }
        } catch (error) {
            console.error("error while fetching login options:", error);
            setLoginUri("");
            setIframeLoginPossible(false);
        }
    }, []);

    const onIframeLoad = useCallback(() => {
        if (isLoginModalDisplayed) {
            onLogin({});
        }
    }, [onLogin, isLoginModalDisplayed]);

    useEffect(() => {
        fetchLoginOptions().catch(error => console.error("error while fetching login options:", error));
    }, [fetchLoginOptions]);

    useEffect(() => {
        const iframe = iframeRef.current;
        if (iframe) {
            iframe.addEventListener("load", onIframeLoad);
            return () => iframe.removeEventListener("load", onIframeLoad);
        }
    }, [onIframeLoad]);

    async function onSubmit(event: FormEvent<HTMLFormElement>) {
        console.log("Login onSubmit triggered");
        event.preventDefault();
        if (!loginUri) {
            console.log("loginUri is empty, returning.");
            return;
        }
        const url = new URL(loginUri);
        const baseUri = import.meta.env.VITE_PUBLIC_BASE_URI;
        url.searchParams.append(
            "post_login_success_uri",
            `${baseUri}${currentPath}`
        );
        url.searchParams.append(
            "post_login_failure_uri",
            `${baseUri}/login-error`
        );
        const loginUrl = url.toString();
        if (+selectedLoginExperience === +LoginExperience.IFRAME &&
            iframeRef.current) {
            const iframe = iframeRef.current;
            if (iframe) {
                iframe.src = loginUrl;
                setLoginModalDisplayed(true);

            }
        } else {
            window.location.href = loginUrl;
        }
    }

    return (
        <span>
      <form onSubmit={onSubmit}>
        {isIframeLoginPossible && (
            <select
                value={selectedLoginExperience}
                onChange={(e) => {
                    setSelectedLoginExperience(Number(e.target.value) as LoginExperience);
                }}
            >
                <option
                    value={LoginExperience.IFRAME}
                    hidden={!isIframeLoginPossible}
                >
                    iframe
                </option>
                <option value={LoginExperience.DEFAULT}>default</option>
            </select>
        )}
          <button disabled={user.isAuthenticated} type="submit">
          Login
        </button>
      </form>
      <div
          className={
              !user.isAuthenticated && isLoginModalDisplayed
                  ? "modal-overlay"
                  : "hidden"
          }
          onClick={() => setLoginModalDisplayed(false)}
      >
        <div></div>
        <div className="modal">
            <div className="flex">
                <span className="ml-auto">
                    <button onClick={() => setLoginModalDisplayed(false)}>X</button>
            </span>
          </div>
          <iframe ref={iframeRef} title="Login Iframe"></iframe>
        </div>
      </div>
    </span>
    );
}