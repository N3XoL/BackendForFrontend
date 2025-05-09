import {Link} from "react-router-dom";

export default function About() {
    return (
        <main className="min-h-screen">
            <div className="flex flex-col items-center"> {/* Zmieniono na flex-col i dodano items-center */}
                <h1>About</h1>
                <Link to="/" className="mt-5">Home</Link>
            </div>
            <div className="flex flex-col items-center justify-between p-24">
                <p>
                    <strong>It's a simple page about something!</strong>
                </p>
            </div>
        </main>
    );
}