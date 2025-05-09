import {Link} from "react-router-dom";

export default function LoginError() {
    const uri = window.location.search;
    const params = uri ? new URLSearchParams(uri.substring(1)) : new URLSearchParams();

    return (
        <main className="min-h-screen">
            <div className="flex">
                <span className="ml-2"></span>
                <button>
                    <Link to="/">Home</Link>
                </button>
                <span className="m-auto"></span>
                <h1>Login error</h1>
                <span className="m-auto"></span>
            </div>
            <div className="flex flex-col items-center justify-between p-24">
                <p>{params.get('error')}</p>
            </div>
        </main>
    );
}