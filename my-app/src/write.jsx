export default function Write() {
    return (
        <div>
            <h2>Write</h2>
            <p>Write your stories here </p>
            <form action="http://localhost:8080/write" method="POST">
                <label htmlFor="title">Title:</label><br />
                <input type="text" id="title" name="title" /><br />
                <label htmlFor="story">Story:</label><br />
                <textarea id="story" name="story" maxLength={500}></textarea><br />
                <input type="submit" value="Submit" />
            </form>

        </div>
    )
}
