import { useState } from "react";

import "./Signup.css";


function Signup() {

    const [name, setName] = useState("");

    const [email, setEmail] = useState("");

    const [password, setPassword] = useState("");

    const [phone, setPhone] = useState("");


    const handleSignup = async (event) => {

        event.preventDefault();


        try {

            const response = await fetch(
                "http://127.0.0.1:5000/signup",
                {
                    method: "POST",

                    headers: {
                        "Content-Type": "application/json"
                    },

                    body: JSON.stringify({

                        name: name,

                        email: email,

                        password: password,

                        phone: phone

                    })
                }
            );


            const data = await response.json();


            if (response.ok) {

                alert(
                    "Signup successful!"
                );


                setName("");

                setEmail("");

                setPassword("");

                setPhone("");


                window.location.href =
                    "/farmer/login";


            } else {

                alert(data.message);

            }


        } catch (error) {

            console.error(error);

            alert(
                "Cannot connect to Flask server"
            );

        }

    };


    return (

        <div className="signup-page">

            <div className="signup-card">

                <h1>🌾 Smart Farming</h1>

                <h2>Farmer Signup</h2>


                <form
                    onSubmit={handleSignup}
                >


                    <input
                        type="text"
                        placeholder="Enter Name"
                        value={name}
                        onChange={(event) =>
                            setName(event.target.value)
                        }
                        required
                    />


                    <input
                        type="email"
                        placeholder="Enter Email"
                        value={email}
                        onChange={(event) =>
                            setEmail(event.target.value)
                        }
                        required
                    />


                    <input
                        type="password"
                        placeholder="Enter Password"
                        value={password}
                        onChange={(event) =>
                            setPassword(event.target.value)
                        }
                        required
                    />


                    <input
                        type="tel"
                        placeholder="Enter Phone Number"
                        value={phone}
                        onChange={(event) =>
                            setPhone(event.target.value)
                        }
                        required
                    />


                    <button type="submit">
                        Signup
                    </button>

                </form>


                <p>
                    Already have an account?
                </p>


                <a href="/farmer/login">
                    Login
                </a>

            </div>

        </div>

    );
}


export default Signup;