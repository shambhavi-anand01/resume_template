// import React, { createContext, useState, useEffect } from "react";
// import axios from "axios";

// export const AuthContext = createContext();

// export const AuthProvider = ({ children }) => {
//   const [user, setUser] = useState(null);
//   const [loading, setLoading] = useState(true);
//   useEffect(() => {
//     axios.get("http://localhost:5000/auth/me", { withCredentials: true })
//       .then((res) => setUser(res.data.user))
//       .catch(() => setUser(null))
//       .finally(() => setLoading(false));
//   }, []);

//   const login = async (email, password) => {
//     const res = await axios.post("http://localhost:5000/auth/login", { email, password }, { withCredentials: true });
//     console.log(res, "000000")
//     setUser(res.data.user);

//   };

//   const signup = async (name, email, password, userType) => {
//     const res1= await axios.post("http://localhost:5000/auth/signup", { name, email, password, userType });
//     console.log(res1, "1111")

//   };

//   const logout = async () => {
//     await axios.post("http://localhost:5000/auth/logout", { withCredentials: true });
//     setUser(null);
//   };

//   return <AuthContext.Provider value={{ user, login, signup, logout, loading }}>{children}</AuthContext.Provider>;
// };





// import React, { createContext, useState, useEffect } from "react";
// import axios from "axios";

// export const AuthContext = createContext();

// export const AuthProvider = ({ children }) => {
//   const [user, setUser] = useState(null);
//   const [loading, setLoading] = useState(true);

//   // 🔹 Check if user is logged in (runs on mount)
//   useEffect(() => {
//     const token = localStorage.getItem("token");
//     if (!token) {
//       setUser(null);
//       setLoading(false);
//       return;
//     }

//     axios.get("http://localhost:5000/auth/me", {
//       headers: { Authorization: `Bearer ${token}` }, // Send stored token
//     })
//       .then((res) => setUser(res.data.user))
//       .catch(() => {
//         setUser(null);
//         localStorage.removeItem("token"); // Remove invalid token
//       })
//       .finally(() => setLoading(false));
//   }, []);

//   // 🔹 Login function
//   const login = async (email, password) => {
//     try {
//       const res = await axios.post("http://localhost:5000/auth/login", { email, password }, {withCredentials: true});

//       if (res.data.token) {
//         localStorage.setItem("token", res.data.token); // Store token in localStorage
//         setUser(res.data.user);
//       } else {
//         throw new Error("Invalid login response");
//       }
//     } catch (error) {
//       console.error("Login error:", error);
//       throw new Error(error.response?.data?.message || "Login failed");
//     }
//   };

//   // 🔹 Signup function
//   const signup = async (name, email, password, userType) => {
//     try {
//       await axios.post("http://localhost:5000/auth/signup", { name, email, password, userType });
//     } catch (error) {
//       console.error("Signup error:", error);
//       throw new Error(error.response?.data?.message || "Signup failed");
//     }
//   };

//   // 🔹 Logout function
//   const logout = async () => {
//     try {
//       await axios.get("http://localhost:5000/auth/logout"); // Logout request
//       localStorage.removeItem("token"); // Remove token
//       setUser(null);
//     } catch (error) {
//       console.error("Logout error:", error);
//     }
//   };

//   return (
//     <AuthContext.Provider value={{ user, login, signup, logout, loading }}>
//       {children}
//     </AuthContext.Provider>
//   );
// };


import React, { createContext, useState, useEffect } from "react";
import axios from "axios";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // 🔹 Check if user is logged in (runs on mount)
  useEffect(() => {
    axios.get("http://localhost:5000/auth/me", { withCredentials: true })  // ✅ Automatically sends cookies
      .then((res) => {
        console.log("User data from /auth/me:", res.data);  // Debugging
        setUser(res.data.user);
      })
      .catch((err) => {
        console.error("Auth check error:", err);
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, []);

  // 🔹 Login function
  const login = async (email, password) => {
    try {
      const res = await axios.post(
        "http://localhost:5000/auth/login",
        { email, password },
        { withCredentials: true }  // ✅ Ensures cookies are stored
      );

    //   console.log("Login response:", res.data);  // Debugging
    if (res.data.user) {
      setUser(res.data.user);
      return res.data.user;
    } else {
        throw new Error("Invalid login response");
      }
    } catch (error) {
      console.error("Login error:", error);
      throw new Error(error.response?.data?.message || "Login failed");
    }
  };

  const signup = async (name, email, password, userType) => {
    try {
        console.log("Signup request sent:", { name, email, password, userType });
        const response = await fetch("http://localhost:5000/auth/signup", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name, email, password, userType }),
        });

        const text = await response.text();  // 🔹 Get raw response (for debugging)
        console.log("Raw response:", text);

        const data = JSON.parse(text);
        console.log("Parsed JSON:", data);
        if (!response.ok) {
            throw new Error(data.message || "Signup failed");
        }
        return data;
    } catch (error) {
        throw new Error(error.message);
    }
};
  // 🔹 Logout function
  const logout = async () => {
    try {
      await axios.get("http://localhost:5000/auth/logout", { withCredentials: true });  // ✅ Logout request with cookies
      setUser(null);
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, signup, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

