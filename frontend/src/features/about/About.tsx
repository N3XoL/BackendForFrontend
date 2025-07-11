import {Link} from "react-router-dom";
import {type SetStateAction, useEffect, useState} from "react";
import '@/styles/components/about.css';

export default function About() {
    const [text, setText] = useState("");
    const [key, setKey] = useState(0);
    const LETTER_DELAY = 0.15;
    const ANIMATION_DURATION = 0.5;
    const totalDuration = (text.length * LETTER_DELAY) + ANIMATION_DURATION;

    useEffect(() => {
        const timer = setTimeout(() => {
            setKey(prevKey => (prevKey + 1) % 2);
        }, totalDuration * 1000);

        return () => clearTimeout(timer);
    }, [key, totalDuration]);

    const animatedText = text.split('').map((letter, index) => {
        return (
            <span
                key={`${index}-${key}`}
                className="wave-letter"
                style={{animationDelay: `${index * LETTER_DELAY}s`}}
            >
                {letter === ' ' ? '\u00A0' : letter}
            </span>
        );
    });

    const handleInputChange = (event: { target: { value: SetStateAction<string>; }; }) => {
        setText(event.target.value);
        setKey(prevKey => (prevKey + 1) % 2);
    };

    return (
        <main className="min-h-screen">
            <div className="flex flex-col items-center m-10">
                <h1 className="moving-title about-title">About</h1>
                <Link to="/" className="mt-5">Home</Link>
            </div>
            <div className="flex flex-col items-center justify-between p-24">
                <label htmlFor="text-input" className="mb-2">Enter text to animate it:</label>
                <input
                    id="text-input"
                    type="text"
                    value={text}
                    onChange={handleInputChange}
                    className="p-2 border rounded-md"
                />
                <p className="wave-text mt-5">
                    <strong>{animatedText}</strong>
                </p>
            </div>
        </main>
    );
}