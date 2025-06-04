import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import '@/styles/components/about.css';

export default function About() {
    const text = "It's a simple page about something!";
    const [key, setKey] = useState(0);

    const letterDelay = 0.25;
    const animationDuration = 0.5;
    const totalDuration = (text.length * letterDelay) + animationDuration;

    useEffect(() => {
        const timer = setTimeout(() => {
            setKey(prevKey => prevKey + 1);
        }, totalDuration * 1000);

        return () => clearTimeout(timer);
    }, [key, totalDuration]);

    const animatedText = text.split('').map((letter, index) => {
        return (
            <span
                key={`${index}-${key}`}
                className="wave-letter"
                style={{ animationDelay: `${index * letterDelay}s` }}
            >
                {letter === ' ' ? '\u00A0' : letter}
            </span>
        );
    });

    return (
        <main className="min-h-screen">
            <div className="flex flex-col items-center m-10">
                <h1 className="moving-title about-title">About</h1>
                <Link to="/" className="mt-5">Home</Link>
            </div>
            <div className="flex flex-col items-center justify-between p-24">
                <p className="wave-text">
                    <strong>{animatedText}</strong>
                </p>
            </div>
        </main>
    );
}