import axios from "axios";
import type {FormEvent} from "react";
import {useCallback, useEffect, useRef, useState} from "react";
import {useUserContext} from "@/store/user-context.ts";

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
    onLogin: (eventData: Record<string, never>) => void;
}

export default function Login({onLogin}: LoginProperties) {
    const user = useUserContext();
    const [loginUri, setLoginUri] = useState("");
    const [selectedLoginExperience, setSelectedLoginExperience] = useState<LoginExperience>(LoginExperience.DEFAULT);
    const [isLoginModalDisplayed, setLoginModalDisplayed] = useState(false);
    const [isIframeLoginPossible, setIframeLoginPossible] = useState(false);
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

    useEffect(() => {
        fetchLoginOptions().catch(error => console.error("error while fetching login options:", error));
    }, [fetchLoginOptions]);

    const onIframeLoad = useCallback(() => {
        if (isLoginModalDisplayed) {
            onLogin({});
        }
    }, [onLogin, isLoginModalDisplayed]);

    useEffect(() => {
        const iframe = iframeRef.current;
        if (iframe) {
            iframe.addEventListener("load", onIframeLoad);
            return () => iframe.removeEventListener("load", onIframeLoad);
        }
    }, [onIframeLoad]);

    async function onSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        if (!loginUri) {
            console.log("loginUri is empty, returning.");
            return;
        }
        if (+selectedLoginExperience === +LoginExperience.IFRAME &&
            iframeRef.current) {
            const iframe = iframeRef.current;
            iframe.src = loginUri;
            setLoginModalDisplayed(true);
        } else {
            window.location.href = loginUri;
        }
    }

    return (
        <span>
          <form onSubmit={onSubmit}>
            {isIframeLoginPossible && (
                <select
                    className="mr-2"
                    value={selectedLoginExperience}
                    onChange={(e) => {
                        setSelectedLoginExperience(Number(e.target.value) as LoginExperience);
                    }}
                >
                    <option value={LoginExperience.IFRAME} hidden={!isIframeLoginPossible}>Iframe</option>
                    <option value={LoginExperience.DEFAULT}>Default</option>
                </select>
            )}
              <button disabled={user.isAuthenticated} type="submit">Login</button>
          </form>
          <div
              className={
                  (!user.isAuthenticated && isLoginModalDisplayed)
                          ? "modal-overlay"
                          : "hidden"
              }
          >
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