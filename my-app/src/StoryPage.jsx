import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';

function StoryPage() {
    const { id } = useParams();
    const [story, setStory] = useState(null);
    const [reviewText, setReviewText] = useState('');
    const [stars, setStars] = useState(0);

    useEffect(() => {
        axios.get(`http://localhost:8080/story/${id}`)
            .then(response => setStory(response.data))
            .catch(error => console.error('Error fetching story:', error));
    }, [id]);

    const handleReviewSubmit = async (e) => {
        e.preventDefault();
        try {
            const reviewData = {
                Stars: stars,
                ReviewText: reviewText
            };
            await axios.post(`http://localhost:8080/story/${id}/review`, reviewData, {
                withCredentials: true,
            });
            // Refresh the story to show new review
            const updated = await axios.get(`http://localhost:8080/story/${id}`);
            setStory(updated.data);
            setReviewText('');
            setStars(0);
        } catch (err) {
            console.error('Error submitting review:', err);
        }
    };

    if (!story) return <div>Loading...</div>;

    return (
        <div style={{ padding: '1rem', alignItems: 'center', textAlign: 'center', color: 'white' }}>
            <h2>{story.title}</h2>
            <h3>Average stars: {story.Stars}</h3>
            <p><strong>Author ID:</strong> {story.AuthorID}</p>
            {story.AuthorID !== 'anonymous' && story.Author && (
                <p><strong>Username:</strong> {story.Author}</p>
            )}
            <p><strong>Genres:</strong> {Array.isArray(story.genres) ? story.genres.join(', ') : 'N/A'}</p>
            <p><strong>Content:</strong></p>
            <p>{story.content}</p>

            <h3 style={{ marginTop: '2rem', color: 'white' }}>Reviews:</h3>
            {Array.isArray(story.Reviews) && story.Reviews.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    {story.Reviews.map((review, i) => (
                        <div
                            key={i}
                            style={{
                                backgroundColor: '#1e1e1e',
                                padding: '1rem',
                                borderRadius: '8px',
                                border: '1px solid #444',
                                color: 'white',
                            }}
                        >
                            <p style={{ marginBottom: '0.5rem' }}>
                                <strong>User:</strong> {review.User}
                            </p>
                            <p style={{ marginBottom: '0.5rem' }}>
                                <strong>Stars:</strong>{' '}
                                {'⭐'.repeat(review.Stars) || 'No rating'}
                            </p>
                            <p style={{ fontStyle: 'italic' }}>{review.ReviewText}</p>
                        </div>
                    ))}
                </div>
            ) : (
                <p style={{ color: '#aaa' }}>No reviews yet.</p>
            )}
            <div style={{ alignItems: 'center', textAlign: 'center', color: 'white' }}>
                <h3 style={{ marginTop: '3rem', color: 'white' }}>Leave a Review</h3>
                <form
                    onSubmit={handleReviewSubmit}
                    style={{
                        gap: '0.8rem',
                        maxWidth: '400px',
                        width: '100%',
                        color: 'white',
                    }}
                >
                    <label>
                        Stars (0–5):
                        <input
                            type="number"
                            value={stars}
                            onChange={(e) => setStars(parseInt(e.target.value))}
                            min="0"
                            max="5"
                            required
                            style={{
                                width: '100%',
                                padding: '0.5rem',
                                marginTop: '0.3rem',
                                backgroundColor: '#333',
                                color: 'white',
                                border: '1px solid #555',
                                borderRadius: '4px',
                            }}
                        />
                    </label>

                    <label>
                        Review:
                        <textarea
                            value={reviewText}
                            onChange={(e) => setReviewText(e.target.value)}
                            required
                            style={{
                                width: '100%',
                                height: '100px',
                                padding: '0.5rem',
                                marginTop: '0.3rem',
                                backgroundColor: '#333',
                                color: 'white',
                                border: '1px solid #555',
                                borderRadius: '4px',
                                resize: 'vertical',
                            }}
                        />
                    </label>

                    <button
                        type="submit"
                        style={{
                            backgroundColor: '#222',
                            color: 'white',
                            padding: '0.7rem',
                            border: 'none',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontWeight: 'bold',
                        }}
                    >
                        Submit Review
                    </button>
                </form>
            </div>

        </div>
    );
}

export default StoryPage;
