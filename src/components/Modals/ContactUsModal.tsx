import React, { useState } from "react";
import styled from "@emotion/styled";
import Modal from "@mui/material/Modal";
import { Button, TextField } from "@mui/material";

interface ContactUsModalProps {
    open: boolean;
    setOpen: (open: boolean) => void;
}

const ContactUsModal: React.FC<ContactUsModalProps> = ({ open, setOpen }) => {
    const [email, setEmail] = useState("");
    const [message, setMessage] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        // Handle form submission logic here (e.g., send to a backend)
        console.log("Email:", email);
        console.log("Message:", message);
        setOpen(false); // Close the modal after submission
        // Optionally, reset fields
        setEmail("");
        setMessage("");
    };

    return (
        <Modal open={open} onClose={() => setOpen(false)}>
            <ModalContainer>
                <h2>Contact Us</h2>
                <form onSubmit={handleSubmit}>
                    <TextField
                        label="Your Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        fullWidth
                        required
                        margin="normal"
                    />
                    <TextField
                        label="Your Message"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        multiline
                        rows={4}
                        fullWidth
                        required
                        margin="normal"
                    />
                    <Button type="submit" variant="contained" color="primary">
                        Send Message
                    </Button>
                </form>
            </ModalContainer>
        </Modal>
    );
};

export default ContactUsModal;

const ModalContainer = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background-color: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  width: 400px;
`;