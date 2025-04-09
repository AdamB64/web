import { useEffect, useState } from 'react';
import axios from 'axios';

export default function Start() {
    const [stories, setStories] = useState(null);

    useEffect(() => {
        axios.post("http://localhost:8080/get-start")
            .then(response => {
                const sorted = response.data.stories.sort((a, b) => (b.Stars || 0) - (a.Stars || 0));
                setStories(sorted);
            })
            .catch(error => {
                console.error("Error fetching start page data:", error);
            });
    }, []);

    return (
        <div>
            <h2>Top Stories Ranking</h2>
            {stories ? (
                <ol style={{ listStyle: 'none', paddingLeft: 0 }}>
                    {stories.map((story, index) => {
                        const currentStars = story.Stars || 0;
                        const previousStars = index > 0 ? stories[index - 1].Stars || 0 : null;

                        // Calculate rank: increment only if stars differ from previous
                        let rank = 1;
                        if (index === 0) {
                            rank = 1;
                        } else if (currentStars === previousStars) {
                            rank = null; // Tied
                        } else {
                            // Count how many previous stories had higher stars
                            rank = stories
                                .slice(0, index)
                                .filter((s, i, arr) => (arr[i].Stars || 0) !== currentStars)
                                .length + 1;
                        }

                        return (
                            <li key={story._id} style={{ marginBottom: '20px' }}>
                                <strong>
                                    {rank !== null ? `#${rank}` : `(tied)`} — <a href={`/story/${story._id}`}>{story.title}</a>
                                </strong><br />
                                <span>by <em>{story.Author || 'Unknown'}</em></span><br />
                                <span>⭐ {currentStars}</span><br />
                                <span>
                                    Genres: {Array.isArray(story.genres) && story.genres.length > 0
                                        ? story.genres.join(', ')
                                        : 'None'}
                                </span>
                            </li>
                        );
                    })}
                </ol>
            ) : (
                <p>Loading stories...</p>
            )}
        </div>
    );
}
