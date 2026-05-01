import { Routes, Route } from "react-router-dom";
import Layout from "./layout/Layout";
import ProtectedRoute from "./components/ProtectedRoute";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Feed from "./pages/Feed";
import CreatePost from "./pages/CreatePost";
import Library from "./pages/Library";
import Saved from "./pages/Saved";
import Grocery from "./pages/Grocery";
import Profile from "./pages/Profile";
import Post from "./pages/Post";
import ImportRecipe from "./pages/ImportRecipe";
import SharedGrocery from "./pages/SharedGrocery";

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/grocery/share/:token" element={<SharedGrocery />} />

      <Route element={<ProtectedRoute />}>
        <Route element={<Layout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/feed" element={<Feed />} />
          <Route path="/create" element={<CreatePost />} />
          <Route path="/library" element={<Library />} />
          <Route path="/saved" element={<Saved />} />
          <Route path="/import" element={<ImportRecipe />} />
          <Route path="/grocery" element={<Grocery />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/posts/:id" element={<Post />} />
        </Route>
      </Route>
    </Routes>
  );
}
