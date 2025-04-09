import React, { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

export default function Write() {
    const genresList = [
        'Action', 'Adventure', 'Comedy', 'Drama',
        'Fantasy', 'Horror', 'Mystery', 'Romance',
        'Science Fiction', 'Thriller', 'Western', 'Historical'
    ];

    const [selectedGenres, setSelectedGenres] = useState([]);
    const [title, setTitle] = useState('');
    const [story, setStory] = useState('');

    const toggleGenre = (genre) => {
        setSelectedGenres((prevSelected) =>
            prevSelected.includes(genre)
                ? prevSelected.filter((g) => g !== genre)
                : [...prevSelected, genre]
        );
    };

    const wordCount = (text) => {
        return text.trim().split(/\s+/).filter(word => word.length > 0).length;
    };

    const handleSubmit = (e) => {
        e.preventDefault();

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

        axios.post('https://localhost:8080/write', formData, {
            withCredentials: true,
        })
            .then(response => {
                //console.log('Response:', response.data);
                toast.success('Story submitted successfully!');
                setTitle('');
                setStory('');
                setSelectedGenres([]);
                if (response.status === 201) {
                    const storyId = response.data.StoryID;

                    // Copy the ID to clipboard
                    navigator.clipboard.writeText(storyId)
                        .then(() => {
                            alert(`Story created with ID: ${storyId}\nThe ID has been copied to your clipboard.\nUse this ID to claim your story.`);
                        })
                        .catch(err => {
                            // If clipboard fails, just show the alert
                            alert(`Story created with ID: ${storyId}\nUse this ID to claim your story (copy it manually).`);
                            console.error('Could not copy story ID to clipboard:', err);
                        });
                }
            })
            .catch(error => {
                console.error('Error submitting form:', error);
                alert('Error submitting story. Please try again.');
            });
    };

    return (
        <form onSubmit={handleSubmit} style={{ maxWidth: '600px', margin: 'auto' }}>
            <h2>Write Your Story</h2>
            <p>You can make a story here. Enter a title under 50 characters and a story under 500 words.</p>

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

            <input type="hidden" name="genres" value={selectedGenres.join(',')} />

            <br />
            <button type="submit" style={{ padding: '10px 20px', marginTop: '20px' }}>
                Submit
            </button>
        </form>
    );
}
