import React, { useState, FormEvent } from 'react';
import LogoutButton from './LogoutButton';

import { useEffect } from 'react';
import { useAuth } from '../store/auth-context';

import classes from "./UserDataForm.module.css"


const UserDataForm = () => {
  const [authorname, setAuthorname] = useState('');
  const { isLoggedIn, setIsLoggedIn} = useAuth();
    const { user } = useAuth();
    console.log("user data: "+ isLoggedIn)
  useEffect(() => {
    if (isLoggedIn){
        // Fetch the current display name when the component mounts
        const fetchCurrentDisplayName = async () => {
        try {
            const response = await fetch('http://localhost:3000/current_user_data', {
            credentials: 'include', // to include the authentication cookie
            });
            if (response.ok) {
            const data = await response.json();
              setAuthorname(data.authorname); 

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

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    // Make API call to backend to save UserData
    // Adjust the URL and request method (POST for create, PUT for update) accordingly

    const trimmedAuthorName = authorname ? authorname.trim() : (user && user.username);

    try {
        const response = await fetch('http://localhost:3000/user_datum', {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            // Include authentication headers if needed
        },
        body: JSON.stringify({ user_data: {authorname: trimmedAuthorName} }),
        credentials: 'include',
        });

        if (response.ok) {
        // Handle successful response
        const data = await response.json();
        setAuthorname(data.authorname);
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
        <p className={classes.profileInfo}>If no display name is set, then your posts/comments will be published only under your username</p>
        <p>Display Name: {authorname}</p>

        <form onSubmit={handleSubmit} className={classes.profileForm}>

          <div className={classes.profileControl}>
            <label>Display Name</label>
            <input type="text" value={authorname}  onChange={(e) => setAuthorname(e.target.value)} />
          </div>
          <div className={classes.profileActions}>
            <button type="submit" className={classes.profileButton}>Save</button>
          </div>
      
        </form>

      </div>


  );
};

export default UserDataForm;
