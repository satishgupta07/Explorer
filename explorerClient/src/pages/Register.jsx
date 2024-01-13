import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { registerUser } from "../services/auth";
import Swal from "sweetalert2";

const signupInitialValues = {
  name: "",
  email: "",
  password: "",
  confirm_password: "",
  avatar: "",
};

function Register() {
  const navigate = useNavigate();
  const [signup, setSignup] = useState(signupInitialValues);
  const [loading, setLoading] = useState(false);

  const onInputChange = (e) => {
    setSignup({ ...signup, [e.target.name]: e.target.value });
  };

  // Handle file input separately
  const onFileChange = (e) => {
    setSignup({ ...signup, avatar: e.target.files[0] });
  };

  const signupUser = async (e) => {
    e.preventDefault();
    setLoading(true); // Set loading state to true

    try {
      const formData = new FormData();
      Object.entries(signup).forEach(([key, value]) => {
        formData.append(key, value);
      });

      console.log(formData);

      let response = await registerUser(formData);
      console.log(response);
      if (response.data.success) {
        Swal.fire({
          title: "User Registered Successfully !!",
          icon: "success",
        });
        navigate("/login");
      }
    } catch (error) {
      console.error("Error while registering user !!", error);
    } finally {
      setLoading(false); // Set loading state to false after the request is complete
    }
  };

  return (
    <div className="bg-gray-200 flex justify-center items-center">
      <div className="flex justify-center items-center lg:w-2/5 md:w-1/2 w-full p-8">
        <div className="bg-white shadow-lg rounded-lg w-full flex min-h-full flex-1 flex-col justify-center px-6 py-12 lg:px-8">
          <div className="sm:mx-auto sm:w-full sm:max-w-sm">
            <img
              className="mx-auto h-10 w-auto"
              src="https://tailwindui.com/img/logos/mark.svg?color=indigo&shade=600"
              alt="Your Company"
            />
            <h2 className="mt-10 text-center text-2xl font-bold leading-9 tracking-tight text-gray-900">
              Sign up to your account
            </h2>
          </div>

          <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
            <form className="space-y-6" onSubmit={signupUser}>
              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-medium leading-6 text-gray-900"
                >
                  Full Name
                </label>
                <div className="mt-2">
                  <input
                    id="name"
                    name="name"
                    onChange={(e) => onInputChange(e)}
                    type="text"
                    required
                    className="flex h-10 w-full rounded-md border border-gray-300 bg-transparent px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-600 focus:ring-offset-0 disabled:cursor-not-allowed disabled:opacity-50"
                  />
                </div>
              </div>
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium leading-6 text-gray-900"
                >
                  Email address
                </label>
                <div className="mt-2">
                  <input
                    id="email"
                    name="email"
                    onChange={(e) => onInputChange(e)}
                    type="email"
                    autoComplete="email"
                    required
                    className="flex h-10 w-full rounded-md border border-gray-300 bg-transparent px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-600 focus:ring-offset-0 disabled:cursor-not-allowed disabled:opacity-50"
                  />
                </div>
              </div>
              <div>
                <label
                  className="block text-sm font-medium leading-6 text-gray-900"
                  htmlFor="avatar"
                >
                  Upload file
                </label>
                <div className="mt-2">
                  <input
                    className="flex h-11 p-1 w-full rounded-md border border-gray-300 bg-transparent file:me-4 file:py-2 file:px-4
                      file:rounded-lg file:border-0
                      file:text-sm file:font-semibold
                      file:bg-blue-600 file:text-white
                      hover:file:bg-blue-700
                      file:disabled:opacity-50 file:disabled:pointer-events-none"
                    aria-describedby="file_input_help"
                    type="file"
                    name="avatar"
                    onChange={onFileChange}
                  />
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between">
                  <label
                    htmlFor="password"
                    className="block text-sm font-medium leading-6 text-gray-900"
                  >
                    Password
                  </label>
                </div>
                <div className="mt-2">
                  <input
                    id="password"
                    name="password"
                    onChange={(e) => onInputChange(e)}
                    type="password"
                    autoComplete="current-password"
                    required
                    className="flex h-10 w-full rounded-md border border-gray-300 bg-transparent px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-600 focus:ring-offset-0 disabled:cursor-not-allowed disabled:opacity-50"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between">
                  <label
                    htmlFor="confirm_password"
                    className="block text-sm font-medium leading-6 text-gray-900"
                  >
                    Confirm Password
                  </label>
                </div>
                <div className="mt-2">
                  <input
                    id="confirm_password"
                    name="confirm_password"
                    onChange={(e) => onInputChange(e)}
                    type="password"
                    required
                    className="flex h-10 w-full rounded-md border border-gray-300 bg-transparent px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-600 focus:ring-offset-0 disabled:cursor-not-allowed disabled:opacity-50"
                  />
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  className="flex w-full justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                  disabled={loading} // Disable the button while loading
                >
                  {loading ? "Signing Up..." : "Sign Up"}
                </button>
              </div>
            </form>

            <p className="mt-10 text-center text-sm text-gray-500">
              Already have an account?{" "}
              <Link
                to="/login"
                className="font-semibold leading-6 text-indigo-600 hover:text-indigo-500"
              >
                Sign In
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Register;
