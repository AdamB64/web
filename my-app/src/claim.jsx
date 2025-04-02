import React, { useState } from 'react';
import axios from 'axios';

const genresList = [
    'Action', 'Adventure', 'Comedy', 'Drama',
    'Fantasy', 'Horror', 'Mystery', 'Romance',
    'Science Fiction', 'Thriller', 'Western', 'Historical'
];

export default function ClaimStory() {
    const [storyId, setStoryId] = useState('');
    const [title, setTitle] = useState('');
    const [story, setStory] = useState('');
    const [selectedGenres, setSelectedGenres] = useState([]);
    const [showStoryEditor, setShowStoryEditor] = useState(false);

    const wordCount = (text) => {
        return text.trim().split(/\s+/).filter(Boolean).length;
    };

    const toggleGenre = (genre) => {
        if (selectedGenres.includes(genre)) {
            setSelectedGenres(selectedGenres.filter(g => g !== genre));
        } else {
            setSelectedGenres([...selectedGenres, genre]);
        }
    };

    const handleClaim = async (e) => {
        e.preventDefault();

        try {
            const response = await axios.post('http://localhost:8080/claim', { id: storyId },
                { withCredentials: true }
            );

            const { title, content, genres } = response.data;

            setTitle(title);
            setStory(content);
            setSelectedGenres(genres);
            setShowStoryEditor(true);
        } catch (error) {
            console.error('Error claiming story:', error);
            alert('Invalid story ID or failed to claim story.');
        }
    };

    function Update(storyId) {
        if (title.length > 50) {
            alert('Title must be under 50 characters.');
            return;
        }

        if (wordCount(story) > 500) {
            alert('Story must be under 500 words.');
            return;
        }

        const formData = {
            title,
            story,
            genres: selectedGenres
        };

        console.log('Form submitted:', formData);

        axios.post(`http://localhost:8080/update/${storyId}`, formData, {
            withCredentials: true,
        })
            .then(response => {
                console.log('Response:', response.data);
                alert('Story updated successfully!');
                setTitle('');
                setStory('');
                setSelectedGenres([]);
                setShowStoryEditor(false);
            })
            .catch(error => {
                console.error('Error updating story:', error);
                alert('Failed to update story.');
            });
    }

    return (
        <div>
            <h2>Claim/Edit Your Story</h2>
            <form onSubmit={handleClaim}>
                <label htmlFor="ID">Story ID:</label><br />
                <input
                    type="text"
                    id="ID"
                    name="ID"
                    value={storyId}
                    onChange={(e) => setStoryId(e.target.value)}
                    required
                /><br />

                <input type="submit" value="Submit" />
            </form>

            {showStoryEditor && (
                <div id="story">
                    <label>
                        <strong>Title:</strong>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            maxLength={50}
                            required
                            style={{ width: '100%', padding: '8px', marginTop: '5px', marginBottom: '15px' }}
                            placeholder="Your story title"
                        />
                    </label>

                    <label>
                        <strong>Story:</strong>
                        <textarea
                            value={story}
                            onChange={(e) => setStory(e.target.value)}
                            rows="10"
                            required
                            style={{ width: '100%', padding: '8px', marginBottom: '15px' }}
                            placeholder="Write your story here..."
                        />
                        <div style={{ textAlign: 'right', fontSize: '0.9em', color: '#666' }}>
                            Word count: {wordCount(story)} / 500
                        </div>
                    </label>

                    <div>
                        <strong>Select Genres:</strong>
                        <div style={{ display: 'flex', flexWrap: 'wrap', marginTop: '10px' }}>
                            {genresList.map((genre) => (
                                <button
                                    key={genre}
                                    type="button"
                                    onClick={() => toggleGenre(genre)}
                                    style={{
                                        padding: '10px 15px',
                                        margin: '5px',
                                        borderRadius: '5px',
                                        border: '2px solid #888',
                                        backgroundColor: selectedGenres.includes(genre) ? '#4CAF50' : '#fff',
                                        color: selectedGenres.includes(genre) ? '#fff' : '#000',
                                        cursor: 'pointer',
                                    }}
                                >
                                    {genre}
                                </button>
                            ))}
                        </div>
                    </div>

                    <br />
                    <button
                        type="button"
                        style={{ padding: '10px 20px', marginTop: '20px' }}
                        onClick={() => Update(storyId)}
                    >
                        Submit
                    </button>
                </div>
            )}
        </div>
    );
}
