import React, { useState } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "../firebase";
import { Avatar, Button, Tooltip } from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import { ArrowLeft, LocalPolice } from "@mui/icons-material";
import IconButton from "@mui/material/IconButton";
import SendIcon from "@mui/icons-material/Send";
import { useNavigate } from "react-router-dom";
const MembersPage = () => {
  const navigate = useNavigate();
  const [user] = useAuthState(auth);
  console.log(user);

  const [users, setUsers] = useState([user]);
  const [admin, setAdmin] = useState(user);
  return (
    <div className="flex flex-col w-full">
      <Tooltip title={"go back"} arrow>
        <IconButton
          className="p-2.5 bg-black w-10 h-10 rounded-full"
          aria-label="back"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft />
        </IconButton>
      </Tooltip>
      <div className="flex flex-col w-full gap-1 p-5">
        {users.map((user) => {
          const isAdmin = user?.uid === admin?.uid;
          return (
            <div className="flex justify-between w-full" key={user?.uid}>
              <div className="flex gap-2">
                <div className="flex   gap-1">
                  {isAdmin && (
                    <div className=" bg-pink-800 text-white font-mono h-1/2 rounded-md">
                      Admin
                    </div>
                  )}
                  <Avatar
                    variant="rounded"
                    src={user?.photoURL ?? ""}
                    sx={{ width: 50, height: 50 }}
                  />
                </div>
              </div>
              <div>{user?.displayName}</div>
              <div>{user?.email}</div>
              {!isAdmin ? (
                <Button variant="outlined" startIcon={<DeleteIcon />}>
                  Delete
                </Button>
              ) : (
                <Button variant="outlined" startIcon={<LocalPolice />}>
                  Report
                </Button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
export default MembersPage;
