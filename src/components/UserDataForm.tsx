/**
 * `UserDataForm` is a React component that allows users to manage their profile information.
 *
 *
 * Behavior:
 * - Fetches the current user's display name and bio when the component mounts.
 * - Allows users to update their display name and bio through a form.
 * - Makes an API request to update the user's profile data on submission.
 * - Fetches the user's posts and displays them in a list.
 * - Provides options to view the user's public profile and logout.
 *
 * @returns {JSX.Element} A component that enables users to manage their profile.
 */

import { useState, FormEvent } from 'react';
import { useEffect } from 'react';
import { useAuth } from '../store/auth-context';
import classes from "./UserDataForm.module.css"
import LogoutButton from './LogoutButton';
import PostItem from './posts/PostItem';
import { PostData } from '../store/PostType';
import { useNavigate } from 'react-router-dom';


const UserDataForm = () => {
  const [authorname, setAuthorname] = useState('');
  const { isLoggedIn, setIsLoggedIn} = useAuth();
  const [bio, setBio] = useState('');
    const { user } = useAuth();
    const [posts, setPosts] = useState([]);

    const navigate = useNavigate()

    const fetchPosts = async () => {

      try {
          const response = await fetch(`${process.env.REACT_APP_API_URL}/users/${user?.username}/posts`);
          if (!response.ok) {
              throw new Error('Something went wrong!');
          }
          const data = await response.json();
          setPosts(data);
      } catch (error) {
          console.error(error);
      }
  };


  useEffect(() => {
    if (isLoggedIn){
        // Fetch the current display name when the component mounts
        const fetchCurrentDisplayName = async () => {
        try {
          const token = localStorage.getItem('token');
            const response = await fetch(`${process.env.REACT_APP_API_URL}/current_user_data`, {
            headers: {
              'Authorization': `Bearer ${token}`,
            },
            });
            if (response.ok) {
            const data = await response.json();
              setAuthorname(data.authorname); 
              setBio(data.bio)

            console.log(authorname)
            }
        } catch (error) {
            console.error('Failed to fetch current display name:', error);
            console.log(authorname)
        }
        };

        fetchCurrentDisplayName();
    }
  }, [isLoggedIn]);

  useEffect(() => {

    fetchPosts();
}, []);


  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    // Make API call to backend to save UserData
    // Adjust the URL and request method (POST for create, PUT for update) accordingly

    const trimmedAuthorName = authorname ? authorname.trim() : (user && user.username);

    try {
      const token = localStorage.getItem('token');
        const response = await fetch(`${process.env.REACT_APP_API_URL}/user_datum`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',

        },
        body: JSON.stringify({ user_data: {authorname: trimmedAuthorName, bio: bio} }),
        });

        if (response.ok) {
        // Handle successful response
        const data = await response.json();
        setAuthorname(data.authorname);
        setBio(data.bio)
        fetchPosts();
        } else {
        // Handle errors
        const errorData = await response.json();
        console.error('Error:', errorData);
        }
    } catch (error) {
        console.error('Network error:', error);
    }
  }

  return (
    
      <div>
      <h1 className={classes.profileHeader}>Your Profile</h1>
        {user && <p>Username: {user.username}</p>}
        <p className={classes.profileInfo}>If no display name is set, then your posts/comments will be published under your username. <br /> To remove display name, leave the display name field blank </p>
        <p>Display Name: {authorname}</p>
        <div>
          <p>Bio:</p>
          <p>{bio || "No Bio Yet"}</p>
        </div>
        <form onSubmit={handleSubmit} className={classes.profileForm}>

          <div className={classes.profileControl}>
            <label>Display Name</label>
            <input type="text" value={authorname}  onChange={(e) => setAuthorname(e.target.value)} placeholder='Add Display Name here...' />
          </div>
          <div className={classes.profileControl}>
            <label>Bio</label>
            <textarea name="bio" onChange={(e) => setBio(e.target.value)} value={bio || ""} placeholder='Add bio here...'></textarea>
          </div>
          <div className={classes.profileActions}>
            <button type="submit" className={classes.profileButton}>Save</button>
          </div>
      
        </form>

        <div className={classes.profileActions}>
          <button className={classes.profileButton} onClick={() => navigate(`/user/${user?.username}`)}>View Public Profile</button>
          <LogoutButton />
        </div>

        {user && <div>
          <h3>My Posts</h3>
          {posts.length > 0 && posts.reverse().map((post: PostData) => 
                <PostItem 
                    key={post.id} 
                    postinfo = {post}
                /> 
            )}
            {posts.length === 0 && <p>No posts created yet</p>}
      
        </div>}
      </div>


  );
};

export default UserDataForm;
