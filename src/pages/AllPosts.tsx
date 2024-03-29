/**
 * `AllPosts` is a React component that displays a list of all posts.
 *
 * Behavior:
 * - Fetches and displays a list of all posts from the server.
 *
 * @returns {JSX.Element} A component that lists all posts.
 */

import { useState, useEffect } from 'react';
import PostList from '../components/posts/PostList';

const AllPosts = () => {
    const [posts, setPosts] = useState([]);

    useEffect(() => {
        // Function to fetch posts
        const fetchPosts = async () => {
            try {
                const response = await fetch(`${process.env.REACT_APP_API_URL}/posts`);
                if (!response.ok) {
                    throw new Error('Something went wrong!');
                }
                const data = await response.json();
                setPosts(data);
            } catch (error) {
                console.error(error);
            }
        };

        fetchPosts();
    }, []);

    return (
        <section>
            <h1>All Posts</h1>
            <PostList allposts={posts} />
        </section>
    );
};

export default AllPosts;
