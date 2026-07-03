import { Routes, Route } from "react-router-dom";
import Layout from "./layout/Layout";
import ProtectedRoute from "./components/ProtectedRoute";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Feed from "./pages/Feed";
import CreatePost from "./pages/CreatePost";
import Library from "./pages/Library";
import Posted from "./pages/Recipes/posted/Posted";
import Saved from "./pages/Recipes/saved/Saved";
import Grocery from "./pages/Grocery";
import Profile from "./pages/Profile";
import Post from "./pages/Post";
import ImportRecipe from "./pages/ImportRecipe";
import SharedGrocery from "./pages/SharedGrocery";
import Settings from "./pages/Settings";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/grocery/share/:token" element={<SharedGrocery />} />

      <Route path="/app" element={<ProtectedRoute />}>
        <Route element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="feed" element={<Feed />} />
          <Route path="create" element={<CreatePost />} />
          <Route path="library" element={<Library />} />
          <Route path="library/posted" element={<Posted />} />
          <Route path="library/saved" element={<Saved />} />
          <Route path="saved" element={<Saved />} />
          <Route path="import" element={<ImportRecipe />} />
          <Route path="grocery" element={<Grocery />} />
          <Route path="profile" element={<Profile />} />
          <Route path="posts/:id" element={<Post />} />
          <Route path="settings" element={<Settings />} />
        </Route>
      </Route>
    </Routes>
  );
}