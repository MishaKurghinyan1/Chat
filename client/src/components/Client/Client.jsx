import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Main from "../Main/Main";
import Chat from "../Chat/Chat";
import Login from "../Login/Login";
import Register from "../Register/Register";
import CreateChat from "../CreateChat/CreateChat";
import { ApiProvider } from "../ApiComponent/ApiProvider";
import UpdateChat from "../UpdateChat/UpdateChat";

export default function Client() {
  return (
    <ApiProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Main />} />
          <Route path="/chat" element={<Chat />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/createChat" element={<CreateChat />} />
          <Route path="/editChat/:id" element={<UpdateChat />} />
        </Routes>
      </Router>
    </ApiProvider>
  );
}
