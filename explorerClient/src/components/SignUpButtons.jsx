import React from "react";
import { Link } from "react-router-dom";

const navigation = [
  { name: "Sign In", href: "/login", current: false},
  { name: "Sign Up", href: "/register", current: false},
];

function classNames(...classes) {
  return classes.filter(Boolean).join(" ");
}

function SignUpButtons() {
  return (
    <>
      {navigation.map((item) => (
        <Link
          key={item.name}
          to={item.href}
          className={classNames(
            item.current
              ? "bg-gray-900 text-white"
              : "text-gray-300 hover:bg-gray-700 hover:text-white",
            "rounded-md px-3 py-2 text-sm font-medium"
          )}
        >
          {item.name}
        </Link>
      ))}
    </>
  );
}

export default SignUpButtons;
