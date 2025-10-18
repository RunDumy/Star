import React, { useState } from 'react';

interface FeedbackFormProps {
    className?: string;
}

export const FeedbackForm: React.FC<FeedbackFormProps> = ({ className }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [feedback, setFeedback] = useState('');
    const [rating, setRating] = useState(5);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        console.log('Feedback submitted:', { feedback, rating });
        // In production, this would send to an API
        setIsOpen(false);
        setFeedback('');
        setRating(5);
        alert('Thank you for your feedback!');
    };

    if (!isOpen) {
        return (
            <button
                className={`fixed bottom-4 right-4 bg-purple-600 text-white px-4 py-2 rounded-lg shadow-lg hover:bg-purple-700 transition-colors ${className || ''}`}
                onClick={() => setIsOpen(true)}
                aria-label="Open feedback form"
            >
                📝 Feedback
            </button>
        );
    }

    return (
        <div className="fixed bottom-4 right-4 bg-slate-900 border border-slate-700 rounded-lg p-4 shadow-xl max-w-sm">
            <form onSubmit={handleSubmit} className="space-y-3">
                <div className="flex items-center justify-between">
                    <h3 className="text-yellow-200 font-semibold">Arena Feedback</h3>
                    <button
                        type="button"
                        onClick={() => setIsOpen(false)}
                        className="text-slate-400 hover:text-white"
                        aria-label="Close feedback form"
                    >
                        ✕
                    </button>
                </div>

                <div>
                    <label htmlFor="feedback-rating" className="block text-slate-300 text-sm mb-1">
                        Rating (1-5 stars)
                    </label>
                    <select
                        id="feedback-rating"
                        value={rating}
                        onChange={(e) => setRating(Number(e.target.value))}
                        className="w-full bg-slate-800 border border-slate-600 rounded px-3 py-1 text-white"
                        title="Select rating from 1 to 5 stars"
                        aria-label="Rating selection (1-5 stars)"
                    >
                        {[1, 2, 3, 4, 5].map(num => (
                            <option key={num} value={num}>
                                {'⭐'.repeat(num)} ({num})
                            </option>
                        ))}
                    </select>
                </div>

                <div>
                    <label htmlFor="feedback-comment" className="block text-slate-300 text-sm mb-1">
                        Your feedback
                    </label>
                    <textarea
                        id="feedback-comment"
                        value={feedback}
                        onChange={(e) => setFeedback(e.target.value)}
                        placeholder="How can we improve the arena experience?"
                        className="w-full bg-slate-800 border border-slate-600 rounded px-3 py-2 text-white text-sm resize-none"
                        rows={3}
                        required
                    />
                </div>

                <div className="flex gap-2">
                    <button
                        type="submit"
                        className="flex-1 bg-green-600 text-white py-2 rounded hover:bg-green-700 transition-colors"
                    >
                        Submit
                    </button>
                    <button
                        type="button"
                        onClick={() => setIsOpen(false)}
                        className="px-4 py-2 bg-slate-700 text-slate-300 rounded hover:bg-slate-600 transition-colors"
                    >
                        Cancel
                    </button>
                </div>
            </form>
        </div>
    );
};

export default FeedbackForm;