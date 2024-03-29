
/**
 * `EditPostForm` is a React component that provides a form for editing a post.
 * It allows users to update the post title, description, and tags.
 *
 * Props:
 * - None.
 *
 * Behavior:
 * - Fetches the post data and available tags data to populate the form.
 * - Handles form submission to update the post data on the server.
 * - Redirects to the updated post after successful submission.
 *
 * @returns {JSX.Element} A component that renders a form for editing a post.
 */

import { useRef, FormEvent, useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Card from '../ui/Card';
import CreatableSelect from 'react-select/creatable';
import classes from "./NewPostForm.module.css"
import { useAuth } from '../../store/auth-context';

type TagOption = {
  label: string;
  value: number;
};


const EditPostForm = () => {
  const { id } = useParams<{ id: string }>(); 
  const navigate = useNavigate();
  const { user } = useAuth();

  // State for form inputs and tags
  const [postTitle, setPostTitle] = useState('');
  const [postDescription, setPostDescription] = useState('');
  const [availableTags, setAvailableTags] = useState<TagOption[]>([]);
  const [selectedTags, setSelectedTags] = useState<TagOption[]>([]);

  const titleInputRef = useRef<HTMLInputElement>(null);
  const descriptionInputRef = useRef<HTMLTextAreaElement>(null);

  // Fetch post and tags data to populate form
  useEffect(() => {
    const fetchPostAndTags = async () => {
      try {
        // Fetch post data
        const postResponse = await fetch(`${process.env.REACT_APP_API_URL}/posts/${id}`);
        const postData = await postResponse.json();
        setPostTitle(postData.title);
        setPostDescription(postData.description);
        setSelectedTags(postData.tags.map((tag: any) => ({ label: tag.name, value: tag.id })));

        // Fetch tags data
        const tagsResponse = await fetch(`${process.env.REACT_APP_API_URL}/tags`);
        const tagsData = await tagsResponse.json();
        setAvailableTags(tagsData.map((tag: any) => ({ label: tag.name, value: tag.id })));
      } catch (error) {
        console.error('Error fetching post or tags:', error);
      }
    };

    fetchPostAndTags();
  }, [id]);

  // Handler for form submission
  const submitHandler = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const newTags = selectedTags.filter(tag => !availableTags.some(availableTag => availableTag.value === tag.value)).map(tag => tag.label); // Assuming new tags have label as their name

    const existingTagIds = selectedTags.filter(tag => availableTags.some(availableTag => availableTag.value === tag.value)).map(tag => tag.value);
        
    console.log(newTags)
    console.log(existingTagIds)
    // Prepare data for updating the post
    const updatedPostData = {
      title: postTitle,
      description: postDescription,
      user_id: user?.id, // Make sure user_id is allowed and handled on the backend
      tag_ids: existingTagIds,
      new_tags: newTags

    };

    // Update the post
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/posts/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedPostData),
      });

      if (!response.ok) {
        throw new Error('Failed to update post');
      }

      // Redirect after successful update
      navigate(`/showpost/${id}`);
    } catch (error) {
      console.error('Error updating post:', error);
    }
  };

  return (
    <section>
      <h1>Edit Post</h1>
      <Card>
        <form className={classes.form} onSubmit={submitHandler}>
          <div className={classes.control}>
            <label htmlFor="title">Edit Post Title</label>
            <input type="text" id="title" ref={titleInputRef} value={postTitle} onChange={(e) => setPostTitle(e.target.value)} required />
          </div>
          <div className={classes.control}>
            <label htmlFor="description">Edit Description</label>
            <textarea id="description" ref={descriptionInputRef} rows={5} value={postDescription} onChange={(e) => setPostDescription(e.target.value)} required></textarea>
          </div>
          <div className={classes.control}>
            <label>Edit Tags</label>
            <CreatableSelect
              isMulti
              options={availableTags}
              className="basic-multi-select"
              classNamePrefix="select"
              onChange={(selectedOptions) => setSelectedTags(selectedOptions as TagOption[])}
              value={selectedTags}
            />
          </div>
          <div className={classes.actions}>
            <button type="submit">Update Post</button>
          </div>
        </form>
      </Card>
    </section>
  );
};

export default EditPostForm;
