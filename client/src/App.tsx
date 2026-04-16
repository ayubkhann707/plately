import { Routes, Route } from "react-router-dom";
import Layout from "./layout/Layout";

import Feed from "./pages/Feed";
import CreatePost from "./pages/CreatePost";
import Library from "./pages/Library";
import Plan from "./pages/Plan";
import Grocery from "./pages/Grocery";
import Profile from "./pages/Profile";
import Post from "./pages/Post";
import ImportRecipe from "./pages/ImportRecipe";

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Feed />} />
        <Route path="/create" element={<CreatePost />} />
        <Route path="/library" element={<Library />} />
        <Route path="/import" element={<ImportRecipe />} />
        <Route path="/plan" element={<Plan />} />
        <Route path="/grocery" element={<Grocery />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/posts/:id" element={<Post />} />
      </Route>
    </Routes>
  );
}