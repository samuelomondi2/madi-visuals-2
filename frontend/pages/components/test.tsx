import React, { useState } from "react";

const PopupForm: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    alert("Form submitted!");
    setIsOpen(false);
  };

  return (
    <div>
      <button onClick={() => setIsOpen(true)}>Open Form</button>

      {isOpen && (
        <div style={overlayStyle}>
          <div style={popupStyle}>
            <h2>Contact Form</h2>

            <form onSubmit={handleSubmit}>
              <input type="text" placeholder="Name" required />
              <input type="email" placeholder="Email" required />
              <textarea placeholder="Message" required />

              <div style={{ marginTop: "10px" }}>
                <button type="submit">Submit</button>
                <button type="button" onClick={() => setIsOpen(false)}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

const overlayStyle: React.CSSProperties = {
  position: "fixed",
  top: 0,
  left: 0,
  width: "100%",
  height: "100%",
  background: "rgba(0,0,0,0.5)",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
};

const popupStyle: React.CSSProperties = {
  background: "white",
  padding: "20px",
  borderRadius: "8px",
  width: "300px",
};

export default PopupForm;
