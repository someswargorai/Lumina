import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    blogs: [
        {
            title: "Introduction to Lumina",
            content: "Lumina is a free, open-source, community-owned blogging platform built with Next.js, TypeScript, Tailwind CSS, and Supabase. It’s designed to be fast, flexible, and easy to use, whether you're a solo creator or running a team of writers.",
            _id: "1",
            publish:false,
            isDelete: false
        }
    ],
    currentBlogId: 1,
    favourites:[] as number[]
}

const blogSlice = createSlice({
    name: "blog",
    initialState,
    reducers: {
        setBlogs: (state, action) => {
            state.blogs = action.payload;
        },
        createNewPost: (state) => {
            const newPost = {
                _id: String(Date.now()),
                title: "Untitled",
                content: "segsgseg",
                publish:false,
                isDelete: false
                
            }
            state.blogs.push(newPost);
        },
        updatePost: (state, action) => {
            console.log(action.payload);

            const index = state.blogs.findIndex(item => item._id === action.payload.id);
            if (index !== -1) {
                state.blogs[index].title = action.payload.title;
                state.blogs[index].publish = action.payload.publish;
                state.blogs[index].isDelete = action.payload.isDelete;
                
            }
        },
        setCurrentBlogId: (state, action) => {
            state.currentBlogId = action.payload;
        },
        moveToTrash: (state,action)=>{
            console.log(action.payload);

            const currentBlog = state.blogs.findIndex(item => String(item._id) === String(action.payload));
            console.log(currentBlog);

            if(currentBlog!== -1){
                state.blogs.splice(currentBlog,1);
            }
        },
        addToFavourites: (state, action) => {
            state.favourites.push(action.payload);
        },
        removeFromFavourites: (state, action) => {
            state.favourites = state.favourites.filter(item => Number(item) !== Number(action.payload));
        }
    }
})

export const { setBlogs, createNewPost, updatePost, setCurrentBlogId,moveToTrash,addToFavourites,removeFromFavourites } = blogSlice.actions;
export default blogSlice.reducer;